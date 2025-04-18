import { element } from './element';
import { signal } from './signal';
import { text } from './text';

const count = signal(0);
const counterText = text`Counter: ${count}`;

const counterElement = element({
  tag: "div",
  children: [{
    tag: "h1",
    textContent: counterText,
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

const canvas = element({
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
      textContent: counterText,
      style: { width: "100px", height: "100px", backgroundColor: "green" },
    },
    {
      tag: 'div',
      style: { width: "100px", height: "100px", backgroundColor: "blue" },
    },
  ],
});

document.body.append(counterElement);
document.body.append(canvas);




