USE defaultdb;

CREATE TABLE IF NOT EXISTS library_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  finished BOOLEAN DEFAULT FALSE,
  finished_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- If the table already existed without finished_at, run these two lines once:
-- ALTER TABLE library_books ADD COLUMN finished_at TIMESTAMP NULL DEFAULT NULL;
-- UPDATE library_books SET finished_at = updated_at WHERE finished = TRUE AND finished_at IS NULL;

INSERT INTO library_books (title, author, finished, finished_at)
SELECT * FROM (
  SELECT 'The Alchemist' AS title, 'Paulo Coelho' AS author, TRUE AS finished, NOW() AS finished_at UNION ALL
  SELECT 'Atomic Habits', 'James Clear', FALSE, NULL UNION ALL
  SELECT 'Wings of Fire', 'A. P. J. Abdul Kalam', FALSE, NULL
) AS seed_data
WHERE NOT EXISTS (SELECT 1 FROM library_books LIMIT 1);

SELECT * FROM library_books;