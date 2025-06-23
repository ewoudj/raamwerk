import { style, styles, css } from '../src/stylesheet';

// Define styles using the new stylesheet system
export const appStyles = {
  container: style({
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  }),
  
  title: style({
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  }),
  
  inputContainer: styles.flex('row', 'flex-start', 'center'),
  
  input: css`
    flex: 1;
    padding: 8px 12px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `,
  
  addButton: styles.button('#4CAF50', 'white'),
  
  todoList: style({
    listStyleType: 'none',
    padding: 0,
    margin: 0
  }),
  
  todoItem: style({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  }),
  
  checkbox: style({
    marginRight: 10,
    cursor: 'pointer'
  }),
  
  todoText: style({
    flex: 1
  }),
  
  completedText: style({
    flex: 1,
    textDecoration: 'line-through',
    color: '#888'
  }),
  
  deleteButton: style({
    backgroundColor: 'transparent',
    color: '#e74c3c',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 'bold'
  }),
  
  footer: style({
    padding: '10px 0',
    color: '#666',
    fontSize: 14,
    display: 'flex',
    justifyContent: 'space-between'
  }),
  
  clearButton: style({
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#888'
  })
}; 