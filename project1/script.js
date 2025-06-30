console.log("script loaded");

// empty template for factory function:
function createTodo(text) {
  return {
    id: Date.now(), // unique ID pomocou timestampu
    text: text, // samotný text úlohy
    completed: false, // či je dokončená
  };
}

const taskList = [];

function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.innerHTML = ""; // clear list

  todos.forEach((todo) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      renderTodos(taskList);
    });

    const p = document.createElement("p");
    p.textContent = todo.text;
    if (todo.completed) {
      p.style.textDecoration = "line-through";
    }
    
    li.appendChild(checkbox);
    li.appendChild(p);
    list.appendChild(li);


  });
}

const newTask = createTodo("Urobiť domácu úlohu");
const newTask2 = createTodo("halooo");

taskList.push(newTask, newTask2);

renderTodos(taskList);

const input = document.getElementById("todo-input");
const addButton = document.getElementById("add-task");

addButton.addEventListener("click", () => {
  const text = input.value.trim();
  if (text === "") {
    alert("Please enter task description!");
    return;
  }

  const newTask = createTodo(text);
  taskList.push(newTask);
  renderTodos(taskList);
  input.value = "";
});
