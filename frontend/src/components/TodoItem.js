import React, { useState } from 'react';
import './TodoItem.css';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo.title,
    description: todo.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    await onUpdate(todo.id, todo.title, todo.description, !todo.completed);
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      title: todo.title,
      description: todo.description || '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: todo.title,
      description: todo.description || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setLoading(true);
    const result = await onUpdate(todo.id, editForm.title, editForm.description, todo.completed);
    
    if (result.success) {
      setIsEditing(false);
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('このTodoを削除しますか？')) {
      setLoading(true);
      const result = await onDelete(todo.id);
      
      if (!result.success) {
        alert(result.error);
      }
      
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="todo-edit">
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleInputChange}
            placeholder="タイトル"
            className="edit-title"
          />
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleInputChange}
            placeholder="説明（オプション）"
            className="edit-description"
            rows="3"
          />
          <div className="edit-actions">
            <button onClick={handleSaveEdit} disabled={loading} className="save-button">
              {loading ? '保存中...' : '保存'}
            </button>
            <button onClick={handleCancelEdit} disabled={loading} className="cancel-button">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-content">
          <div className="todo-checkbox">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              disabled={loading}
            />
          </div>
          <div className="todo-text">
            <h3 className={`todo-title ${todo.completed ? 'completed-text' : ''}`}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`todo-description ${todo.completed ? 'completed-text' : ''}`}>
                {todo.description}
              </p>
            )}
            <div className="todo-meta">
              <span className="todo-date">
                作成日: {new Date(todo.created_at).toLocaleDateString('ja-JP')}
              </span>
              {todo.updated_at !== todo.created_at && (
                <span className="todo-date">
                  更新日: {new Date(todo.updated_at).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
          </div>
          <div className="todo-actions">
            <button onClick={handleEdit} disabled={loading} className="edit-button">
              編集
            </button>
            <button onClick={handleDelete} disabled={loading} className="delete-button">
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;