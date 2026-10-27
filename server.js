require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/db');
const bookRoutes = require('./src/routes/taskRoures');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Book Library API is ready!' });
});

app.use('/books', bookRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, async () => {
  console.log(`Book Library API running at http://localhost:${PORT}`);
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS books FROM library_books');
    console.log(`Connected to MySQL. Books in table: ${rows[0].books}`);
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
  }
});