# Reescritor con IA local y privada

> Demo que utiliza la (hipotética) API `Rewriter` para reescribir y mejorar texto localmente o mediante fallback remoto.

Contenido
- Descripción
- Archivos clave
- Cómo ejecutar
- Comportamiento de la API `Rewriter`
- Advertencias comunes y soluciones (Chrome)
- Compatibilidad on-device por dispositivo
- Ejemplos y debugging

## Descripción

`02-reescritor` es una pequeña aplicación que toma un texto de entrada y lo reescribe según parámetros de tono y longitud. Está pensada para demostrar el flujo básico con una API llamada `Rewriter` que puede ejecutar modelos on-device o usar un fallback remoto cuando el dispositivo no es elegible.

La app aplica corrección ortográfica, mejora de claridad y adaptación de tono dependiendo de las opciones elegidas.

## Archivos clave

- [index.html](index.html) — Interfaz de usuario (textarea `#text`, selects `#tone` y `#length`, botón `#generateBtn`, contenedor `#output`).
- [main.js](main.js) — Lógica: comprobación de disponibilidad con `Rewriter.availability()`, creación de instancia con `Rewriter.create(...)` y llamada a `rewriter.rewrite(...)`.
- [styles.css](styles.css) — Estilos de la interfaz.

## Cómo ejecutar

1. Abrir `02-reescritor/index.html` en un navegador moderno (Chrome recomendado para pruebas).
2. Pegar o escribir el texto a reescribir en la caja, seleccionar `Tono` y `Longitud` y pulsar el botón "Reescribir texto".
3. Revisar la salida en el panel `#output` y la consola de DevTools para mensajes de diagnóstico.

No se necesitan dependencias: basta abrir el HTML localmente.

## Comportamiento y uso de la API `Rewriter`

Resumen de las llamadas usadas en `main.js`:

- `Rewriter.availability()` — Consulta si la plataforma puede ejecutar un modelo on-device (posibles valores: `"available"`, `"unavailable"`, etc.).
- `Rewriter.create(options)` — Crea la instancia del reescritor. Opciones usadas en la demo:
  - `tone`, `length`, `format` — Preferencias de salida.
  - `outputLanguage` — Código de idioma (ej. `"es"`) para evitar advertencias y asegurar calidad de salida.
  - `sharedContext` — Contexto global para la generación.
  - `monitor` — Función para recibir eventos de progreso (p.ej. `downloadprogress`).
- `rewriter.rewrite(text, params)` — Solicita la reescritura. Parámetros útiles:
  - `outputLanguage` / `language` — Idioma de la petición.
  - `context` — Instrucciones adicionales de reescritura (p.ej. evitar lenguaje ofensivo, corregir ortografía).

Buenas prácticas implementadas en `main.js`:

- Especificar `outputLanguage: "es"` al crear la instancia para evitar la advertencia "No output language was specified".
- Envolver la llamada a `rewriter.rewrite` en `try/catch` para mostrar errores legibles en `#output`.
- Proveer un `monitor` para informar progreso cuando la API descarga un modelo on-device.

## Advertencias comunes y cómo interpretarlas (Chrome)

- "No output language was specified in a Writer API request": solución — pasar `outputLanguage` en `Rewriter.create` o `language` en la petición.
- "The device is not eligible for running on-device model": indica que el navegador/hardware no cumple requisitos para ejecutar localmente. La API puede ofrecer fallback remoto o devolver `unavailable`.

Qué comprobar si ves la advertencia en Chrome:

- Versión de Chrome (usar una versión reciente mejora soporte WASM SIMD/threads y WebNN).
- Soporte de WebAssembly con SIMD y Threads en el navegador y flags necesarios para pruebas (no recomendado en producción).
- Capacidad del hardware (instrucciones vectoriales, núcleos, memoria disponible).
- Si sirve archivos desde filesystem, comprobar políticas de CORS/serving si se requiere descarga remota.

## Compatibilidad on-device (resumen por dispositivo)

