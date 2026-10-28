-- Book Library schema

USE defaultdb;

-- 1. Create the table (skipped if it already exists IF NOT IT WILL CREAT NEW ONE )
CREATE TABLE IF NOT EXISTS library_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  finished BOOLEAN DEFAULT FALSE,
  finished_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Add finished_at only if an older table is missing it
SET @has_finished_at = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'library_books'
    AND COLUMN_NAME = 'finished_at'
);

SET @add_column = IF(
  @has_finished_at = 0,
  'ALTER TABLE library_books ADD COLUMN finished_at TIMESTAMP NULL DEFAULT NULL AFTER finished',
  'SELECT ''finished_at already exists'' AS info'
);

PREPARE stmt FROM @add_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Fill finished_at for books already marked finished 
--    (id > 0 uses the primary key, so it works in Workbench safe update mode)
UPDATE library_books
SET finished_at = updated_at
WHERE id > 0 AND finished = TRUE AND finished_at IS NULL;

-- 4. Sample books (only added when the table is empty)
INSERT INTO library_books (title, author, finished, finished_at)
SELECT * FROM (
  SELECT 'The Alchemist' AS title, 'Paulo Coelho' AS author, TRUE AS finished, NOW() AS finished_at UNION ALL
  SELECT 'Atomic Habits', 'James Clear', FALSE, NULL UNION ALL
  SELECT 'Wings of Fire', 'A. P. J. Abdul Kalam', FALSE, NULL
) AS seed_data
WHERE NOT EXISTS (SELECT 1 FROM library_books LIMIT 1);

-- 5. Check the result 
SELECT * FROM library_books;
