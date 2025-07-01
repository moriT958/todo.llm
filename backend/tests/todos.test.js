const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { body } = require('express-validator');

const { 
  createTodo, 
  getTodosByUserId, 
  updateTodo, 
  deleteTodo 
} = require('../database');
const { authMiddleware } = require('../auth');

jest.mock('../database');
jest.mock('../auth');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await getTodosByUserId(req.user.id);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/todos', [
  authMiddleware,
  body('title').isLength({ min: 1 }).trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const todoId = await createTodo(req.user.id, title, description || '');
    
    res.status(201).json({ 
      message: 'Todo created successfully',
      id: todoId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/todos/:id', [
  authMiddleware,
  body('title').isLength({ min: 1 }).trim(),
  body('description').optional().trim(),
  body('completed').isBoolean()
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    const changes = await updateTodo(id, req.user.id, title, description || '', completed);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const changes = await deleteTodo(id, req.user.id);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Todo Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/todos', () => {
    it('should get todos for authenticated user', async () => {
      const mockTodos = [
        { id: 1, title: 'Test Todo', description: 'Test Description', completed: false },
        { id: 2, title: 'Another Todo', description: '', completed: true }
      ];
      getTodosByUserId.mockResolvedValue(mockTodos);

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(getTodosByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      createTodo.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'New Todo',
          description: 'New Description'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.id).toBe(1);
      expect(createTodo).toHaveBeenCalledWith(1, 'New Todo', 'New Description');
    });

    it('should create todo without description', async () => {
      createTodo.mockResolvedValue(2);

      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'New Todo'
        });

      expect(response.status).toBe(201);
      expect(createTodo).toHaveBeenCalledWith(1, 'New Todo', '');
    });

    it('should return validation error for empty title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: '',
          description: 'Description'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      updateTodo.mockResolvedValue(1);

      const response = await request(app)
        .put('/api/todos/1')
        .send({
          title: 'Updated Todo',
          description: 'Updated Description',
          completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(updateTodo).toHaveBeenCalledWith('1', 1, 'Updated Todo', 'Updated Description', true);
    });

    it('should return 404 if todo not found', async () => {
      updateTodo.mockResolvedValue(0);

      const response = await request(app)
        .put('/api/todos/999')
        .send({
          title: 'Updated Todo',
          description: 'Updated Description',
          completed: true
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      deleteTodo.mockResolvedValue(1);

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo deleted successfully');
      expect(deleteTodo).toHaveBeenCalledWith('1', 1);
    });

    it('should return 404 if todo not found', async () => {
      deleteTodo.mockResolvedValue(0);

      const response = await request(app).delete('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });
  });
});