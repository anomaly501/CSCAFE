const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'cspoint.db');

let db;

async function initDB() {
    const SQL = await initSqlJs();

    // Load existing DB or create new one
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            category TEXT NOT NULL DEFAULT 'General',
            date TEXT NOT NULL DEFAULT (date('now')),
            link TEXT DEFAULT '',
            reg_link TEXT DEFAULT '',
            author TEXT DEFAULT 'CSPOINT Team',
            read_time INTEGER DEFAULT 2
        );
        CREATE TABLE IF NOT EXISTS deadlines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            deadline_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Open',
            link TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_type TEXT NOT NULL DEFAULT 'PDF',
            file_size TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Other',
            description TEXT DEFAULT ''
        );
    `);

    // Seed if empty
    const count = db.exec('SELECT COUNT(*) as c FROM updates')[0].values[0][0];
    if (count === 0) {
        const updates = [
            ['IISc – CNI Summer Internships 2026', 'Centre for Networked Intelligence at IISc Bangalore invites applications for summer research internship in AI, ML, networking.', 'Internship', '2026-02-19', 'https://cni.iisc.ac.in/opportunities/research-intern/', 'https://cni.iisc.ac.in/opportunities/research-intern/', 'CSPOINT Team', 3],
            ['IIT Kanpur: SURGE Summer Internships 2026', 'Summer Undergraduate Research Grant for Excellence at IIT Kanpur. Open to UG students from all recognized institutions.', 'Internship', '2026-02-19', 'https://surge.iitk.ac.in', 'https://surge.iitk.ac.in', 'CSPOINT Team', 3],
            ['IIT Jodhpur: SURAJ Summer Internships 2026', 'Summer Undergraduate Research Award at Jodhpur. Research internship across engineering and science departments.', 'Internship', '2026-02-19', 'https://www.iitj.ac.in/suraj/en/internship', 'https://www.iitj.ac.in/suraj/en/internship', 'CSPOINT Team', 3],
            ['CSIR-SERC: Summer Internships 2026', 'CSIR Structural Engineering Research Centre Prof. G.S. Ramaswamy internship for UG and dual degree students.', 'Internship', '2026-02-19', 'https://serc.res.in/professor-gs-ramaswamy-internship-undergraduate-dual-degree-students', 'https://serc.res.in/professor-gs-ramaswamy-internship-undergraduate-dual-degree-students', 'CSPOINT Team', 3],
            ['IISER Pune Summer Student Program 2026', 'Summer Student Programme for UG students across science and engineering disciplines at IISER Pune.', 'Internship', '2026-02-19', 'https://www.iiserpune.ac.in/announcements/48/summer-student-programme-2026', 'https://www.iiserpune.ac.in/announcements/48/summer-student-programme-2026', 'CSPOINT Team', 3],
            ['IIT Madras SRFP 2026 — Summer Fellowship', 'IIT Madras Summer Research Fellowship Programme. Apply for research positions across all departments.', 'Internship', '2026-02-19', 'https://ssp.iitm.ac.in/summer-fellowship-registration', 'https://ssp.iitm.ac.in/summer-fellowship-registration', 'CSPOINT Team', 3],
            ['IIT Mandi Summer Internship 2026', 'IIT Mandi invites UG students for summer internship across various departments and research labs.', 'Internship', '2026-02-19', 'https://academics.iitmandi.ac.in/internships', 'https://academics.iitmandi.ac.in/internships', 'CSPOINT Team', 2],
            ['IIT Gandhinagar SRIP 2026', 'Summer Research Internship Programme at IIT Gandhinagar. Open to UG and PG students from recognized institutions.', 'Internship', '2026-02-19', 'https://srip.iitgn.ac.in/info/', 'https://srip.iitgn.ac.in/info/', 'CSPOINT Team', 3],
            ['ISRO VSSC Summer Internship 2026', 'ISRO Vikram Sarabhai Space Centre summer internship for engineering and science students.', 'Internship', '2026-02-18', 'https://vsscinternship.vssc.gov.in/HRDD_LOGIN/', 'https://vsscinternship.vssc.gov.in/HRDD_LOGIN/', 'CSPOINT Team', 3],
            ['ISRO LPSC Summer Internships 2026', 'ISRO Liquid Propulsion Systems Centre summer internship for UG/PG students in engineering.', 'Internship', '2026-02-18', 'https://www.lpsc.gov.in/Internship.html', 'https://www.lpsc.gov.in/Internship.html', 'CSPOINT Team', 2],
            ['End Semester Examination Schedule Released — Spring 2026', 'Final schedule for the CSE department end-term exams has been published. Exams commence from May 15th, 2026.', 'Exams', '2026-02-18', 'https://university.edu/exams/spring2026', '', 'CSPOINT Team', 2],
            ['3-Day Workshop on Generative AI & Large Language Models', 'Hands-on workshop covering Transformers, PyTorch, and deploying LLMs. Registration closes Feb 25.', 'Workshop', '2026-02-16', 'https://workshop.cse.edu/genai', 'https://workshop.cse.edu/genai/register', 'CSPOINT Team', 3],
            ['GATE 2026 Results Declared — Check Scorecard Now', 'IIT Delhi has released the GATE 2026 results. Candidates can download their scorecard from the official portal.', 'Results', '2026-02-15', 'https://gate2026.iitd.ac.in/results', '', 'CSPOINT Team', 2],
            ['Holiday Notice: University Closed for Maha Shivaratri', 'All departments will remain closed on Feb 26 on account of Maha Shivaratri. Classes resume Feb 27.', 'Notice', '2026-02-14', '', '', 'CSPOINT Team', 1],
            ['Google Code Jam 2026 — Qualification Round Registration Open', 'Register for the qualification round. Open to all participants globally. Top scorers proceed to Round 1.', 'Contest', '2026-02-13', 'https://codingcompetitions.withgoogle.com/codejam', 'https://codingcompetitions.withgoogle.com/codejam/register', 'CSPOINT Team', 2],
            ['Microsoft Engage 2026 — Mentorship Program Applications', 'Microsoft India flagship mentorship and internship program for pre-final year students. Apply by March 10.', 'Internship', '2026-02-12', 'https://microsoft.com/engage', 'https://microsoft.com/engage/apply', 'CSPOINT Team', 3],
        ];
        const stmt = db.prepare('INSERT INTO updates (title, description, category, date, link, reg_link, author, read_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const u of updates) { stmt.run(u); stmt.reset(); }
        stmt.free();

        const deadlines = [
            ['GATE 2027 Registration', '2026-03-30T23:59', 'Closing Soon', 'https://gate2027.iitm.ac.in/register'],
            ['Google STEP Internship', '2026-04-15T23:59', 'Open', 'https://careers.google.com/students/step'],
            ['Hack-All-Night Contest', '2026-02-20T18:00', 'Tomorrow', 'https://hackallnight.dev/register'],
            ['MITACS Globalink Research', '2026-05-01T23:59', 'Open', 'https://mitacs.ca/globalink'],
            ['JEE Advanced 2026', '2026-02-10T00:00', 'Results Out', 'https://jeeadv.ac.in/results'],
        ];
        const dStmt = db.prepare('INSERT INTO deadlines (name, deadline_date, status, link) VALUES (?, ?, ?, ?)');
        for (const d of deadlines) { dStmt.run(d); dStmt.reset(); }
        dStmt.free();

        const resources = [
            ['Data Structures Notes', 'PDF', '2.4 MB'],
            ['OS — Galvin 9th Ed', 'eBook', '15 MB'],
            ['Previous Year Papers (2025)', 'ZIP', '56 MB'],
            ['Algorithm Cheat Sheet', 'PDF', '500 KB'],
        ];
        const rStmt = db.prepare('INSERT INTO resources (name, file_type, file_size) VALUES (?, ?, ?)');
        for (const r of resources) { rStmt.run(r); rStmt.reset(); }
        rStmt.free();

        const links = [
            ['University Portal', 'https://university.edu', 'Official', 'Main university website'],
            ['CSE Department', 'https://cse.university.edu', 'Academic', 'Department homepage'],
            ['Placement Cell', 'https://placement.university.edu', 'Career', 'Training & placements'],
        ];
        const lStmt = db.prepare('INSERT INTO links (label, url, category, description) VALUES (?, ?, ?, ?)');
        for (const l of links) { lStmt.run(l); lStmt.reset(); }
        lStmt.free();

        saveDB();
        console.log('  📦  Database seeded with default data');
    }

    return db;
}

function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a SELECT query and return rows as array of objects
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
}

// Helper: run a SELECT query and return first row as object
function queryOne(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return row;
}

// Helper: run INSERT/UPDATE/DELETE
function runSQL(sql, params = []) {
    db.run(sql, params);
    saveDB();
}

// Helper: get last insert rowid
function lastId() {
    return db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
}

module.exports = { initDB, queryAll, queryOne, runSQL, lastId, saveDB };
