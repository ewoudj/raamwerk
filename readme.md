# Raamwerk - TypeScript Micro-Framework

A lightweight, reactive TypeScript micro-framework for building modern web applications with full type safety and minimal boilerplate.

## 🚀 Live Demo

**[Try the Todo App Demo →](https://ewoudj.github.io/raamwerk/)**

A fully functional todo application showcasing all framework features including reactive signals, Web Components, and CSS-in-TypeScript.

## ✨ Features

- **Reactive Signals**: Automatic DOM updates with dependency tracking
- **Type-Safe Elements**: Full TypeScript support with autocomplete for all HTML elements
- **Web Components**: Seamless integration with custom Web Components
- **CSS-in-TypeScript**: Write styles in TypeScript with full typing support
- **Zero Dependencies**: Pure TypeScript implementation
- **Small Bundle**: Minimal footprint for fast loading
- **Modern APIs**: Built for modern browsers with ES6+ features

## 🏗️ Architecture

The framework consists of several core modules:

- **`signal.ts`**: Reactive state management with automatic dependency tracking
- **`element.ts`**: Type-safe DOM element creation with reactive properties
- **`stylesheet.ts`**: CSS-in-TypeScript with full property typing
- **`text.ts`**: Reactive text interpolation

## 📦 Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/ewoudj/raamwerk.git
    ```
2. Navigate to the project directory:
    ```bash
    cd raamwerk
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## 🚀 Quick Start

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📚 Examples

### Basic Signal Usage
```typescript
import { signal, computed, effect } from './src/signal';

const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

count(5); // Logs: Count: 5, Doubled: 10
```

### Creating Elements
```typescript
import { element } from './src/element';
import { signal } from './src/signal';

const name = signal('World');

const app = element({
  tag: 'div',
  style: { padding: '20px' },
  children: [
    {
      tag: 'h1',
      textContent: name,
      style: { color: 'blue' }
    }
  ]
});

document.body.appendChild(app);
```

### Styling with TypeScript
```typescript
import { style, css } from './src/stylesheet';

const buttonStyle = style({
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px'
});

// Or use CSS template literals
const cardStyle = css`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
```

## 🎯 Todo App Example

The included todo app demonstrates:

- **Reactive State**: Todos, input text, and computed counts
- **Event Handling**: Add, toggle, remove, and clear todos
- **Web Components**: Custom `todo-app-component` with type safety
- **Styling**: Full CSS-in-TypeScript implementation
- **Modular Architecture**: Separation of concerns (app logic, layout, styles)

See `examples/todo.app.ts`, `examples/todo.layout.ts`, and `examples/todo.style.ts` for the complete implementation.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add feature-name"`
6. Push: `git push origin feature-name`
7. Open a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🔗 Links

- **[Live Demo](https://ewoudj.github.io/raamwerk/)**
- **[GitHub Repository](https://github.com/ewoudj/raamwerk)**
- **[Issues](https://github.com/ewoudj/raamwerk/issues)**