import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

const mockLogin = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('calls login function on form submission', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error message on login failure', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'ログインに失敗しました' });
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    });
  });
});