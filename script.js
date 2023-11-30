let todos = [];
let notCompletedTodos = 0;

// all, active, completed
let displayMode = "all";

// Load data from localStorage -----------------------------------------------
const savedTodos = window.localStorage.getItem("todos");
todos = savedTodos ? JSON.parse(savedTodos) : todos;
displayMode = window.localStorage.getItem("displayMode") || displayMode;

// DOM elements ---------------------------------------------------------------
const itemsLeft = document.getElementById("items-left");
const todoItemsContainer = document.getElementById("todo-items-container");
const addTodoForm = document.getElementById("add-todo-form");
const addTodoInput = document.getElementById("add-todo-input");
const checkAllBtn = document.getElementById("check-all-btn");
const switchModeBtns = document
  .getElementById("switch-mode-btns")
  .getElementsByTagName("button");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

// Initial render -------------------------------------------------------------
updateNotCompletedTodos(todos.filter((todo) => !todo.completed).length);
renderAllTodos(todos, displayMode, todoItemsContainer);

// Additions funtions ------------------------------------------------------------------
// Render all todos
// Params: todos array, display mode, container contains all todo elements (div)
function renderAllTodos(todos, displayMode, container) {
  container.innerHTML = "";

  if (displayMode === "all") {
    todos.forEach((todo) => {
      container.appendChild(createTodoItem(todo));
    });
  }

  if (displayMode === "active") {
    todos
      .filter((todo) => !todo.completed)
      .forEach((todo) => {
        container.appendChild(createTodoItem(todo));
      });
  }

  if (displayMode === "completed") {
    todos
      .filter((todo) => todo.completed)
      .forEach((todo) => {
        container.appendChild(createTodoItem(todo));
      });
  }
}

// Handle update completed todos
// Params: number of not completed todos
function updateNotCompletedTodos(items) {
  itemsLeft.innerHTML = items;
  items === todos.length
    ? clearCompletedBtn.classList.add("hidden")
    : clearCompletedBtn.classList.remove("hidden");

  notCompletedTodos = items;
}

// Event listeners ------------------------------------------------------------
checkAllBtn.addEventListener("click", () => {
  if (notCompletedTodos === 0) {
    todos = todos.map((todo) => ({ ...todo, completed: false }));
    updateNotCompletedTodos(todos.length);
  } else {
    todos = todos.map((todo) => ({ ...todo, completed: true }));
    updateNotCompletedTodos(0);
  }

  renderAllTodos(todos, displayMode, todoItemsContainer);
});

[...switchModeBtns].forEach((btn) => {
  if (btn.dataset.mode === displayMode) {
    btn.classList.add("active");
  }

  btn.addEventListener("click", ({ target }) => {
    // Remove active class from all buttons
    [...switchModeBtns].forEach((btn) => btn.classList.remove("active"));
    target.classList.add("active");

    displayMode = target.dataset.mode;
    renderAllTodos(todos, displayMode, todoItemsContainer);
  });
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  renderAllTodos(todos, displayMode, todoItemsContainer);
  updateNotCompletedTodos(todos.length);
});

addTodoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const content = addTodoInput.value;
  addTodoItem(todos, content, todoItemsContainer);

  addTodoInput.value = "";
});

// Todos items functions ----------------------------------------------------------------
// Create todo item
// Return todo item element (div)
function createTodoItem(todo) {
  const { content, completed } = todo;

  const item = document.createElement("div");
  item.className = "todo-item";
  completed && item.classList.add("completed");

  const checkBtn = document.createElement("div");
  checkBtn.className = "check-btn";
  checkBtn.innerHTML = '<i class="bi bi-check2"></i>';

  const updateForm = document.createElement("form");
  const updateInput = document.createElement("input");
  updateInput.type = "text";
  updateInput.value = content;
  updateInput.className = "todo-item-input";
  updateInput.readOnly = true;
  updateForm.appendChild(updateInput);

  const deleteBtn = document.createElement("div");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';

  item.appendChild(checkBtn);
  item.appendChild(updateForm);
  item.appendChild(deleteBtn);

  // toggle completed/uncompleted
  checkBtn.addEventListener("click", () => handleToggleTodoItem(item, todo));

  // toggle update mode
  updateForm.addEventListener("click", () =>
    handleToggleUpdateMode(item, updateForm, updateInput, todo)
  );

  // delete todo
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handleDeleteTodoItem(item, todo);
  });

  return item;
}

// Add todo item
// Params: todos array, todo content, container contains all todo elements (div)
function addTodoItem(todos, content, container) {
  const todo = { content, completed: false };
  todos.unshift(todo);
  updateNotCompletedTodos(notCompletedTodos + 1);

  if (displayMode === "completed") return; // not render if display mode is completed

  container.prepend(createTodoItem(todo));
}

// Toggle completed/uncompleted
// Params: todo item element (div), todo object
function handleToggleTodoItem(item, todo) {
  todo.completed = !todo.completed;

  const { completed } = todo;
  if (completed) {
    item.classList.add("completed");
    updateNotCompletedTodos(notCompletedTodos - 1);
    displayMode === "active" && item.remove();
    return;
  }

  item.classList.remove("completed");
  updateNotCompletedTodos(notCompletedTodos + 1);
  displayMode === "completed" && item.remove();
}

// Toggle update mode
// Params: todo item element (div), update form element (form), update input element (input), todo object
function handleToggleUpdateMode(item, updateForm, updateInput, todo) {
  updateInput.readOnly = false;
  item.classList.add("update");
  updateInput.focus();

  // cancel update
  updateInput.addEventListener("blur", () =>
    handleCancelUpdate(item, updateInput, todo)
  );

  // update todo
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUpdate(item, updateInput, todo);
  });
}

// Update todo
// Params: todo item element (div), update input element (input), todo object
function handleUpdate(item, updateInput, todo) {
  const { value } = updateInput;
  todo.content = value;
  updateInput.readOnly = true;
  item.classList.remove("update");
}

// Cancel update
// Params: todo item element (div), update input element (input), todo object
function handleCancelUpdate(item, updateInput, todo) {
  const { content } = todo;
  updateInput.value = content;
  updateInput.readOnly = true;
  item.classList.remove("update");
}

// Delete todo item
// Params: todo item element (div), todo object
function handleDeleteTodoItem(item, todo) {
  item.remove();

  const { completed } = todo;
  todos.splice(todos.indexOf(item), 1); // remove from todos array

  completed
    ? updateNotCompletedTodos(notCompletedTodos)
    : updateNotCompletedTodos(notCompletedTodos - 1);
}

// save data to localStorage on page close or refresh -------------------------
window.addEventListener("beforeunload", () => {
  window.localStorage.setItem("todos", JSON.stringify(todos));
  window.localStorage.setItem("displayMode", displayMode);
});
