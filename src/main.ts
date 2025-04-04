import { createElement } from './element';
import { html } from './html';
import { computed, signal } from './signal';

  // Reactive state
  const count = signal(0);

  // Render the app
  const app = html`<div>
      <h1>Counter: ${count}</h1>
      <button onclick=${() => count((val) => val + 1)}>Increment</button>
      <button onclick=${() => count((val) => val - 1)}>Decrement</button>
    </div>`;

    const counterElement = createElement({
      tag: "div",
      children: [{
        tag: "h1",
        textContent: computed<string|null|undefined>(() => `Counter: ${count()}`),
      }, {
        tag: "button",
        textContent: "Increment",
        onclick: () => count((val) => val + 1)
      }, {
        tag: "button",
        textContent: "Decrement",
        onclick: () => count((val) => val - 1)
      }]
    });

  const canvas = createElement({
    tag: "div",
    style: { width: "400px", height: "400px", backgroundColor: "black" },
    children: [
      {
        tag: "div",
        style: { width: "100px", height: "100px", backgroundColor: "red" },
        onclick: () => {count((val) => val + 1);},
        children: [{ 
          tag: "canvas", 
          width: 400,
          style: { 
            width: "50px", 
            height: "50px", backgroundColor: "yellow" } }],
      },
      {
        tag: 'div',
        textContent: computed<string|null|undefined>(() => `Counter: ${count()}`),
        style: { width: "100px", height: "100px", backgroundColor: "green" },
      },
      {
        tag: 'div',
        style: { width: "100px", height: "100px", backgroundColor: "blue" },
      },
    ],
  });

  // Mount the app to the DOM
  document.body.append(...app);
  document.body.append(counterElement);
  document.body.append(canvas);




