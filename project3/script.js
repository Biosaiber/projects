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

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${place}&days=7`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Weather for "${place}" not found`);

    const data = await response.json();
    console.log(data);
    console.log("Forecast:", data.forecast.forecastday);

    displayResult(data);
    displayHourly(data);
    displayForecast(data);
  } catch (err) {
    console.error("Chyba pri fetche:", err);
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

function displayResult(data) {
  const container = document.getElementById("currResult");
  const today = new Date();
  container.innerHTML = `
        <h2>${data.location.name}</h2>
        <h3>${today.toDateString()}</h3>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Condition: ${data.current.condition.text}</p>
        <img src="${data.current.condition.icon}" alt="${data.current.condition.text}" />
    `;
}
// function forecast for hourly curreny day
function displayHourly(data) {
  const hourlyDiv = document.getElementById("hourlyResult");

  let html = `<h2>Hourly forecast for ${data.location.name}</h2>`;
  html += `<div class="hourlycast">`;

  data.forecast.forecastday[0].hour.forEach((hour) => {
    // current hourly item
    const now = new Date();
    const currentHour = now.getHours(); // napr. 14
    const forecastHour = new Date(hour.time).getHours();
    const isNow = forecastHour === currentHour;
    console.log(isNow);

    html += `
      <div class="hour" ${isNow ? 'data-now="true"' : ""}>
        <p>${hour.time.split(" ")[1]}</p>
        <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" />
        <p>${hour.temp_c} °C</p>
        <p>${hour.condition.text}</p>
      </div>
    `;
  });
  html += `</div>`;
  hourlyDiv.innerHTML = html;
}

// function forecast for 7 days
function displayForecast(data) {
  const resultDiv = document.getElementById("dailyResult");

  let html = `<h2>Forecast for 7 days for ${data.location.name}</h2>`;
  html += `<div class="forecast">`;

  data.forecast.forecastday.forEach((day) => {
    html += `
      <div class="day">
        <p>${getWeekday(day.date)}</p>
        <p>${day.date}</p>
        <img src="https:${day.day.condition.icon}" alt="${
      day.day.condition.text
    }" />
        <p>${day.day.avgtemp_c} °C</p>
        <p>${day.day.condition.text}</p>
      </div>
    `;
  });
  html += `</div>`;
  resultDiv.innerHTML = html;
}

// function for weekly days name
function getWeekday(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { weekday: "long" });
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

// https://www.weatherapi.com/docs/
