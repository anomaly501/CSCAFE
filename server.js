require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDB, queryAll, queryOne, runSQL } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================================================
//  SECURITY MIDDLEWARE
// ===================================================================

// Helmet — sets many secure HTTP headers automatically
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "cdn.tailwindcss.com"],
            "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            "font-src": ["'self'", "fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "blob:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS — restrict to same origin (or specify your domain)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [`http://localhost:${PORT}`];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, same-origin browser)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Rate limiting — global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // max 200 requests per window
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// Stricter rate limit for mutating endpoints
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Too many write operations. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve only the public/ folder for static files
app.use(express.static(path.join(__dirname, 'public')));

// ===================================================================
//  API KEY AUTHENTICATION MIDDLEWARE
// ===================================================================

// Generate a random API key if not set in .env
const API_KEY = process.env.API_KEY || require('crypto').randomBytes(32).toString('hex');

function requireAuth(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.apikey;
    if (!key || key !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized. Provide a valid X-API-Key header.' });
    }
    next();
}

app.get('/api/verify-auth', requireAuth, (req, res) => res.json({ valid: true }));

// ===================================================================
//  INPUT VALIDATION HELPERS
// ===================================================================

function validateString(val, maxLen = 500) {
    if (val === undefined || val === null) return '';
    return String(val).trim().slice(0, maxLen);
}

function validateUrl(val) {
    if (!val) return '';
    const trimmed = String(val).trim();
    try {
        const parsed = new URL(trimmed);
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return trimmed;
        return '';
    } catch {
        return '';
    }
}

function validateCategory(cat) {
    const allowed = ['Exams', 'Internship', 'Workshop', 'Notice', 'Results', 'Contest',
        'Jobs', 'Scholarship', 'Hackathon', 'Fellowship', 'General', 'Blog'];
    return allowed.includes(cat) ? cat : 'General';
}

function validateDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : dateStr;
}

// ===================================================================
//  UPDATES  (GET = public, POST/PUT/DELETE = auth required)
// ===================================================================

