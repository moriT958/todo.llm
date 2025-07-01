import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { todoService } from '../services/todoService';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const result = await todoService.getTodos();
    
    if (result.success) {
      setTodos(result.data);
      setError('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleAddTodo = async (title, description) => {
    const result = await todoService.createTodo(title, description);
    
    if (result.success) {
      fetchTodos();
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleUpdateTodo = async (id, title, description, completed) => {
    const result = await todoService.updateTodo(id, title, description, completed);
    
    if (result.success) {
      fetchTodos();
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleDeleteTodo = async (id) => {
    const result = await todoService.deleteTodo(id);
    
    if (result.success) {
      fetchTodos();
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="todo-app">
      <header className="app-header">
        <h1>Todo アプリ</h1>
        <div className="user-info">
          <span>こんにちは、{user?.username}さん</span>
          <button onClick={logout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>

      <main className="app-main">
        <AddTodo onAddTodo={handleAddTodo} />
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="todos-container">
          {todos.length === 0 ? (
            <p className="no-todos">Todoがありません。新しいTodoを追加してください。</p>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TodoList;