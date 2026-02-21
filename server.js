const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, queryAll, queryOne, runSQL, lastId } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://YOUR_GITHUB_PAGES_URL'  // TODO: Replace with your actual GitHub Pages URL, e.g. 'https://username.github.io'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===================================================================
//  UPDATES
// ===================================================================

app.get('/api/updates', (req, res) => {
    try {
        const { cat, exclude } = req.query;
        let query = 'SELECT * FROM updates';
        const params = [];
        const conditions = [];
        if (cat && cat !== 'all') { conditions.push('category = ?'); params.push(cat); }
        if (exclude) { conditions.push('id != ?'); params.push(parseInt(exclude)); }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY date DESC, id DESC';
        const rows = queryAll(query, params).map(r => ({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author, readTime: r.read_time
        }));
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/updates/:id', (req, res) => {
    try {
        const r = queryOne('SELECT * FROM updates WHERE id = ?', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ id: r.id, title: r.title, desc: r.description, cat: r.category, date: r.date, link: r.link, regLink: r.reg_link, author: r.author, readTime: r.read_time });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/updates', (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink, author, readTime } = req.body;
        runSQL('INSERT INTO updates (title,description,category,date,link,reg_link,author,read_time) VALUES (?,?,?,?,?,?,?,?)',
            [title, desc || '', cat, date, link || '', regLink || '', author || 'CSPOINT Team', readTime || 2]);
        const r = queryOne('SELECT * FROM updates WHERE id = ?', [lastId()]);
        res.status(201).json({ id: r.id, title: r.title, desc: r.description, cat: r.category, date: r.date, link: r.link, regLink: r.reg_link, author: r.author, readTime: r.read_time });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/updates/:id', (req, res) => {
    try {
        const { title, desc, cat, date, link, regLink } = req.body;
        runSQL('UPDATE updates SET title=?,description=?,category=?,date=?,link=?,reg_link=? WHERE id=?',
            [title, desc || '', cat, date, link || '', regLink || '', parseInt(req.params.id)]);
        const r = queryOne('SELECT * FROM updates WHERE id = ?', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ id: r.id, title: r.title, desc: r.description, cat: r.category, date: r.date, link: r.link, regLink: r.reg_link, author: r.author, readTime: r.read_time });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/updates/:id', (req, res) => {
    try { runSQL('DELETE FROM updates WHERE id = ?', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  DEADLINES
// ===================================================================

app.get('/api/deadlines', (req, res) => {
    try {
        const rows = queryAll('SELECT * FROM deadlines ORDER BY deadline_date ASC').map(r => ({
            id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link
        }));
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/deadlines', (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        runSQL('INSERT INTO deadlines (name,deadline_date,status,link) VALUES (?,?,?,?)', [name, date, status, link || '']);
        const r = queryOne('SELECT * FROM deadlines WHERE id = ?', [lastId()]);
        res.status(201).json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/deadlines/:id', (req, res) => {
    try {
        const { name, date, status, link } = req.body;
        runSQL('UPDATE deadlines SET name=?,deadline_date=?,status=?,link=? WHERE id=?', [name, date, status, link || '', parseInt(req.params.id)]);
        const r = queryOne('SELECT * FROM deadlines WHERE id = ?', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/deadlines/:id', (req, res) => {
    try { runSQL('DELETE FROM deadlines WHERE id = ?', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  RESOURCES
// ===================================================================

app.get('/api/resources', (req, res) => {
    try {
        const rows = queryAll('SELECT * FROM resources ORDER BY id DESC').map(r => ({
            id: r.id, name: r.name, type: r.file_type, size: r.file_size
        }));
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/resources', (req, res) => {
    try {
        const { name, type, size } = req.body;
        runSQL('INSERT INTO resources (name,file_type,file_size) VALUES (?,?,?)', [name, type, size || '']);
        const r = queryOne('SELECT * FROM resources WHERE id = ?', [lastId()]);
        res.status(201).json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/resources/:id', (req, res) => {
    try {
        const { name, type, size } = req.body;
        runSQL('UPDATE resources SET name=?,file_type=?,file_size=? WHERE id=?', [name, type, size || '', parseInt(req.params.id)]);
        const r = queryOne('SELECT * FROM resources WHERE id = ?', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/resources/:id', (req, res) => {
    try { runSQL('DELETE FROM resources WHERE id = ?', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  LINKS
// ===================================================================

app.get('/api/links', (req, res) => {
    try {
        const rows = queryAll('SELECT * FROM links ORDER BY id DESC').map(r => ({
            id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description
        }));
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/links', (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        runSQL('INSERT INTO links (label,url,category,description) VALUES (?,?,?,?)', [label, url, cat, desc || '']);
        const r = queryOne('SELECT * FROM links WHERE id = ?', [lastId()]);
        res.status(201).json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/links/:id', (req, res) => {
    try {
        const { label, url, cat, desc } = req.body;
        runSQL('UPDATE links SET label=?,url=?,category=?,description=? WHERE id=?', [label, url, cat, desc || '', parseInt(req.params.id)]);
        const r = queryOne('SELECT * FROM links WHERE id = ?', [parseInt(req.params.id)]);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/links/:id', (req, res) => {
    try { runSQL('DELETE FROM links WHERE id = ?', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  STATS
// ===================================================================

app.get('/api/stats', (req, res) => {
    try {
        res.json({
            updates: queryAll('SELECT COUNT(*) as c FROM updates')[0].c,
            deadlines: queryAll('SELECT COUNT(*) as c FROM deadlines')[0].c,
            resources: queryAll('SELECT COUNT(*) as c FROM resources')[0].c,
            links: queryAll('SELECT COUNT(*) as c FROM links')[0].c,
        });
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
