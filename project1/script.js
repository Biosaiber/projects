// ✅ Smart Todo App so zmazaním úloh a localStorage

console.log("script loaded"); // log do konzoly že sa skript načítal

// 🏭 Factory funkcia na vytvorenie novej úlohy
function createTodo(text) {
  return {
    id: Date.now(), // unikátne ID podľa času
    text: text, // text úlohy
    completed: false, // či je úloha hotová
  };
}

// 💾 Funkcia na uloženie aktuálneho zoznamu úloh do localStorage
function saveTodosToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(taskList)); // prevedieme pole na string a uložíme pod kľúčom "todos"
}

// 🔄 Funkcia na načítanie úloh z localStorage pri načítaní stránky
function loadTodosFromLocalStorage() {
  const saved = localStorage.getItem("todos"); // načítame uložený string zo storage

  if (saved) {
    const parsed = JSON.parse(saved); // prevedieme string naspäť na pole objektov
    taskList.push(...parsed); // vložíme načítané úlohy do nášho zoznamu
    renderTodos(taskList); // vykreslíme úlohy do DOMu
  }
}

const taskList = []; // hlavný zoznam úloh (pamäť aplikácie)

// 🎨 Funkcia na vykreslenie všetkých úloh do HTML
function renderTodos(todos) {
  const list = document.getElementById("todo-list"); // zoberieme <ul> z HTML
  list.innerHTML = ""; // vyčistíme predchádzajúci obsah

  todos.forEach((todo) => {
    const li = document.createElement("li"); // vytvoríme nový <li> pre každú úlohu

    const checkbox = document.createElement("input"); // vytvoríme checkbox
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed; // nastavíme, či je zaškrtnutý
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked; // aktualizujeme stav úlohy
      renderTodos(taskList); // znova prekreslíme
      saveTodosToLocalStorage(); // uložíme zmenu do storage
    });

    const p = document.createElement("p"); // vytvoríme <p> pre text úlohy
    p.textContent = todo.text;
    if (todo.completed) {
      p.style.textDecoration = "line-through"; // ak je hotová, prečiarkneme text
    }

    const deleteBtn = document.createElement("button"); // tlačidlo na zmazanie
    deleteBtn.textContent = "🗑️";
    deleteBtn.setAttribute("aria-label", "Zmazať úlohu"); // pre čítačky obrazovky
    deleteBtn.addEventListener("click", () => {
      const index = taskList.findIndex((t) => t.id === todo.id); // nájdeme index úlohy
      if (index !== -1) {
        taskList.splice(index, 1); // vymažeme úlohu zo zoznamu
        renderTodos(taskList); // znova prekreslíme
        saveTodosToLocalStorage(); // uložíme zmenu
      }
    });

    // pridáme všetky elementy do <li> a následne do zoznamu
    li.appendChild(checkbox);
    li.appendChild(p);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

loadTodosFromLocalStorage(); // načítame úlohy po načítaní stránky

// 🧾 Pridávanie novej úlohy po kliknutí na tlačidlo
const input = document.getElementById("todo-input"); // input pre text úlohy
const addButton = document.getElementById("add-task"); // tlačidlo "Pridať úlohu"

addButton.addEventListener("click", () => {
  const text = input.value.trim(); // zoberieme text z inputu a odstránime medzery
  if (text === "") {
    alert("Please enter task description!"); // ak je prázdny, upozorníme
    return;
  }

  const newTask = createTodo(text); // vytvoríme novú úlohu
  taskList.push(newTask); // pridáme do zoznamu
  renderTodos(taskList); // vykreslíme
  saveTodosToLocalStorage(); // uložíme do localStorage
  input.value = ""; // vyčistíme input
});
