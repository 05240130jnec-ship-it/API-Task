const API = 'http://localhost:3000/books';

const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const addBtn = document.getElementById('addBtn');
const bookList = document.getElementById('bookList');
const message = document.getElementById('message');

function showMessage(text) {
  message.textContent = text;
}

// GET /books - load and display all books
async function loadBooks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Could not load books');
    const books = await res.json();
    renderBooks(books);
    showMessage('');
  } catch (err) {
    showMessage('Cannot reach the server. Is the backend running?');
  }
}

function renderBooks(books) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No books yet.';
    bookList.appendChild(empty);
    return;
  }

  books.forEach((book) => {
    const li = document.createElement('li');
    // MySQL returns finished as 1 or 0, so convert it to a real boolean
    const isFinished = Boolean(book.finished);
    if (isFinished) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isFinished;
    checkbox.title = 'Mark as finished';
    checkbox.addEventListener('change', () => toggleBook(book.id, checkbox.checked));

    const info = document.createElement('div');
    info.className = 'book-info';

    const title = document.createElement('span');
    title.className = 'book-title';
    title.textContent = book.title;

    const author = document.createElement('span');
    author.className = 'book-author';
    author.textContent = book.author || 'Unknown author';

    info.append(title, author);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => deleteBook(book.id));

    li.append(checkbox, info, delBtn);
    bookList.appendChild(li);
  });
}

// POST /books - add a book
async function addBook() {
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  if (!title) {
    showMessage('Please enter a book title.');
    return;
  }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Could not add book');
    }
    titleInput.value = '';
    authorInput.value = '';
    loadBooks();
  } catch (err) {
    showMessage(err.message);
  }
}

// PATCH /books/:id - mark finished or not finished
async function toggleBook(id, finished) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finished }),
    });
    if (!res.ok) throw new Error('Could not update book');
    loadBooks();
  } catch (err) {
    showMessage(err.message);
  }
}

// DELETE /books/:id - remove a book
async function deleteBook(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete book');
    loadBooks();
  } catch (err) {
    showMessage(err.message);
  }
}

addBtn.addEventListener('click', addBook);
titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBook();
});

loadBooks();