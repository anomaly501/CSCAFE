const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// ===================================================================
//  UPDATES
// ===================================================================

// GET all updates (optional ?cat= and ?exclude= query params)
app.get('/api/updates', async (req, res) => {
    try {
        const { cat, exclude } = req.query;
        let query = 'SELECT * FROM updates';
        const params = [];
        const conditions = [];

        if (cat && cat !== 'all') {
            params.push(cat);
            conditions.push(`category = $${params.length}`);
        }
        if (exclude) {
            params.push(parseInt(exclude));
            conditions.push(`id != $${params.length}`);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY date DESC, id DESC';

        const result = await pool.query(query, params);
        // Map DB columns to frontend expected field names
        const rows = result.rows.map(r => ({
            id: r.id,
            title: r.title,
            desc: r.description,
            cat: r.category,
            date: r.date ? r.date.toISOString().split('T')[0] : '',
            link: r.link,
            regLink: r.reg_link,
            author: r.author,
            readTime: r.read_time
        }));
        res.json(rows);
    } catch (err) {
        console.error('GET /api/updates error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single update by ID
app.get('/api/updates/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM updates WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({
            id: r.id,
            title: r.title,
            desc: r.description,
            cat: r.category,
            date: r.date ? r.date.toISOString().split('T')[0] : '',
            link: r.link,
            regLink: r.reg_link,
            author: r.author,
            readTime: r.read_time
        });
    } catch (err) {
        console.error('GET /api/updates/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST new update
app.post('/api/updates', async (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink, author, readTime } = req.body;
        const result = await pool.query(
            `INSERT INTO updates (title, description, category, date, link, reg_link, author, read_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, desc || '', cat, date, link || '', regLink || '', author || 'CSPOINT Team', readTime || 2]
        );
        const r = result.rows[0];
        res.status(201).json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date ? r.date.toISOString().split('T')[0] : '', link: r.link,
            regLink: r.reg_link, author: r.author, readTime: r.read_time
        });
    } catch (err) {
        console.error('POST /api/updates error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT (edit) update
app.put('/api/updates/:id', async (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink } = req.body;
        const result = await pool.query(
            `UPDATE updates SET title=$1, description=$2, category=$3, date=$4, link=$5, reg_link=$6
             WHERE id=$7 RETURNING *`,
            [title, desc || '', cat, date, link || '', regLink || '', req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date ? r.date.toISOString().split('T')[0] : '', link: r.link,
            regLink: r.reg_link, author: r.author, readTime: r.read_time
        });
    } catch (err) {
        console.error('PUT /api/updates/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE update
app.delete('/api/updates/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM updates WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/updates/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================================================
//  DEADLINES
// ===================================================================

app.get('/api/deadlines', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM deadlines ORDER BY deadline_date ASC');
        const rows = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            date: r.deadline_date ? r.deadline_date.toISOString().replace('.000Z', '').replace('Z', '') : '',
            status: r.status,
            link: r.link
        }));
        res.json(rows);
    } catch (err) {
        console.error('GET /api/deadlines error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/deadlines', async (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        const result = await pool.query(
            `INSERT INTO deadlines (name, deadline_date, status, link) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, date, status, link || '']
        );
        const r = result.rows[0];
        res.status(201).json({
            id: r.id, name: r.name,
            date: r.deadline_date ? r.deadline_date.toISOString().replace('.000Z', '').replace('Z', '') : '',
            status: r.status, link: r.link
        });
    } catch (err) {
        console.error('POST /api/deadlines error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/deadlines/:id', async (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        const result = await pool.query(
            `UPDATE deadlines SET name=$1, deadline_date=$2, status=$3, link=$4 WHERE id=$5 RETURNING *`,
            [name, date, status, link || '', req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({
            id: r.id, name: r.name,
            date: r.deadline_date ? r.deadline_date.toISOString().replace('.000Z', '').replace('Z', '') : '',
            status: r.status, link: r.link
        });
    } catch (err) {
        console.error('PUT /api/deadlines/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/deadlines/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM deadlines WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/deadlines/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================================================
//  RESOURCES
// ===================================================================

app.get('/api/resources', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resources ORDER BY id DESC');
        const rows = result.rows.map(r => ({
            id: r.id, name: r.name, type: r.file_type, size: r.file_size
        }));
        res.json(rows);
    } catch (err) {
        console.error('GET /api/resources error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/resources', async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const result = await pool.query(
            `INSERT INTO resources (name, file_type, file_size) VALUES ($1, $2, $3) RETURNING *`,
            [name, type, size || '']
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) {
        console.error('POST /api/resources error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/resources/:id', async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const result = await pool.query(
            `UPDATE resources SET name=$1, file_type=$2, file_size=$3 WHERE id=$4 RETURNING *`,
            [name, type, size || '', req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) {
        console.error('PUT /api/resources/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM resources WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/resources/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================================================
//  LINKS
// ===================================================================

app.get('/api/links', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM links ORDER BY id DESC');
        const rows = result.rows.map(r => ({
            id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description
        }));
        res.json(rows);
    } catch (err) {
        console.error('GET /api/links error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/links', async (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        const result = await pool.query(
            `INSERT INTO links (label, url, category, description) VALUES ($1, $2, $3, $4) RETURNING *`,
            [label, url, cat, desc || '']
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) {
        console.error('POST /api/links error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/links/:id', async (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        const result = await pool.query(
            `UPDATE links SET label=$1, url=$2, category=$3, description=$4 WHERE id=$5 RETURNING *`,
            [label, url, cat, desc || '', req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) {
        console.error('PUT /api/links/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/links/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM links WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/links/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================================================
//  STATS (for dashboard)
// ===================================================================

app.get('/api/stats', async (req, res) => {
    try {
        const [u, d, r, l] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM updates'),
            pool.query('SELECT COUNT(*) FROM deadlines'),
            pool.query('SELECT COUNT(*) FROM resources'),
            pool.query('SELECT COUNT(*) FROM links'),
        ]);
        res.json({
            updates: parseInt(u.rows[0].count),
            deadlines: parseInt(d.rows[0].count),
            resources: parseInt(r.rows[0].count),
            links: parseInt(l.rows[0].count),
        });
    } catch (err) {
        console.error('GET /api/stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================================================
//  START SERVER
// ===================================================================

app.listen(PORT, () => {
    console.log(`\n  ✅  CSPOINT API running at http://localhost:${PORT}`);
    console.log(`  📄  Open http://localhost:${PORT}/index.html in your browser\n`);
});
