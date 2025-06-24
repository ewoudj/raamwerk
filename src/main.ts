import { mountTodoApp } from '../examples/todo.app';
import { element } from './element';
import { style } from './stylesheet';

// Create a landing page
const landingPage = element({
  tag: 'div',
  style: style({
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  }),
  children: [
    {
      tag: 'h1',
      textContent: 'Raamwerk',
      style: style({
        fontSize: '3rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      })
    },
    {
      tag: 'p',
      textContent: 'TypeScript Micro-Framework',
      style: style({
        fontSize: '1.2rem',
        textAlign: 'center',
        color: '#666',
        marginBottom: '40px'
      })
    },
    {
      tag: 'div',
      style: style({
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px'
      }),
      children: [
        {
          tag: 'h2',
          textContent: 'Features',
          style: style({
            marginTop: 0,
            color: '#333'
          })
        },
        {
          tag: 'ul',
          children: [
            { tag: 'li', textContent: 'Reactive Signals with automatic dependency tracking' },
            { tag: 'li', textContent: 'Type-safe DOM elements with full autocomplete' },
            { tag: 'li', textContent: 'Web Components integration' },
            { tag: 'li', textContent: 'CSS-in-TypeScript with full property typing' },
            { tag: 'li', textContent: 'Zero dependencies, pure TypeScript' }
          ]
        }
      ]
    },
    {
      tag: 'div',
      style: style({
        textAlign: 'center',
        marginBottom: '40px'
      }),
      children: [
        {
          tag: 'button',
          textContent: 'Try the Todo App Demo',
          style: style({
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }),
          onmouseover: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = '#0056b3';
          },
          onmouseout: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = '#007bff';
          },
          onclick: () => {
            document.body.innerHTML = '';
            mountTodoApp();
          }
        }
      ]
    },
    {
      tag: 'div',
      style: style({
        borderTop: '1px solid #eee',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#666'
      }),
      children: [
        {
          tag: 'p',
          textContent: 'Built with modern TypeScript and Web Standards'
        },
        {
          tag: 'p',
          children: [
            { tag: 'a', textContent: 'View on GitHub', href: 'https://github.com/ewoudj/raamwerk', style: style({ color: '#007bff', textDecoration: 'none' }) }
          ]
        }
      ]
    }
  ]
});

// Mount the landing page
document.body.appendChild(landingPage);


