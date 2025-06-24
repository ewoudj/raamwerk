import { element, each } from '../src/element';
import { signal, computed } from '../src/signal';
import { text } from '../src/text';
import { appStyles } from './todo.style';
import type { Todo } from './todo.app';

export const createTodoApp = (
  todos: ReturnType<typeof signal<Todo[]>>,
  newTodoText: ReturnType<typeof signal<string>>,
  remainingCount: ReturnType<typeof computed<number>>,
  onAddTodo: () => void,
  onInputChange: (value: string) => void,
  onToggleTodo: (id: number) => void,
  onRemoveTodo: (id: number) => void,
  onClearCompleted: () => void
) => element({
  tag: 'div',
  style: appStyles.container,
  children: [
    // Title
    {
      tag: 'h1',
      textContent: 'Todo Application',
      style: appStyles.title
    },
    
    // Input form
    {
      tag: 'div',
      style: appStyles.inputContainer,
      children: [
        {
          tag: 'input',
          type: 'text',
          value: newTodoText,
          oninput: (e: Event) => {
            const target = e.target as HTMLInputElement;
            onInputChange(target.value);
          },
          placeholder: 'What needs to be done?',
          style: appStyles.input,
          onkeyup: (e: KeyboardEvent) => {
            if (e.key === 'Enter') onAddTodo();
          }
        },
        {
          tag: 'button',
          textContent: 'Add Todo',
          onclick: onAddTodo,
          style: appStyles.addButton
        }
      ]
    },
    
    // Todo list
    {
      tag: 'ul',
      style: appStyles.todoList,
      children: each(
        todos,
        todo => todo.id,
        todo => ({
          tag: 'li',
          style: appStyles.todoItem,
          children: [
            {
              tag: 'input',
              type: 'checkbox',
              checked: todo.completed,
              onchange: () => onToggleTodo(todo.id),
              style: appStyles.checkbox
            },
            {
              tag: 'span',
              textContent: todo.text,
              style: computed(() => 
                todo.completed ? appStyles.completedText : appStyles.todoText
              )
            },
            {
              tag: 'button',
              textContent: '×',
              onclick: () => onRemoveTodo(todo.id),
              style: appStyles.deleteButton
            }
          ]
        })
      )
    },
    
    // Footer
    {
      tag: 'div',
      style: appStyles.footer,
      children: [
        {
          tag: 'span',
          textContent: text`${remainingCount} item${computed(() => remainingCount() === 1 ? '' : 's')} left`
        },
        {
          tag: 'button',
          textContent: 'Clear Completed',
          onclick: onClearCompleted,
          style: appStyles.clearButton
        }
      ]
    }
  ]
}); 