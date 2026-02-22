-- cscafe Database Schema
-- Run: psql -U postgres -f schema.sql

CREATE DATABASE cscafe;
\c cscafe;

-- ===== TABLES =====

CREATE TABLE IF NOT EXISTS updates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    link TEXT DEFAULT '',
    reg_link TEXT DEFAULT '',
    author VARCHAR(100) DEFAULT 'cscafe Team',
    read_time INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deadlines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    deadline_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    link TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'PDF',
    file_size VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    label VARCHAR(300) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== SEED DATA: UPDATES =====

INSERT INTO updates (title, description, category, date, link, reg_link, author, read_time) VALUES
('IISc – CNI Summer Internships 2026', 'Centre for Networked Intelligence at IISc Bangalore invites applications for summer research internship in AI, ML, networking.', 'Internship', '2026-02-19', 'https://cni.iisc.ac.in/opportunities/research-intern/', 'https://cni.iisc.ac.in/opportunities/research-intern/', 'cscafe Team', 3),
('IIT Kanpur: SURGE Summer Internships 2026', 'Summer Undergraduate Research Grant for Excellence at IIT Kanpur. Open to UG students from all recognized institutions.', 'Internship', '2026-02-19', 'https://surge.iitk.ac.in', 'https://surge.iitk.ac.in', 'cscafe Team', 3),
('IIT Jodhpur: SURAJ Summer Internships 2026', 'Summer Undergraduate Research Award at Jodhpur. Research internship across engineering and science departments.', 'Internship', '2026-02-19', 'https://www.iitj.ac.in/suraj/en/internship', 'https://www.iitj.ac.in/suraj/en/internship', 'cscafe Team', 3),
('CSIR-SERC: Summer Internships 2026', 'CSIR Structural Engineering Research Centre Prof. G.S. Ramaswamy internship for UG and dual degree students.', 'Internship', '2026-02-19', 'https://serc.res.in/professor-gs-ramaswamy-internship-undergraduate-dual-degree-students', 'https://serc.res.in/professor-gs-ramaswamy-internship-undergraduate-dual-degree-students', 'cscafe Team', 3),
('IISER Pune Summer Student Program 2026', 'Summer Student Programme for UG students across science and engineering disciplines at IISER Pune.', 'Internship', '2026-02-19', 'https://www.iiserpune.ac.in/announcements/48/summer-student-programme-2026', 'https://www.iiserpune.ac.in/announcements/48/summer-student-programme-2026', 'cscafe Team', 3),
('IIT Madras SRFP 2026 — Summer Fellowship', 'IIT Madras Summer Research Fellowship Programme. Apply for research positions across all departments.', 'Internship', '2026-02-19', 'https://ssp.iitm.ac.in/summer-fellowship-registration', 'https://ssp.iitm.ac.in/summer-fellowship-registration', 'cscafe Team', 3),
('IIT Mandi Summer Internship 2026', 'IIT Mandi invites UG students for summer internship across various departments and research labs.', 'Internship', '2026-02-19', 'https://academics.iitmandi.ac.in/internships', 'https://academics.iitmandi.ac.in/internships', 'cscafe Team', 2),
('IIT Gandhinagar SRIP 2026', 'Summer Research Internship Programme at IIT Gandhinagar. Open to UG and PG students from recognized institutions.', 'Internship', '2026-02-19', 'https://srip.iitgn.ac.in/info/', 'https://srip.iitgn.ac.in/info/', 'cscafe Team', 3),
('ISRO VSSC Summer Internship 2026', 'ISRO Vikram Sarabhai Space Centre summer internship for engineering and science students.', 'Internship', '2026-02-18', 'https://vsscinternship.vssc.gov.in/HRDD_LOGIN/', 'https://vsscinternship.vssc.gov.in/HRDD_LOGIN/', 'cscafe Team', 3),
('ISRO LPSC Summer Internships 2026', 'ISRO Liquid Propulsion Systems Centre summer internship for UG/PG students in engineering.', 'Internship', '2026-02-18', 'https://www.lpsc.gov.in/Internship.html', 'https://www.lpsc.gov.in/Internship.html', 'cscafe Team', 2),
('CSIR CSMCRI Summer Internships 2026', 'Central Salt and Marine Chemicals Research Institute internship and training program.', 'Internship', '2026-02-17', 'https://www.csmcri.res.in/internship-training-program', 'https://www.csmcri.res.in/internship-training-program', 'cscafe Team', 2),
('CSIR CFTRI Summer Internships 2026', 'Central Food Technological Research Institute internship for food science students.', 'Internship', '2026-02-17', 'https://cftri.res.in/internship', 'https://cftri.res.in/internship', 'cscafe Team', 2),
('National Institute of Oceanography Internships 2026', 'NIO offers internship positions for students from science and engineering backgrounds.', 'Internship', '2026-02-17', 'https://www.nio.res.in/human-resource/students/interns', 'https://www.nio.res.in/human-resource/students/interns', 'cscafe Team', 2),
('NITI Aayog Internships 2026', 'NITI Aayog internship for students in policy research and governance.', 'Internship', '2026-02-16', 'https://www.niti.gov.in/internship', 'https://www.niti.gov.in/internship', 'cscafe Team', 2),
('ISRO MCF Summer Internships 2026', 'ISRO Master Control Facility summer internship. Satellite operations experience.', 'Internship', '2026-02-16', 'https://www.mcf.gov.in/website/Internship', 'https://www.mcf.gov.in/website/Internship', 'cscafe Team', 2),
('End Semester Examination Schedule Released — Spring 2026', 'Final schedule for the CSE department end-term exams has been published. Exams commence from May 15th, 2026.', 'Exams', '2026-02-18', 'https://university.edu/exams/spring2026', '', 'cscafe Team', 2),
('3-Day Workshop on Generative AI & Large Language Models', 'Hands-on workshop covering Transformers, PyTorch, and deploying LLMs. Registration closes Feb 25.', 'Workshop', '2026-02-16', 'https://workshop.cse.edu/genai', 'https://workshop.cse.edu/genai/register', 'cscafe Team', 3),
('GATE 2026 Results Declared — Check Scorecard Now', 'IIT Delhi has released the GATE 2026 results. Candidates can download their scorecard from the official portal.', 'Results', '2026-02-15', 'https://gate2026.iitd.ac.in/results', '', 'cscafe Team', 2),
('Holiday Notice: University Closed for Maha Shivaratri', 'All departments will remain closed on Feb 26 on account of Maha Shivaratri. Classes resume Feb 27.', 'Notice', '2026-02-14', '', '', 'cscafe Team', 1),
('Google Code Jam 2026 — Qualification Round Registration Open', 'Register for the qualification round. Open to all participants globally. Top scorers proceed to Round 1.', 'Contest', '2026-02-13', 'https://codingcompetitions.withgoogle.com/codejam', 'https://codingcompetitions.withgoogle.com/codejam/register', 'cscafe Team', 2),
('Microsoft Engage 2026 — Mentorship Program Applications', 'Microsoft India flagship mentorship and internship program for pre-final year students. Apply by March 10.', 'Internship', '2026-02-12', 'https://microsoft.com/engage', 'https://microsoft.com/engage/apply', 'cscafe Team', 3);

