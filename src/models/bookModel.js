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
      'INSERT INTO library_books (title, author, finished, finished_at) VALUES (?, ?, ?, IF(?, NOW(), NULL))',
      [title, author, finished, finished]
    );
    return bookModel.findById(result.insertId);
  },

  update: async (id, { title, author, finished }) => {
    const [result] = await pool.query(
      'UPDATE library_books SET title = ?, author = ?, finished = ?, finished_at = IF(?, COALESCE(finished_at, NOW()), NULL) WHERE id = ?',
      [title, author, finished, finished, id]
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
    // Record when a book was finished, and clear it if it is marked unfinished
    if (fields.finished !== undefined) {
      updates.push(
        fields.finished
          ? 'finished_at = COALESCE(finished_at, NOW())'
          : 'finished_at = NULL'
      );
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