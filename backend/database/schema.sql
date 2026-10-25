USE defaultdb;

CREATE TABLE IF NOT EXISTS library_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO library_books (title, author, finished)
SELECT * FROM (
  SELECT 'The Alchemist' AS title, 'Paulo Coelho' AS author, TRUE AS finished UNION ALL
  SELECT 'Atomic Habits', 'James Clear', FALSE UNION ALL
  SELECT 'Wings of Fire', 'A. P. J. Abdul Kalam', FALSE
) AS seed_data
WHERE NOT EXISTS (SELECT 1 FROM library_books LIMIT 1);

SELECT * FROM library_books;