-- ===== SEED DATA: DEADLINES =====

INSERT INTO deadlines (name, deadline_date, status, link) VALUES
('GATE 2027 Registration', '2026-03-30 23:59:00', 'Closing Soon', 'https://gate2027.iitm.ac.in/register'),
('Google STEP Internship', '2026-04-15 23:59:00', 'Open', 'https://careers.google.com/students/step'),
('Hack-All-Night Contest', '2026-02-20 18:00:00', 'Tomorrow', 'https://hackallnight.dev/register'),
('MITACS Globalink Research', '2026-05-01 23:59:00', 'Open', 'https://mitacs.ca/globalink'),
('JEE Advanced 2026', '2026-02-10 00:00:00', 'Results Out', 'https://jeeadv.ac.in/results');

-- ===== SEED DATA: RESOURCES =====

INSERT INTO resources (name, file_type, file_size) VALUES
('Data Structures Notes', 'PDF', '2.4 MB'),
('OS — Galvin 9th Ed', 'eBook', '15 MB'),
('Previous Year Papers (2025)', 'ZIP', '56 MB'),
('Algorithm Cheat Sheet', 'PDF', '500 KB');

-- ===== SEED DATA: LINKS =====

INSERT INTO links (label, url, category, description) VALUES
('University Portal', 'https://university.edu', 'Official', 'Main university website'),
('CSE Department', 'https://cse.university.edu', 'Academic', 'Department homepage'),
('Placement Cell', 'https://placement.university.edu', 'Career', 'Training & placements');
