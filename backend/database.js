const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./todo.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);
});

const createUser = (username, email, password) => {
  return new Promise((resolve, reject) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createTodo = (userId, title, description) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const getTodosByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const updateTodo = (id, userId, title, description, completed) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todos SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [title, description, completed, id, userId],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

const deleteTodo = (id, userId) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  db,
  createUser,
  getUserByEmail,
  getUserById,
  createTodo,
  getTodosByUserId,
  updateTodo,
  deleteTodo
};