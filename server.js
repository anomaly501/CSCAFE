const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, queryAll, queryOne, runSQL } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allow all origins — restrict to your domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===================================================================
//  UPDATES
// ===================================================================

app.get('/api/updates', async (req, res) => {
    try {
        const { cat, exclude } = req.query;
        let query = 'SELECT * FROM updates';
        const params = [];
        const conditions = [];
        if (cat && cat !== 'all') { conditions.push(`category = $${params.length + 1}`); params.push(cat); }
        if (exclude) { conditions.push(`id != $${params.length + 1}`); params.push(parseInt(exclude)); }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY date DESC, id DESC';
        const rows = await queryAll(query, params);
        res.json(rows.map(r => ({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author,
            readTime: r.read_time, tags: r.tags || ''
        })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/updates/:id', async (req, res) => {
    try {
        const r = await queryOne('SELECT * FROM updates WHERE id = $1', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author,
            readTime: r.read_time, tags: r.tags || ''
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/updates', async (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink, author, readTime, tags } = req.body;
        const result = await runSQL(
            'INSERT INTO updates (title,description,category,date,link,reg_link,author,read_time,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
            [title, desc || '', cat, date, link || '', regLink || '', author || 'CSPOINT Team', readTime || 2, tags || '']
        );
        const r = result.rows[0];
        res.status(201).json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author,
            readTime: r.read_time, tags: r.tags || ''
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/updates/:id', async (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink, tags } = req.body;
        const result = await runSQL(
            'UPDATE updates SET title=$1,description=$2,category=$3,date=$4,link=$5,reg_link=$6,tags=$7 WHERE id=$8 RETURNING *',
            [title, desc || '', cat, date, link || '', regLink || '', tags || '', parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author,
            readTime: r.read_time, tags: r.tags || ''
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/updates/:id', async (req, res) => {
    try { await runSQL('DELETE FROM updates WHERE id = $1', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  DEADLINES
// ===================================================================

app.get('/api/deadlines', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM deadlines ORDER BY deadline_date ASC');
        res.json(rows.map(r => ({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/deadlines', async (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        const result = await runSQL(
            'INSERT INTO deadlines (name,deadline_date,status,link) VALUES ($1,$2,$3,$4) RETURNING *',
            [name, date, status, link || '']
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/deadlines/:id', async (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        const result = await runSQL(
            'UPDATE deadlines SET name=$1,deadline_date=$2,status=$3,link=$4 WHERE id=$5 RETURNING *',
            [name, date, status, link || '', parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/deadlines/:id', async (req, res) => {
    try { await runSQL('DELETE FROM deadlines WHERE id = $1', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  RESOURCES
// ===================================================================

app.get('/api/resources', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM resources ORDER BY id DESC');
        res.json(rows.map(r => ({ id: r.id, name: r.name, type: r.file_type, size: r.file_size })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/resources', async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const result = await runSQL(
            'INSERT INTO resources (name,file_type,file_size) VALUES ($1,$2,$3) RETURNING *',
            [name, type, size || '']
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/resources/:id', async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const result = await runSQL(
            'UPDATE resources SET name=$1,file_type=$2,file_size=$3 WHERE id=$4 RETURNING *',
            [name, type, size || '', parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/resources/:id', async (req, res) => {
    try { await runSQL('DELETE FROM resources WHERE id = $1', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  LINKS
// ===================================================================

app.get('/api/links', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM links ORDER BY id DESC');
        res.json(rows.map(r => ({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/links', async (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        const result = await runSQL(
            'INSERT INTO links (label,url,category,description) VALUES ($1,$2,$3,$4) RETURNING *',
            [label, url, cat, desc || '']
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/links/:id', async (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        const result = await runSQL(
            'UPDATE links SET label=$1,url=$2,category=$3,description=$4 WHERE id=$5 RETURNING *',
            [label, url, cat, desc || '', parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/links/:id', async (req, res) => {
    try { await runSQL('DELETE FROM links WHERE id = $1', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  STATS
// ===================================================================

app.get('/api/stats', async (req, res) => {
    try {
        const [u, d, r, l] = await Promise.all([
            queryOne('SELECT COUNT(*) AS c FROM updates'),
            queryOne('SELECT COUNT(*) AS c FROM deadlines'),
            queryOne('SELECT COUNT(*) AS c FROM resources'),
            queryOne('SELECT COUNT(*) AS c FROM links'),
        ]);
        res.json({ updates: parseInt(u.c), deadlines: parseInt(d.c), resources: parseInt(r.c), links: parseInt(l.c) });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  START — init DB then start server
// ===================================================================

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n  ✅  CSPOINT API running at http://localhost:${PORT}`);
        console.log(`  📄  Open http://localhost:${PORT}/index.html in your browser\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
