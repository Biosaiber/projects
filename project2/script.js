console.log("script loaded");


// Zachycujem klik na button, načítavam hodnotu z inputu, spustim fetch.

document.getElementById("searchBtn").addEventListener("click", () => {
  const name = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!name) return;
  fetchPokemon(name);
});


// using async/await alebo na zavolanie API
async function fetchPokemon(name) {
    try {
        showloading(true);
        hideError();

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) throw new Error("Pokemon not found");
        const data = await response.json();
        console.log(pokemon);
        displayResult(data);
    } catch(err) {
        showError(err.message);
    } finally {
        showloading(false);
    }
}

// function display data
// Dynamic create  DOM parts and display a meno, types, pictures, height, weight

function displayResult(data) {
    const container = document.getElementById("result");
    container.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${data.sprites.front_default}" alt="${data.name}" />
        <p>Types: ${data.types.map((type) => type.type.name).join(", ")}</p>
        <p>Height: ${data.height}</p>
        <p>Weight: ${data.weight}</p>
    `;
}

// Error handling a loading stav

// Loading
function showloading(show) {
    document.getElementById("loading").style.display = show ? "block" : "none";
}

// Error messsage
function showError(message) {
    const errDiv = document.getElementById("error");
    errDiv.style.display = "block";
    errDiv.textContent = message;
}

// Clear error message
function hideError() {
  document.getElementById("error").style.display = "none";
}