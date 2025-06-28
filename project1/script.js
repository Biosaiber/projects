console.log("script loaded");

// empty template for factory function:
function createTodo(text) {
  return {
    id: Date.now(),       // unique ID pomocou timestampu
    text: text,           // samotný text úlohy
    completed: false      // či je dokončená
  };
}

const taskList = [];

function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.innerHTML = ""; // clear list

  todos.forEach(todo =>{
    const li = createElement("li");
    li.textContent = todo.text;
    list.appendChild(li);
  });
}

const newTask = createTodo("Urobiť domácu úlohu");

const newTask2 = createTodo("halooo");


renderTodos(taskList);
