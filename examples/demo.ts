import { element, each } from '../src/element';
import { signal, computed } from '../src/signal';
import './demo.css'; // Import the CSS file

// Define Todo type
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Create state
const todos = signal<Todo[]>([
  { id: 1, text: "Learn Raamwerk", completed: false },
  { id: 2, text: "Build cool apps", completed: true }
]);
const newTodoText = signal("");
const nextId = signal(3);

// Add todo function
const addTodo = () => {
  if (newTodoText().trim()) {
    todos([
      ...todos(),
      {
        id: nextId(),
        text: newTodoText(),
        completed: false
      }
    ]);
    nextId(id => id + 1);
    newTodoText(""); // Clear the input
  }
};

// Toggle todo function
const toggleTodo = (todoId: number) => {
  todos(current => 
    current.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed } 
        : todo
    )
  );
};

// Remove todo function
const removeTodo = (todoId: number) => {
  todos(current => current.filter(todo => todo.id !== todoId));
};

// Clear completed todos function
const clearCompleted = () => {
  todos(current => current.filter(todo => !todo.completed));
};

// Create todo app element
const todoApp = element({
  tag: "div",
  className: "todo-app",
  children: [
    {
      tag: "h1",
      textContent: "Raamwerk Todo Demo",
      className: "todo-title"
    },
    {
      tag: "div",
      className: "todo-input-container",
      children: [
        {
          tag: "input",
          type: "text",
          value: newTodoText,
          placeholder: "Add a new todo",
          className: "todo-input",
          oninput: (e: Event) => newTodoText((e.target as HTMLInputElement).value),
          onkeyup: (e: KeyboardEvent) => { if (e.key === "Enter") addTodo(); }
        },
        {
          tag: "button",
          textContent: "Add",
          onclick: addTodo,
          className: "todo-add-button"
        }
      ]
    },
    {
      tag: "ul",
      className: "todo-list",
      children: each(
        todos,
        todo => todo.id, // Key function for efficient updates
        (todo) => ({
          tag: "li",
          className: "todo-item",
          children: [
            {
              tag: "input",
              type: "checkbox",
              checked: todo.completed,
              onchange: () => toggleTodo(todo.id),
              className: "todo-checkbox"
            },
            {
              tag: "span",
              textContent: todo.text,
              className: todo.completed ? "todo-text completed" : "todo-text"
            },
            {
              tag: "button",
              textContent: "×",
              onclick: () => removeTodo(todo.id),
              className: "todo-delete-button"
            }
          ]
        })
      )
    },
    {
      tag: "div",
      className: "todo-footer",
      children: [
        {
          tag: "span",
          textContent: computed(() => {
            const remaining = todos().filter(t => !t.completed).length;
            return `${remaining} item${remaining === 1 ? '' : 's'} left`;
          }),
          className: "todo-count"
        },
        {
          tag: "button",
          textContent: "Clear completed",
          onclick: clearCompleted,
          className: computed(() => 
            todos().some(t => t.completed) 
              ? "todo-clear-button" 
              : "todo-clear-button hidden"
          ) as unknown as string
        }
      ]
    }
  ]
});

// Create header
const header = element({
  tag: "header",
  className: "app-header",
  children: [
    {
      tag: "div",
      className: "header-container",
      children: [
        {
          tag: "h1",
          textContent: "Raamwerk",
          className: "header-title"
        },
        {
          tag: "p",
          textContent: "A lightweight UI framework for building reactive web applications",
          className: "header-subtitle"
        }
      ]
    }
  ]
});

// Create a link to the GitHub repo
const githubLink = element({
  tag: "a",
  href: "https://github.com/ewoudj/raamwerk",
  textContent: "View on GitHub",
  className: "github-link"
});

// Create a footer with attribution
const footer = element({
  tag: "footer",
  className: "app-footer",
  children: [
    {
      tag: "p",
      innerHTML: 'Made with <span class="heart">♥</span> using Raamwerk',
      className: "footer-text"
    }
  ]
});

// Append to document
document.body.appendChild(header);
document.body.appendChild(todoApp);
document.body.appendChild(footer);
document.body.appendChild(githubLink);