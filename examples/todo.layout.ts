import { element, each } from '../src/element';
import { signal, computed } from '../src/signal';
import { text } from '../src/text';
import { appStyles } from './todo.style';
import type { Todo } from './todo.app';

// Layout components
export const createTitle = () => ({
  tag: "h1" as const,
  textContent: "Todo Application",
  style: appStyles.title
});

export const createInputForm = (
  newTodoText: ReturnType<typeof signal<string>>,
  onAddTodo: () => void, 
  onInputChange: (value: string) => void
) => ({
  tag: "div" as const,
  style: appStyles.inputContainer,
  children: [
    {
      tag: "input" as const,
      type: "text",
      value: newTodoText,
      oninput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        onInputChange(target.value);
      },
      placeholder: "What needs to be done?",
      style: appStyles.input,
      onkeyup: (e: KeyboardEvent) => {
        if (e.key === "Enter") onAddTodo();
      }
    },
    {
      tag: "button" as const,
      textContent: "Add Todo",
      onclick: onAddTodo,
      style: appStyles.addButton
    }
  ]
});

export const createTodoList = (
  todos: ReturnType<typeof signal<Todo[]>>,
  onToggleTodo: (id: number) => void, 
  onRemoveTodo: (id: number) => void
) => ({
  tag: "ul" as const,
  style: appStyles.todoList,
  children: each(
    todos,
    todo => todo.id, // Use ID as key for stable rendering
    todo => ({
      tag: "li" as const,
      style: appStyles.todoItem,
      children: [
        {
          tag: "input" as const,
          type: "checkbox",
          checked: todo.completed,
          onchange: () => onToggleTodo(todo.id),
          style: appStyles.checkbox
        },
        {
          tag: "span" as const,
          textContent: todo.text,
          style: computed(() => 
            todo.completed ? appStyles.completedText : appStyles.todoText
          )
        },
        {
          tag: "button" as const,
          textContent: "×",
          onclick: () => onRemoveTodo(todo.id),
          style: appStyles.deleteButton
        }
      ]
    })
  )
});

export const createFooter = (
  remainingCount: ReturnType<typeof computed<number>>,
  onClearCompleted: () => void
) => ({
  tag: "div" as const,
  style: appStyles.footer,
  children: [
    {
      tag: "span" as const,
      textContent: text`${remainingCount} item${computed(() => remainingCount() === 1 ? "" : "s")} left`
    },
    {
      tag: "button" as const,
      textContent: "Clear Completed",
      onclick: onClearCompleted,
      style: appStyles.clearButton
    }
  ]
});

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
  tag: "div",
  className: "todo-app",
  style: appStyles.container,
  children: [
    createTitle(),
    createInputForm(newTodoText, onAddTodo, onInputChange),
    createTodoList(todos, onToggleTodo, onRemoveTodo),
    createFooter(remainingCount, onClearCompleted)
  ]
}); 