const bookModel = require('../models/bookModel');

const bookController = {
  getAllBooks: async (req, res, next) => {
    try {
      const books = await bookModel.findAll();
      res.json(books);
    } catch (err) {
      next(err);
    }
  },

  getBookById: async (req, res, next) => {
    try {
      const book = await bookModel.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json(book);
    } catch (err) {
      next(err);
    }
  },

  createBook: async (req, res, next) => {
    try {
      const { title, author, finished = false } = req.body;
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (typeof finished !== 'boolean') {
        return res.status(400).json({ error: 'finished must be true or false' });
      }
      const book = await bookModel.create({
        title: title.trim(),
        author: typeof author === 'string' ? author.trim() : null,
        finished,
      });
      res.status(201).json(book);
    } catch (err) {
      next(err);
    }
  },

  updateBook: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, author, finished } = req.body;
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (typeof finished !== 'boolean') {
        return res.status(400).json({ error: 'finished must be true or false' });
      }
      const book = await bookModel.update(id, {
        title: title.trim(),
        author: typeof author === 'string' ? author.trim() : null,
        finished,
      });
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json(book);
    } catch (err) {
      next(err);
    }
  },

  patchBook: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, author, finished } = req.body;
      if (title === undefined && author === undefined && finished === undefined) {
        return res.status(400).json({ error: 'Provide at least one field to update' });
      }
      const fields = {};
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        fields.title = title.trim();
      }
      if (author !== undefined) {
        fields.author = typeof author === 'string' ? author.trim() : null;
      }
      if (finished !== undefined) {
        if (typeof finished !== 'boolean') {
          return res.status(400).json({ error: 'finished must be true or false' });
        }
        fields.finished = finished;
      }
      const book = await bookModel.partialUpdate(id, fields);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json(book);
    } catch (err) {
      next(err);
    }
  },

  deleteBook: async (req, res, next) => {
    try {
      const deleted = await bookModel.remove(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = bookController;