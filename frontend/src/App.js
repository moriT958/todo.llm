import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import TodoList from './components/TodoList';
import './App.css';

function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return token ? <TodoList /> : <AuthWrapper />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