- Escritorio Windows/Linux (CPU moderna con AVX2): alta probabilidad de elegibilidad si Chrome soporta WASM SIMD/Threads.
- macOS (Intel / Apple Silicon): Apple Silicon suele rendir bien; depende de builds optimizados para ARM.
- Chromebooks y dispositivos con ChromeOS: muy variable según CPU y versión.
- Móviles (Android/iOS): normalmente no elegibles para modelos grandes; se suele usar fallback remoto.
- Máquinas virtuales / contenedores: muchas VMs no exponen aceleración y pueden ser ineligibles.

Usa `Rewriter.availability()` para decidir la ruta (on-device vs remoto) y comunica el estado claramente al usuario.

## Ejemplos de debugging (extractos relevantes de `main.js`)

```javascript
const disponible = await Rewriter.availability();
if (disponible === 'unavailable') {
  // informar al usuario o usar fallback remoto
}

const rewriter = await Rewriter.create({ outputLanguage: 'es', /* ... */ });
try {
  const result = await rewriter.rewrite(text, {
    outputLanguage: 'es',
    context: 'Mejora el texto corrigiendo ortografía y evitando lenguaje ofensivo.'
  });
  // mostrar resultado en #output
} catch (err) {
  // manejar y mostrar el error
}
```

## Recomendaciones

- Siempre especifica idioma (`es`, `en`, etc.) en opciones y en la petición.
- Muestra feedback de progreso al usuario (descarga de modelo, disponibilidad).
- Añade un fallback claro: si `Rewriter.availability()` indica `unavailable`, ofrecer reintento remoto o mensaje explicativo.

---

Si quieres, puedo:

- Implementar en la UI un indicador que muestre si se está usando modelo on-device o remoto.
- Añadir un botón para forzar fallback remoto y probar esa ruta.
- Buscar y añadir enlaces oficiales (documentación de la API `Rewriter` y guías sobre WebAssembly/WebNN) si me autorizas a consultar la web.

Archivo creado: [02-reescritor/README.md](README.md)
# Escritor con IA local y privada

> Pequeña app de ejemplo que utiliza la API `Writer` para generar texto localmente o mediante fallback remoto.

Contenido
- Descripción
- Archivos clave
- Cómo ejecutar
- Comportamiento de la API `Writer`
- Advertencias comunes y soluciones (Chrome)
- Compatibilidad on-device por tipo de dispositivo
- Ejemplos y debugging

## Descripción

Este proyecto es un ejemplo mínimo de un "escritor" que toma una idea breve del usuario y genera texto mediante una API llamada `Writer`. La intención es mostrar cómo:

- Comprobar disponibilidad con `Writer.availability()`.
- Crear una instancia con `Writer.create(options)`.
- Solicitar generación con `writer.write(prompt, params)`.

El código de la interfaz se encuentra en `index.html`, estilos en `styles.css` y la lógica en `main.js`.

## Archivos clave

- [index.html](index.html) — Interfaz de usuario (textarea, selects, botón, contenedor de salida).
- [main.js](main.js) — Lógica: comprobación de disponibilidad, creación de instancia, generación y manejo de errores.
- [styles.css](styles.css) — Estilos básicos.

## Cómo ejecutar

1. Abrir `01-escritor/index.html` en un navegador moderno (Chrome recomendable para desarrollo).
2. Escribir una idea en la caja, elegir tono y longitud y pulsar "✏️Generar texto".
3. Consultar la consola de desarrollador (DevTools) para ver advertencias o errores.

No se requieren dependencias ni servidor para esta demo; basta abrir el archivo localmente.

## Comportamiento y uso de la API `Writer`

Resumen de las llamadas principales usadas en `main.js`:

- `Writer.availability()` — Consulta si la plataforma puede ejecutar un modelo on-device. Devuelve por ejemplo `"available"`, `"unavailable"` u otros estados.
- `Writer.create(options)` — Crea/instancia el escritor. Opciones comunes:
  - `tone`, `length`, `format` — Preferencias de salida.
  - `outputLanguage` — Código de idioma recomendado (ej. `"es"`, `"en"`). Evita advertencias de la API y mejora seguridad/seguridad de contenido.
  - `sharedContext` — Contexto global compartido para la generación.
  - `monitor` — Callback para eventos de progreso (p.ej. `downloadprogress`).
- `writer.write(prompt, params)` — Solicita generación. Parámetros útiles:
  - `language` — Idioma de la petición (ej. `"es"`).
  - `context` — Contexto puntual para esta petición.

