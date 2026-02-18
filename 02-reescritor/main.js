let rewriter;

let generateBtn = document.querySelector("#generateBtn");

if (!generateBtn) {
    console.error('Botón #generateBtn no encontrado en el DOM');
} else {
    generateBtn.addEventListener("click", async () => {

        const text = document.querySelector("#text").value.trim();
        const tone = document.querySelector("#tone").value;
        const length = document.querySelector("#length").value;
        const output = document.querySelector("#output");

        output.textContent = "Comprobando disponibilidad...";

        // Comprobar soporte
        if (!('Rewriter' in self)) {
            output.textContent = "Esta versión de tu navegador no admite la API de Rewriter.";
            return;
        }

        // ✔ MÉTODO DE LA CLASE, NO DE LA VARIABLE
        const disponible = await Rewriter.availability();

        if (disponible === "unavailable") {
            output.textContent = "El API de Rewriter no está disponible ahora.";
            return;
        }

        const options = {
            tone,
            length,
            format: "plain-text",
            sharedContext: "Reescritura de texto a petición del usuario",
            outputLanguage: "es"
        };

        // ✔ CREACIÓN CORRECTA DE LA INSTANCIA
        if (disponible === "available") {
            rewriter = await Rewriter.create(options);
        } else {
            rewriter = await Rewriter.create({
                ...options,
                monitor(m) {
                    m.addEventListener("downloadprogress", e => {
                        output.textContent = "Descargando modelo de IA local: " + Math.round(e.loaded * 100) + "%";
                    });
                }
            });
        }

        output.textContent = "Generando texto...";

        try {
            // ✔ rewriter.rewrite() se llama sobre la instancia creada
            const result = await rewriter.rewrite(text, {
                outputLanguage: "es",
                context: "Mejora el texto evitando el lenguaje tóxico y maleducado, mejorando la comprensión y corrigiendo faltas de ortografía."
            });

            output.textContent = result;

        } catch (err) {
            console.error('Error al generar texto:', err);
            output.textContent = "Error al generar el texto: " + (err?.message || String(err));
        }
    });
}