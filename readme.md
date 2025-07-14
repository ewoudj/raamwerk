# Raamwerk

A lightweight UI framework for building reactive web applications with TypeScript.

## Features

- **Signals**: Reactive state management with fine-grained updates
- **Element Function**: Create DOM elements with TypeScript object literals
- **Reactivity**: Automatically update the UI when state changes
- **Minimal API**: Small learning curve, easy to use
- **TypeScript First**: Fully typed API for the best developer experience

## Example

```typescript
import { element } from './element';
import { signal } from './signal';

// Create a reactive signal
const count = signal(0);

// Create a UI component
const counter = element({
  tag: "div",
  children: [
    {
      tag: "h1",
      textContent: computed(() => `Count: ${count()}`)
    },
    {
      tag: "button",
      textContent: "Increment",
      onclick: () => count(value => value + 1)
    }
  ]
});

// Mount to the DOM
document.body.appendChild(counter);
```