Recomendaciones en código:

- Siempre especificar `outputLanguage`/`language` para evitar la advertencia "No output language was specified".
- Envolver llamadas de red ó generación en `try/catch` para mostrar errores al usuario y evitar rejections no controladas.
- Escuchar `monitor`/eventos para informar progreso de descarga de modelos on-device.

## Advertencias comunes y cómo interpretarlas (especialmente en Chrome)

- "No output language was specified in a Writer API request": la solución es pasar `outputLanguage` en `Writer.create` y/o `language` en `writer.write`.
- "The device is not eligible for running on-device model": indica que el navegador/hardware no cumple los requisitos para ejecutar el modelo localmente. No siempre es fatal: la API puede caer en un fallback remoto o devolver un estado `unavailable`.

Qué comprobar en Chrome si ves esta advertencia:

- Versión de Chrome: usar una versión actualizada mejora compatibilidad con WASM SIMD/Threads y WebNN.
- Flags/Features: en ocasiones, para pruebas locales hay que habilitar experimental flags (no recomendado para producción).
- Hardware: CPUs sin soporte SIMD/AVX o sin capacidades multi-threading en WASM pueden ser ineligibles.
- Políticas de seguridad: si la app espera acceso a recursos locales, comprueba permisos y políticas de CORS/serving.

## Compatibilidad on-device (resumen por tipo de dispositivo)

Nota: los requisitos exactos dependen de la implementación de la API `Writer` y del proveedor del modelo. Aquí tienes una guía práctica basada en comportamientos frecuentes:

- Escritorio Windows/Linux con CPU moderna (AVX2, múltiples núcleos):
  - Alta probabilidad de que sea elegible para on-device si Chrome soporta WASM SIMD y threads. Si no, la API normalmente usará un fallback remoto.

- Mac (Intel con AVX) vs Apple Silicon (M1/M2):
  - Apple Silicon suele tener buen rendimiento; sin embargo, la compatibilidad depende de si el runtime del modelo tiene builds optimizados para ARM macOS/wasm-aarch64.

- Chromebooks / dispositivos con ChromeOS:
  - Depende mucho del modelo de CPU y la versión de ChromeOS; muchos Chromebooks económicos no tendrán recursos suficientes.

- Móviles (Android / iOS):
  - Generalmente no elegibles para modelos on-device pesados; limitación por CPU, memoria y soporte de WASM/threads. Es común que la API use un modelo remoto.

- Máquinas virtuales / contenedores en la nube:
  - Muchas VMs no exponen instrucciones vectoriales o aceleración, por lo que pueden ser ineligibles.

Consejo práctico: usar `Writer.availability()` y mostrar al usuario un mensaje claro si el dispositivo no es apto, ofreciendo la opción de intentar un fallback remoto.

## Ejemplos de debugging rápido

- Verificar advertencias en la consola (DevTools). Mensajes típicos:
  - "No output language was specified..." → Añadir `outputLanguage: "es"`.
  - "device not eligible..." → Comprobar `Writer.availability()` para saber si la API ofrece fallback.

- Código útil (extracto de `main.js`):

```javascript
const disponible = await Writer.availability();
if (disponible === 'unavailable') {
  // informar al usuario o ofrecer fallback
}

const writer = await Writer.create({ outputLanguage: 'es', /* ... */ });
try {
  const result = await writer.write(prompt, { language: 'es' });
  // mostrar resultado
} catch (err) {
  // manejar error
}
```

## Referencias y lecturas recomendadas

- Revisa la documentación oficial del proveedor de la API `Writer` (si la hay) para requisitos exactos de on-device, builds soportados y códigos de idioma.
- Para temas de WebAssembly y soporte de SIMD/Threads consulta documentación de MDN y del equipo de Chromium sobre `wasm-simd` y `wasm-threads`.

---

Si quieres, puedo:

- Añadir detección y UI para mostrar si la app está usando modelo remoto u on-device.
- Implementar un fallback explícito que fuerce el uso remoto cuando el dispositivo sea ineligible.
- Buscar y añadir enlaces oficiales concretos (documentación del proveedor `Writer`, guías de WebNN/WASM) si me autorizas a consultar la web ahora.

Archivo creado: [01-escritor/README.md](01-escritor/README.md)