import { createElement } from './element';
import { html } from './html';
import { signal } from './signal';

  // Reactive state
  const count = signal(0);

  // Render the app
  const app = html`<div>
      <h1>Counter: ${count}</h1>
      <button onclick=${() => count((val) => val + 1)}>Increment</button>
      <button onclick=${() => count((val) => val - 1)}>Decrement</button>
    </div>`;

    const counterElement = createElement({
      children: [{
        textContent: count,
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
    style: { width: "400px", height: "400px", backgroundColor: "black" },
    children: [
      {
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
        textContent: count,
        style: { width: "100px", height: "100px", backgroundColor: "green" },
      },
      {
        style: { width: "100px", height: "100px", backgroundColor: "blue" },
      },
    ],
  });

  // Mount the app to the DOM
  document.body.append(counterElement);
  document.body.append(canvas);




