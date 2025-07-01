// ✅ Smart Todo App so zmazaním úloh

console.log("script loaded");

function createTodo(text) {
  return {
    id: Date.now(),
    text: text,
    completed: false,
  };
}

const taskList = [];

function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

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

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.setAttribute("aria-label", "Zmazať úlohu"); // prístupnosť
    deleteBtn.addEventListener("click", () => {
      const index = taskList.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        taskList.splice(index, 1);
        renderTodos(taskList);
      }
    });

    li.appendChild(checkbox);
    li.appendChild(p);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// testovacie úlohy
const newTask = createTodo("Urobiť domácu úlohu");
const newTask2 = createTodo("halooo");
taskList.push(newTask, newTask2);

renderTodos(taskList);

// pridávanie úlohy
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
