const pool = require('../db');

const bookModel = {
  findAll: async () => {
    const [rows] = await pool.query(
      'SELECT * FROM library_books ORDER BY created_at DESC'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT * FROM library_books WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ title, author, finished }) => {
    const [result] = await pool.query(
      'INSERT INTO library_books (title, author, finished) VALUES (?, ?, ?)',
      [title, author, finished]
    );
    return bookModel.findById(result.insertId);
  },

  update: async (id, { title, author, finished }) => {
    const [result] = await pool.query(
      'UPDATE library_books SET title = ?, author = ?, finished = ? WHERE id = ?',
      [title, author, finished, id]
    );
    if (result.affectedRows === 0) return null;
    return bookModel.findById(id);
  },

  partialUpdate: async (id, fields) => {
    const updates = [];
    const values = [];
    for (const key of ['title', 'author', 'finished']) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return bookModel.findById(id);
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_books SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return bookModel.findById(id);
  },

  remove: async (id) => {
    const [result] = await pool.query(
      'DELETE FROM library_books WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = bookModel;