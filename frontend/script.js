const API = 'http://localhost:3000/books';
const OWNER = 'Chungku'; // change this to your own name

const COVER_COLORS = ['#3b3a9e', '#c2255c', '#0b7a75', '#6741d9', '#9a6700', '#1864ab', '#2b8a3e', '#862e9c'];
const RING_LENGTH = 301.6; // circumference of the progress ring

const $ = (id) => document.getElementById(id);
const app = $('app');
const grid = $('bookGrid');
const notice = $('notice');
const toastEl = $('toast');
const titleInput = $('titleInput');
const authorInput = $('authorInput');

let books = [];
let filter = 'all';
let query = '';
let sortBy = 'newest';
let selectedId = null;
let toastTimer;

/* ---------- helpers ---------- */

// One helper for every API call, with clear error messages
async function request(path = '', options = {}) {
  let res;
  try {
    res = await fetch(API + path, options);
  } catch (err) {
    throw new Error('Cannot reach the server. Open a terminal in the backend folder, run npm run dev, then refresh this page.');
  }
  if (!res.ok) {
    let message = `The server returned an error (${res.status}).`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch (e) { /* no JSON body */ }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

function hashOf(text) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash;
}

// A colour and two big shapes picked from the title, so each book always looks the same
function coverBackground(title) {
  const h = hashOf(title);
  const color = COVER_COLORS[h % COVER_COLORS.length];
  const x1 = 55 + (h % 40), y1 = 10 + ((h >> 3) % 35);
  const x2 = 5 + ((h >> 5) % 40), y2 = 70 + ((h >> 7) % 30);
  return `radial-gradient(circle at ${x1}% ${y1}%, rgba(255,255,255,0.17) 0 30%, transparent 31%), ` +
         `radial-gradient(circle at ${x2}% ${y2}%, rgba(0,0,0,0.16) 0 24%, transparent 25%), ${color}`;
}

function isFinished(book) {
  return Boolean(book.finished); // MySQL sends 1 or 0
}

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function showNotice(text) {
  notice.textContent = text;
  notice.hidden = !text;
}

function burst(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ffc93c', '#18a999', '#c2255c', '#6741d9', '#1c7ed6'];
  for (let i = 0; i < 20; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[i % colors.length];
    document.body.appendChild(piece);
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 100;
    piece.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 50}px) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
    ).onfinish = () => piece.remove();
  }
}

const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>';
const PLUS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';

/* ---------- API actions ---------- */

// GET /books
async function loadBooks() {
  try {
    books = await request();
    showNotice('');
  } catch (err) {
    books = [];
    showNotice(err.message);
  }
  if (selectedId && !books.find((b) => b.id === selectedId)) closeDetail();
  render();
}

// POST /books
async function addBook(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  $('formMessage').textContent = '';

  if (!title) {
    $('formMessage').textContent = 'Enter a title to add a book.';
    titleInput.focus();
    return;
  }

  try {
    await request('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    });
    titleInput.value = '';
    authorInput.value = '';
    toast(`Added "${title}"`);
    await loadBooks();
  } catch (err) {
    $('formMessage').textContent = err.message;
  }
}

// PATCH /books/:id (finished)
async function toggleFinished(book, originEl) {
  const rect = originEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const nowFinished = !isFinished(book);

  try {
    await request(`/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finished: nowFinished }),
    });
    if (nowFinished) {
      burst(x, y);
      toast(`Finished "${book.title}". Nice work!`);
    } else {
      toast(`Moved "${book.title}" back to your to-read list`);
    }
    await loadBooks();
    if (selectedId === book.id) fillDetail(books.find((b) => b.id === book.id), false);
  } catch (err) {
    showNotice(err.message);
    if (selectedId === book.id) fillDetail(book, false);
  }
}

// PATCH /books/:id (title and author)
async function saveEdit(event) {
  event.preventDefault();
  const title = $('editTitle').value.trim();
  const author = $('editAuthor').value.trim();
  $('editMessage').textContent = '';

  if (!title) {
    $('editMessage').textContent = 'A book needs a title.';
    $('editTitle').focus();
    return;
  }

  try {
    await request(`/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    });
    toast('Changes saved');
    await loadBooks();
    const updated = books.find((b) => b.id === selectedId);
    if (updated) fillDetail(updated, false);
  } catch (err) {
    $('editMessage').textContent = err.message;
  }
}

// DELETE /books/:id
async function removeBook() {
  const book = books.find((b) => b.id === selectedId);
  if (!book) return;
  if (!confirm(`Remove "${book.title}" from your shelf?`)) return;
  try {
    await request(`/${book.id}`, { method: 'DELETE' });
    closeDetail();
    toast(`Removed "${book.title}"`);
    await loadBooks();
  } catch (err) {
    $('editMessage').textContent = err.message;
  }
}

/* ---------- details panel ---------- */

function paintCover(el, book) {
  el.style.background = coverBackground(book.title);
  el.querySelector('.cover-title').textContent = book.title;
  el.querySelector('.cover-author').textContent = book.author || 'Unknown author';
}

function fillDetail(book, resetFields = true) {
  if (!book) return;
  paintCover($('detailCover'), book);
  if (resetFields) {
    $('editTitle').value = book.title;
    $('editAuthor').value = book.author || '';
    $('editMessage').textContent = '';
  }
  $('editFinished').checked = isFinished(book);
  $('switchText').textContent = isFinished(book) ? 'Finished' : 'Not finished yet';
}

function markSelected() {
  grid.querySelectorAll('.book').forEach((el) => {
    el.classList.toggle('selected', Number(el.dataset.id) === selectedId);
  });
}

function openDetail(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return;
  selectedId = id;
  fillDetail(book);
  app.classList.add('has-detail');
  $('detail').setAttribute('aria-hidden', 'false');
  markSelected();
}

function closeDetail() {
  selectedId = null;
  app.classList.remove('has-detail');
  $('detail').setAttribute('aria-hidden', 'true');
  markSelected();
}

/* ---------- rendering ---------- */

function greeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${OWNER}`;
}

function updateSummary() {
  const finished = books.filter(isFinished).length;
  const total = books.length;
  const pct = total ? Math.round((finished / total) * 100) : 0;

  $('countAll').textContent = total;
  $('countUnread').textContent = total - finished;
  $('countFinished').textContent = finished;
  $('ringPct').textContent = `${pct}%`;
  $('ringBar').style.strokeDashoffset = RING_LENGTH * (1 - pct / 100);
  $('goalText').textContent = total === 0
    ? 'Add a book to begin'
    : `${finished} of ${total} books finished`;

  $('hello').textContent = greeting();
  $('viewTitle').textContent = { all: 'All books', unread: 'To read', finished: 'Finished' }[filter];
}

function visibleBooks() {
  const q = query.toLowerCase();
  const list = books.filter((b) => {
    if (filter === 'finished' && !isFinished(b)) return false;
    if (filter === 'unread' && isFinished(b)) return false;
    if (!q) return true;
    return `${b.title} ${b.author || ''}`.toLowerCase().includes(q);
  });

  const byNewest = (a, b) => b.id - a.id;
  if (sortBy === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'author') list.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
  else if (sortBy === 'unfinished') list.sort((a, b) => Number(isFinished(a)) - Number(isFinished(b)) || byNewest(a, b));
  else list.sort(byNewest);
  return list;
}

function buildCard(book) {
  const done = isFinished(book);

  const article = document.createElement('article');
  article.className = 'book';
  article.dataset.id = book.id;

  const cover = document.createElement('button');
  cover.type = 'button';
  cover.className = 'cover';
  cover.setAttribute('aria-label', `Open details for ${book.title}`);
  cover.innerHTML = '<span class="cover-title"></span><span class="cover-author"></span>';
  paintCover(cover, book);
  cover.addEventListener('click', () => openDetail(book.id));

  if (done) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.innerHTML = CHECK_SVG;
    cover.appendChild(badge);
  }

  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip';
  chip.setAttribute('aria-pressed', done);
  chip.innerHTML = done ? CHECK_SVG : '';
  chip.append(done ? 'Finished' : 'Mark as finished');
  chip.addEventListener('click', () => toggleFinished(book, chip));

  article.append(cover, chip);
  return article;
}

function render() {
  updateSummary();
  grid.innerHTML = '';

  const list = visibleBooks();

  if (books.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = '<strong>Your shelf is empty</strong>Add your first book and it will appear here.';
    grid.appendChild(empty);
  } else if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = '<strong>No books match</strong>Try another filter or search.';
    grid.appendChild(empty);
  } else {
    list.forEach((book) => grid.appendChild(buildCard(book)));
  }

  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'add-tile';
  tile.innerHTML = PLUS_SVG;
  tile.append('Add a book');
  tile.addEventListener('click', () => {
    titleInput.scrollIntoView({ block: 'center' });
    titleInput.focus();
  });
  grid.appendChild(tile);

  markSelected();
}

/* ---------- events ---------- */

$('addForm').addEventListener('submit', addBook);
$('editForm').addEventListener('submit', saveEdit);
$('closeDetail').addEventListener('click', closeDetail);
$('deleteBtn').addEventListener('click', removeBook);

$('editFinished').addEventListener('change', (e) => {
  const book = books.find((b) => b.id === selectedId);
  if (book) toggleFinished(book, e.target.closest('.switch'));
});

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    render();
  });
});

$('searchInput').addEventListener('input', (e) => {
  query = e.target.value.trim();
  render();
});

$('sortSelect').addEventListener('change', (e) => {
  sortBy = e.target.value;
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && selectedId) closeDetail();
});

loadBooks();