import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TodoList from './TodoList';

const mockTodos = [
  { id: 1, title: 'Test Todo 1', description: 'Description 1', completed: false },
  { id: 2, title: 'Test Todo 2', description: 'Description 2', completed: true }
];

jest.mock('../services/todoService', () => ({
  todoService: {
    getTodos: jest.fn(),
    createTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn()
  }
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    logout: jest.fn(),
    user: { username: 'テストユーザー' }
  })
}));

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { todoService } = require('../services/todoService');
    todoService.getTodos.mockResolvedValue({ success: true, data: mockTodos });
  });

  it('renders todo list with todos', async () => {
    await act(async () => {
      render(<TodoList />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('renders add todo button', async () => {
    await act(async () => {
      render(<TodoList />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('+ 新しいTodoを追加')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    const { todoService } = require('../services/todoService');
    todoService.getTodos.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<TodoList />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});