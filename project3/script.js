console.log("script loaded");

document.getElementById("searchBtn").addEventListener("click", () => {
    const place = document.getElementById("searchInput").value.trim();
    if (!place) return;
    console.log("Zadané miesto:", place);
    fetchWeather(place);
});

const apiKey = "6321a07a107f48b9999173419252007";

async function fetchWeather(place) {
    try {
        showLoading(true);
        hideError();

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${place}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Weather for "${place}" not found`);

        const data = await response.json();
        console.log(data);
    } catch(err) {
        console.error("Chyba pri fetche:", err);
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    document.getElementById("loading").style.display = show ? "block" : "none";
}

function showError(message) {
    const errDiv = document.getElementById("error");
    errDiv.style.display = "block";
    errDiv.textContent = message;
}

function hideError() {
    document.getElementById("error").style.display = "none";
}
