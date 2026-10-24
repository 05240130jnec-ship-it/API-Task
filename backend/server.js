const express = require('express'); 
  
const app = express(); 

const cors = require('cors');
app.use(cors());
// This MUST come before your routes, or req.body will be undefined 
app.use(express.json()); 
  
const PORT = process.env.PORT || 3000; 
  
// In-memory storage — wiped when the server restarts 
let tasks  = []; 
let nextId = 1; 
  
app.get('/', (req, res) => { 
  res.json({ message: 'Task API is ready!' }); 
}); 
  
// TODO: add GET /tasks, POST /tasks, GET /tasks/:id, 
//    PATCH /tasks/:id, DELETE /tasks/:id below 
  
app.use((err, req, res, next) => { 
  console.error('Unhandled error:', err.stack); 
  res.status(err.statusCode || 500).json({ 
 error: err.message || 'Internal Server Error', 
  }); 
}); 
  
app.listen(PORT, () => { 
  console.log(`Server is running at http://localhost:${PORT}`); 
}); 

// GET /tasks — return every task
app.get('/tasks', (req, res) => {
    res.json(tasks);
});