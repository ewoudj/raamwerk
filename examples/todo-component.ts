// examples/todo-component.ts
import { element, each } from '../src/element';
import { signal, computed } from '../src/signal';
import { defineComponent } from '../src/web-component';

// Define the Todo component
defineComponent('todo-list', (props) => {
  // Component state
  const todos = signal([
    { id: 1, text: "Learn Raamwerk", completed: false },
    { id: 2, text: "Build Web Components", completed: true }
  ]);
  const newTodoText = signal("");
  const nextId = signal(3);

  // Component functions
  const addTodo = () => {
    if (newTodoText().trim()) {
      todos([
        ...todos(),
        { id: nextId(), text: newTodoText(), completed: false }
      ]);
      nextId(id => id + 1);
      newTodoText("");
    }
  };

  const toggleTodo = (id: number) => {
    todos(current => 
      current.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed } 
          : todo
      )
    );
  };

  const removeTodo = (id: number) => {
    todos(current => current.filter(todo => todo.id !== id));
  };

  // Render function
  return {
    tag: "div",
    className: "todo-list-component",
    children: [
      {
        tag: "h2",
        textContent: props.title || "Todo List",
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
            placeholder: props.placeholder || "Add a new todo",
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
          todo => todo.id,
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
          }
        ]
      }
    ]
  };
}, {
  // Component options
  props: {
    title: "My Todos",
    placeholder: "What needs to be done?",
    theme: "light"
  },
  observedAttributes: ["title", "placeholder", "theme"],
  shadow: true,
  styles: `
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      color: var(--todo-text-color, #333);
      background-color: var(--todo-bg-color, #fff);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .todo-title {
      margin-top: 0;
      text-align: center;
      color: var(--todo-title-color, #333);
    }
    
    .todo-input-container {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .todo-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .todo-add-button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    
    .todo-checkbox {
      margin-right: 12px;
    }
    
    .todo-text {
      flex: 1;
    }
    
    .todo-text.completed {
      text-decoration: line-through;
      color: #888;
    }
    
    .todo-delete-button {
      background: none;
      border: none;
      color: #ff4d4d;
      font-size: 18px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .todo-footer {
      margin-top: 16px;
      color: #666;
      font-size: 14px;
    }
  `,
  onConnected: (element, props) => {
    // Update CSS variables based on theme
    if (props.theme === 'dark') {
      element.style.setProperty('--todo-bg-color', '#333');
      element.style.setProperty('--todo-text-color', '#eee');
      element.style.setProperty('--todo-title-color', '#fff');
    }
  }
});