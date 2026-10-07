const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;  

app.use(express.json());

// Example route to get data from the database      

app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }   
});

app.get('/note/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/note', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *', [title, content]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Example route to update data in the database
app.put('/note/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;    
    try {
        const result = await pool.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}); 

// Example route to delete data from the database
app.delete('/note/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        await pool.query('DELETE FROM notes WHERE id = $1', [id]);
        res.status(204).send();
    }   catch (err) { 
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.get('/notes/search', async (req, res) => {
    const { q } = req.query;
    const result = await pool.query(
        'SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1',
        [`%${q}%`]
    );
    res.json(result.rows);
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});