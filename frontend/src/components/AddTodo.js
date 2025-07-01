import React, { useState } from 'react';
import './AddTodo.css';

const AddTodo = ({ onAddTodo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setLoading(true);
    const result = await onAddTodo(formData.title, formData.description);
    
    if (result.success) {
      setFormData({ title: '', description: '' });
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '' });
    setIsOpen(false);
  };

  return (
    <div className="add-todo">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="add-todo-button">
          + 新しいTodoを追加
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="add-todo-form">
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Todoのタイトルを入力"
              className="todo-title-input"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="説明（オプション）"
              className="todo-description-input"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? '追加中...' : '追加'}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading} className="cancel-button">
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddTodo;