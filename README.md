# 📚 Booknook: Book Library API

A REST API for managing a personal book library, built with **Node.js**, **Express** and **MySQL** (hosted on **Aiven**). It comes with a simple frontend, **Booknook**, for adding books, tracking what we've  finished and seeing your reading progress.

## Features

- Full CRUD for books: create, read, update (PUT and PATCH) and delete
- Mark books as finished. The time you finished is saved automatically in `finished_at`
- Input checks with clear error messages (for example, `Title is required`)
- Central error handling with proper HTTP status codes
- Frontend served by the same Express server at `http://localhost:3000`
- Filters (All / To read / Finished), search, sorting and a reading progress ring

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express 5                  |
| Database | MySQL (Aiven cloud) using `mysql2`  |
| Frontend | HTML, CSS, JavaScript (Fetch API)   |
| Tools    | nodemon, dotenv, cors               |

## Project Structure

```
API/
├── database/
│   └── schema.sql            # Creates the table and adds sample books
├── frontend/
│   ├── index.html            # Booknook UI
│   ├── script.js             # Talks to the API with fetch
│   └── style.css
├── src/
│   ├── controllers/
│   │   └── bookController.js # Request handling and validation
│   ├── models/
│   │   └── bookModel.js      # SQL queries
│   ├── routes/
│   │   └── taskRoures.js     # /books routes
│   └── db.js                 # MySQL connection pool
├── .env                      # Database credentials (not committed)
├── .gitignore
├── package.json
└── server.js                 # App entry point
```

The project follows the **MVC pattern**: routes → controllers → models → database.

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A MySQL database (this project uses [Aiven](https://aiven.io/))
- MySQL Workbench (optional, for running the schema)

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=avnadmin
DB_PASS=your-password
DB_NAME=defaultdb
DB_SSL=REQUIRED
PORT=3000
```

important to note > ⚠️ Never commit `.env`. It is already listed in `.gitignore`.

### 4. Create the database table

Open `database/schema.sql` in MySQL Workbench and run the whole file. You can safely run it more than once, because it only creates or adds what is missing.

### 5. Run the server

```bash
npm run dev     # development (auto-restarts with nodemon)
npm start       # production
```

When it starts we will see:

```
Book Library API running at http://localhost:3000
Connected to MySQL. Books in table: 2
```

Open **http://localhost:3000** in browser to use Booknook.

## Database Schema

Table: `library_books`

| Column        | Type          | Notes                                 |
|---------------|---------------|---------------------------------------|
| `id`          | INT           | Primary key, auto increment           |
| `title`       | VARCHAR(255)  | Required                              |
| `author`      | VARCHAR(255)  | Optional                              |
| `finished`    | BOOLEAN       | Default `FALSE`                       |
| `finished_at` | TIMESTAMP     | Set when a book is marked finished    |
| `created_at`  | TIMESTAMP     | Set automatically                     |
| `updated_at`  | TIMESTAMP     | Updated automatically on every change |

## API Endpoints

Base URL: `http://localhost:3000/books`

| Method | Endpoint      | Description                     |
|--------|---------------|---------------------------------|
| GET    | `/books`      | Get all books (newest first)    |
| GET    | `/books/:id`  | Get one book by ID              |
| POST   | `/books`      | Add a new book                  |
| PUT    | `/books/:id`  | Replace a book (all fields)     |
| PATCH  | `/books/:id`  | Update some fields of a book    |
| DELETE | `/books/:id`  | Delete a book                   |

### Examples

**Create a book**

```http
POST /books
Content-Type: application/json

{
  "title": "Atomic Habits",
  "author": "James Clear"
}
```

Response `201 Created`:

```json
{
  "id": 3,
  "title": "Atomic Habits",
  "author": "James Clear",
  "finished": 0,
  "finished_at": null,
  "created_at": "2026-10-27T12:00:00.000Z",
  "updated_at": "2026-10-27T12:00:00.000Z"
}
```

**Mark a book as finished**

```http
PATCH /books/3
Content-Type: application/json

{ "finished": true }
```

**Replace a book**

```http
PUT /books/3
Content-Type: application/json

{
  "title": "Atomic Habits",
  "author": "James Clear",
  "finished": false
}
```

**Delete a book**

```http
DELETE /books/3
```

Response: `204 No Content`

### Status Codes

| Code | Meaning                                                 |
|------|---------------------------------------------------------|
| 200  | Success                                                 |
| 201  | Book created                                            |
| 204  | Book deleted                                            |
| 400  | Invalid input (for example, missing title)              |
| 404  | Book not found                                          |
| 500  | Server or database error                                |

Errors are returned as JSON:

```json
{ "error": "Title is required" }
```

## Testing

To test the API:

- **The Booknook frontend** at `http://localhost:3000`
- **Browser**: open `http://localhost:3000/books` to see all books as JSON

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Title is required` even when a title is filled in | Make sure `app.use(express.json())` comes before the routes in `server.js` |
| `Unknown column 'finished_at'` | Run `database/schema.sql` again; it adds the missing column |
| `MySQL connection failed` | Check the values in `.env` and that `DB_SSL=REQUIRED` is set for Aiven |
| Page shows `Cannot reach the server` | Start the backend with `npm run dev` |


