import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: jest.fn()
}));

jest.mock('./components/AuthWrapper', () => {
  return function AuthWrapper() {
    return <div data-testid="auth-wrapper">Please log in</div>;
  };
});

jest.mock('./components/TodoList', () => {
  return function TodoList() {
    return <div data-testid="todo-list">Todo List</div>;
  };
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    const { useAuth } = require('./context/AuthContext');
    useAuth.mockReturnValue({
      token: null,
      loading: true
    });

    render(<App />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders AuthWrapper when not authenticated', async () => {
    const { useAuth } = require('./context/AuthContext');
    useAuth.mockReturnValue({
      token: null,
      loading: false
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-wrapper')).toBeInTheDocument();
    });
  });

  it('renders TodoList when authenticated', async () => {
    const { useAuth } = require('./context/AuthContext');
    useAuth.mockReturnValue({
      token: 'mock-token',
      loading: false
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    });
  });
});
