const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

async function init() {
    const cityInput = document.querySelector("#cityInput");
    const searchBtn = document.querySelector("#searchBtn");
    const status = document.querySelector("#status");
    const weatherInfo = document.querySelector("#weatherInfo");

    // Ocultar información inicial
    weatherInfo.style.display = "none";
    status.innerHTML = "🌍 Ingresa una ciudad para ver su clima";

    searchBtn.addEventListener("click", async () => {
        const city = cityInput.value.trim();

        if (!city) {
            status.innerHTML = "❓ Por favor ingresa el nombre de una ciudad";
            weatherInfo.style.display = "none";
            return;
        }

        status.innerHTML = "🔍 Buscando ciudad...";
        weatherInfo.style.display = "none";

        try {
            // Paso 1: Obtener coordenadas de la ciudad
            const geoResponse = await fetch(
                `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
            );

            if (!geoResponse.ok) {
                throw new Error("Error en búsqueda de ciudad");
            }

            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                status.innerHTML = `❌ No se encontró la ciudad "${city}"`;
                weatherInfo.style.display = "none";
                return;
            }

            const location = geoData.results[0];
            const latitude = location.latitude;
            const longitude = location.longitude;
            const cityName = `${location.name}, ${location.admin1 || ""} ${location.country}`.trim();

            status.innerHTML = "⛅ Obteniendo datos de clima...";

            // Paso 2: Obtener datos del clima
            const weatherResponse = await fetch(
                `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m&temperature_unit=celsius&timezone=auto`
            );

            if (!weatherResponse.ok) {
                throw new Error("Error obteniendo datos de clima");
            }

            const weatherData = await weatherResponse.json();
            const current = weatherData.current;

            // Mostrar información del clima
            displayWeather(cityName, current);
            status.innerHTML = "✅ Clima obtenido correctamente";
            weatherInfo.style.display = "block";

        } catch (error) {
            console.error("Error:", error);
            status.innerHTML = `❌ Error al obtener datos: ${error.message}`;
            weatherInfo.style.display = "none";
        }
    });

    // Permitir búsqueda con Enter
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });
}

function displayWeather(cityName, weatherData) {
    document.querySelector("#cityName").textContent = cityName;
    document.querySelector("#mainTemp").textContent = `${Math.round(weatherData.temperature_2m)}°C`;
    document.querySelector("#humidity").textContent = `${weatherData.relative_humidity_2m}%`;
    document.querySelector("#windSpeed").textContent = `${Math.round(weatherData.wind_speed_10m)} km/h`;
    document.querySelector("#feelsLike").textContent = `${Math.round(weatherData.apparent_temperature)}°C`;
    document.querySelector("#windGust").textContent = `${Math.round(weatherData.wind_gusts_10m)} km/h`;

    // Actualizar descripción del clima según código WMO
    const description = getWeatherDescription(weatherData.weather_code);
    document.querySelector("#weatherDesc").textContent = description;
}

function getWeatherDescription(code) {
    const descriptions = {
        0: "☀️ Cielo despejado",
        1: "🌤️ Parcialmente nublado",
        2: "☁️ Nublado",
        3: "☁️ Muy nublado",
        45: "🌫️ Niebla",
        48: "🌫️ Escarcha con niebla",
        51: "🌧️ Llovizna ligera",
        53: "🌧️ Llovizna moderada",
        55: "🌧️ Llovizna densa",
        61: "🌧️ Lluvia ligera",
        63: "🌧️ Lluvia moderada",
        65: "🌧️ Lluvia fuerte",
        71: "❄️ Nieve ligera",
        73: "❄️ Nieve moderada",
        75: "❄️ Nieve fuerte",
        77: "❄️ Granos de nieve",
        80: "🌧️ Lluvia ligera",
        81: "🌧️ Lluvia moderada",
        82: "🌧️ Lluvia fuerte",
        85: "❄️ Nieve ligera",
        86: "❄️ Nieve fuerte",
        95: "⛈️ Tormenta con granizo",
        96: "⛈️ Tormenta con granizo ligero",
        99: "⛈️ Tormenta con granizo fuerte"
    };

    return descriptions[code] || "🌡️ Clima variable";
}

init();
