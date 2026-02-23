const { runSQL } = require('./db');

async function updateDeadlines() {
    const updates = [
        { pattern: '%VSSC%', date: '2026-03-16', status: 'Open' },
        { pattern: '%IIT Madras%SRFP%', date: '2026-03-02', status: 'Closing Soon' },
        { pattern: '%IIIT Delhi%', date: '2026-03-15', status: 'Open' },
        { pattern: '%SURGE%IIT Kanpur%', date: '2026-02-22', status: 'Tomorrow' },
        { pattern: '%Abhijit Sen%', date: '2026-02-25', status: 'Open' },
        { pattern: '%IISc%CNI%', date: '2026-02-28', status: 'Open' },
        { pattern: '%IIT Gandhinagar%SRIP%', date: '2026-03-05', status: 'Open' },
        { pattern: '%CCMB%', date: '2026-03-10', status: 'Open' },
        { pattern: '%NGSF%', date: '2026-03-15', status: 'Open' },
        { pattern: '%IIT Jodhpur%', date: '2026-03-31', status: 'Open' },
        { pattern: '%IIT Mandi%', date: '2026-03-31', status: 'Open' },
        { pattern: '%NIT Warangal%', date: '2026-03-31', status: 'Open' },
        { pattern: '%CERN%', date: '2026-01-26', status: 'Closed' },
        { pattern: '%JNCASR%', date: '2026-01-31', status: 'Closed' },
        { pattern: '%Taiwan%', date: '2026-01-15', status: 'Closed' },
        { pattern: '%Coal India%', date: '2026-01-15', status: 'Closed' },
        { pattern: '%Niti Ayog%', date: '2026-03-10', status: 'Open' },
        { pattern: '%IISER Pune%', date: '2026-02-20', status: 'Closed' },
        { pattern: '%TIFR Hyderabad%', date: '2026-01-31', status: 'Closed' },
        { pattern: '%CSIR CSMCRI%', date: '2026-12-31', status: 'Open' },
        { pattern: '%CSIR CFTRI%', date: '2026-03-31', status: 'Open' },
    ];

    console.log('🔄 Starting database updates...');

    // 1. Update the 'updates' table
    for (const item of updates) {
        try {
            await runSQL(
                "UPDATE updates SET date = $1 WHERE title ILIKE $2 AND category = 'Internship'",
                [item.date, item.pattern]
            );
            console.log(`✅ Updated updates matching "${item.pattern}" to ${item.date}`);
        } catch (err) {
            console.error(`❌ Error updating updates "${item.pattern}":`, err.message);
        }
    }

    // Default for others still in the scraped range
    try {
        await runSQL(
            "UPDATE updates SET date = '2026-03-31' WHERE (date BETWEEN '2026-02-20' AND '2026-02-23') AND category = 'Internship'",
            []
        );
        console.log('✅ Applied default deadline (March 31) to remaining uncorrected internships.');
    } catch (err) {
        console.error('❌ Error applying default deadline:', err.message);
    }

    // 2. Populate the 'deadlines' table
    console.log('📅 Populating the deadlines table...');
    try {
        await runSQL('TRUNCATE TABLE deadlines RESTART IDENTITY');
        for (const item of updates) {
            // Clean up pattern for name
            const name = item.pattern.replace(/%/g, ' ').trim();
            // Get link from updates table if possible
            const res = await runSQL("SELECT link FROM updates WHERE title ILIKE $1 LIMIT 1", [item.pattern]);
            const link = res.rows[0] ? res.rows[0].link : '';

            await runSQL(
                'INSERT INTO deadlines (name, deadline_date, status, link) VALUES ($1, $2, $3, $4)',
                [name, item.date, item.status, link]
            );
        }
        console.log('✅ Deadlines table populated successfully.');
    } catch (err) {
        console.error('❌ Error populating deadlines table:', err.message);
    }

    console.log('🏁 All database updates completed.');
    process.exit(0);
}

updateDeadlines();
