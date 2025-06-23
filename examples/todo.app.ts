import { signal, computed } from '../src/signal';
import { createTodoApp } from './todo.layout';

// Define the Todo interface
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Create signals for application state
export const todos = signal<Todo[]>([
  { id: 1, text: "Learn TypeScript", completed: false },
  { id: 2, text: "Build a microframework", completed: true }
]);
export const newTodoText = signal("");
export const nextId = signal(3); // For generating unique IDs

// Computed values
export const remainingCount = computed(() => 
  todos().filter(todo => !todo.completed).length
);

// Actions
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
    nextId(id => id + 1); // Increment the ID counter
    newTodoText(""); // Clear the input
  }
};

const toggleTodo = (todoId: number) => {
  todos(current => 
    current.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed } 
        : todo
    )
  );
};

const removeTodo = (todoId: number) => {
  todos(current => current.filter(todo => todo.id !== todoId));
};

const clearCompleted = () => {
  todos(current => current.filter(todo => !todo.completed));
};

const handleInputChange = (value: string) => {
  newTodoText(value);
};

// Create the todo app element with all the handlers
const todoAppElement = createTodoApp(
  todos,
  newTodoText,
  remainingCount,
  addTodo,
  handleInputChange,
  toggleTodo,
  removeTodo,
  clearCompleted
);

// Mount the todo app to the DOM
export function mountTodoApp() {
    document.body.appendChild(todoAppElement);
}