app.get('/api/updates', async (req, res) => {
    try {
        const { cat, exclude } = req.query;
        let query = 'SELECT * FROM updates';
        const params = [];
        const conditions = [];
        if (cat && cat !== 'all') { conditions.push(`category = $${params.length + 1}`); params.push(validateString(cat, 50)); }
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

app.post('/api/updates', requireAuth, writeLimiter, async (req, res) => {
    try {
        const title = validateString(req.body.title, 300);
        const desc = validateString(req.body.desc, 2000);
        const cat = validateCategory(req.body.cat);
        const date = validateDate(req.body.date);
        const link = validateUrl(req.body.link);
        const regLink = validateUrl(req.body.regLink);
        const author = validateString(req.body.author, 100) || 'cscafe Team';
        const readTime = parseInt(req.body.readTime) || 2;
        const tags = validateString(req.body.tags, 500);

        if (!title) return res.status(400).json({ error: 'Title is required.' });
        if (!date) return res.status(400).json({ error: 'Valid date is required.' });

        const result = await runSQL(
            'INSERT INTO updates (title,description,category,date,link,reg_link,author,read_time,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
            [title, desc, cat, date, link, regLink, author, readTime, tags]
        );
        const r = result.rows[0];
        res.status(201).json({
            id: r.id, title: r.title, desc: r.description, cat: r.category,
            date: r.date, link: r.link, regLink: r.reg_link, author: r.author,
            readTime: r.read_time, tags: r.tags || ''
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/updates/:id', requireAuth, writeLimiter, async (req, res) => {
    try {
        const title = validateString(req.body.title, 300);
        const desc = validateString(req.body.desc, 2000);
        const cat = validateCategory(req.body.cat);
        const date = validateDate(req.body.date);
        const link = validateUrl(req.body.link);
        const regLink = validateUrl(req.body.regLink);
        const tags = validateString(req.body.tags, 500);

        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const result = await runSQL(
            'UPDATE updates SET title=$1,description=$2,category=$3,date=$4,link=$5,reg_link=$6,tags=$7 WHERE id=$8 RETURNING *',
            [title, desc, cat, date, link, regLink, tags, parseInt(req.params.id)]
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

app.delete('/api/updates/:id', requireAuth, writeLimiter, async (req, res) => {
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

app.post('/api/deadlines', requireAuth, writeLimiter, async (req, res) => {
    try {
        const name = validateString(req.body.name, 300);
        const date = validateDate(req.body.date);
        const status = validateString(req.body.status, 50);
        const link = validateUrl(req.body.link);

        if (!name) return res.status(400).json({ error: 'Name is required.' });
        if (!date) return res.status(400).json({ error: 'Valid date is required.' });

        const result = await runSQL(
            'INSERT INTO deadlines (name,deadline_date,status,link) VALUES ($1,$2,$3,$4) RETURNING *',
            [name, date, status, link]
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/deadlines/:id', requireAuth, writeLimiter, async (req, res) => {
    try {
        const name = validateString(req.body.name, 300);
        const date = validateDate(req.body.date);
        const status = validateString(req.body.status, 50);
        const link = validateUrl(req.body.link);

        if (!name) return res.status(400).json({ error: 'Name is required.' });

        const result = await runSQL(
            'UPDATE deadlines SET name=$1,deadline_date=$2,status=$3,link=$4 WHERE id=$5 RETURNING *',
            [name, date, status, link, parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, name: r.name, date: r.deadline_date, status: r.status, link: r.link });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/deadlines/:id', requireAuth, writeLimiter, async (req, res) => {
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

app.post('/api/resources', requireAuth, writeLimiter, async (req, res) => {
    try {
        const name = validateString(req.body.name, 300);
        const type = validateString(req.body.type, 50);
        const size = validateString(req.body.size, 50);

        if (!name) return res.status(400).json({ error: 'Name is required.' });

        const result = await runSQL(
            'INSERT INTO resources (name,file_type,file_size) VALUES ($1,$2,$3) RETURNING *',
            [name, type, size]
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/resources/:id', requireAuth, writeLimiter, async (req, res) => {
    try {
        const name = validateString(req.body.name, 300);
        const type = validateString(req.body.type, 50);
        const size = validateString(req.body.size, 50);

        if (!name) return res.status(400).json({ error: 'Name is required.' });

        const result = await runSQL(
            'UPDATE resources SET name=$1,file_type=$2,file_size=$3 WHERE id=$4 RETURNING *',
            [name, type, size, parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, name: r.name, type: r.file_type, size: r.file_size });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/resources/:id', requireAuth, writeLimiter, async (req, res) => {
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

app.post('/api/links', requireAuth, writeLimiter, async (req, res) => {
    try {
        const label = validateString(req.body.label, 300);
        const url = validateUrl(req.body.url);
        const cat = validateString(req.body.cat, 50);
        const desc = validateString(req.body.desc, 500);

        if (!label) return res.status(400).json({ error: 'Label is required.' });
        if (!url) return res.status(400).json({ error: 'Valid URL is required.' });

        const result = await runSQL(
            'INSERT INTO links (label,url,category,description) VALUES ($1,$2,$3,$4) RETURNING *',
            [label, url, cat, desc]
        );
        const r = result.rows[0];
        res.status(201).json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/links/:id', requireAuth, writeLimiter, async (req, res) => {
    try {
        const label = validateString(req.body.label, 300);
        const url = validateUrl(req.body.url);
        const cat = validateString(req.body.cat, 50);
        const desc = validateString(req.body.desc, 500);

        if (!label) return res.status(400).json({ error: 'Label is required.' });

        const result = await runSQL(
            'UPDATE links SET label=$1,url=$2,category=$3,description=$4 WHERE id=$5 RETURNING *',
            [label, url, cat, desc, parseInt(req.params.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        res.json({ id: r.id, label: r.label, url: r.url, cat: r.category, desc: r.description });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/links/:id', requireAuth, writeLimiter, async (req, res) => {
    try { await runSQL('DELETE FROM links WHERE id = $1', [parseInt(req.params.id)]); res.json({ success: true }); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ===================================================================
//  STATS (public)
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
        console.log(`\n  ✅  cscafe API running at http://localhost:${PORT}`);
        console.log(`  📄  Open http://localhost:${PORT}/index.html in your browser`);
        console.log(`  🔑  API Key: ${API_KEY}`);
        console.log(`  ⚠️  Store this key in .env as API_KEY= to keep it persistent\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
