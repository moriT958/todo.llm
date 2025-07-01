import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const todoService = {
  async getTodos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch todos' 
      };
    }
  },

  async createTodo(title, description) {
    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, {
        title,
        description,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create todo' 
      };
    }
  },

  async updateTodo(id, title, description, completed) {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        title,
        description,
        completed,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update todo' 
      };
    }
  },

  async deleteTodo(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/todos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete todo' 
      };
    }
  },
};