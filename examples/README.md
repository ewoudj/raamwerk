# Examples

This directory contains example applications built with the micro-framework.

## Todo App

A fully functional todo application demonstrating:

- **Signals**: Reactive state management
- **Effects**: Automatic DOM updates
- **Elements**: Type-safe DOM creation
- **Stylesheets**: CSS-in-TypeScript with full typing
- **Event Handling**: Proper event binding
- **Lists**: Dynamic list rendering with keys
- **Modular Architecture**: Separation of concerns

### Files:
- `todo.app.ts` - Main application logic and actions
- `todo.layout.ts` - Component structure and layout
- `todo.style.ts` - All styling definitions

### Features:
- Add new todos
- Toggle todo completion
- Remove todos
- Clear completed todos
- Real-time item count
- Responsive styling

### Architecture:
The todo app demonstrates a clean separation of concerns:

1. **Business Logic** (`todo.app.ts`): Actions, event handlers, and application state
2. **Layout** (`todo.layout.ts`): Component structure, signals, and DOM configuration
3. **Styling** (`todo.style.ts`): All CSS definitions using the stylesheet system

### Usage:
The todo app is automatically loaded when you run the main application. It demonstrates all the core features of the micro-framework in a practical, real-world example.

## Adding New Examples

To add a new example:

1. Create a new TypeScript file in this directory
2. Import the framework modules from `../src/`
3. Export a mount function (e.g., `export function mountMyApp()`)
4. Update `src/main.ts` to import and call your mount function

For complex applications, consider following the modular pattern:
- `myapp.app.ts` - Main logic and actions
- `myapp.layout.ts` - Component structure
- `myapp.style.ts` - Styling definitions

Example structure:
```typescript
import { element } from '../src/element';
import { signal } from '../src/signal';
import { style } from '../src/stylesheet';

export function mountMyApp() {
  // Your app implementation
  const app = element({
    tag: 'div',
    style: style({ padding: 20 }),
    children: []
  });
  
  document.body.appendChild(app);
}
``` 