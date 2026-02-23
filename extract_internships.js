const axios = require('axios');
const cheerio = require('cheerio');
const { runSQL } = require('./db');

const TARGET_URL = 'https://gradsqr.com/summer-internships/';

async function extractInternships() {
    try {
        console.log(`🔍 Fetching internships from ${TARGET_URL}...`);
        const { data } = await axios.get(TARGET_URL);
        const $ = cheerio.load(data);

        const internships = [];

        // In the markdown/HTML, the internships are often in list items or paragraphs with links
        $('a').each((i, el) => {
            const title = $(el).text().trim();
            const link = $(el).attr('href');

            // Skip internal navigational/archive links
            if (link && (link.includes('/tag/') || link.includes('/category/') || title.startsWith('>>>'))) {
                return;
            }

            // Filter for relevant internship links (e.g., contains 'Internship' or '2026')
            if (link && (title.includes('Internship') || title.includes('2026')) && !link.includes('gradsqr.com/summer-internships/')) {
                internships.push({
                    title: title,
                    link: link,
                    reg_link: link,
                    description: `Explore this internship opportunity: ${title}. Apply through the official link below.`,
                    category: 'Internship',
                    date: new Date().toISOString().split('T')[0], // Today's date as current placeholder for deadline
                    tags: 'Internship, Summer 2026, Research'
                });
            }
        });

        console.log(`✅ Extracted ${internships.length} potential internships.`);

        // Deduplicate and filter (some might be nav links)
        const filtered = internships.filter(item => item.title.length > 5 && item.title.length < 200);

        console.log(`📦 Inserting ${filtered.length} internships into the database...`);

        for (const item of filtered) {
            try {
                // Check if already exists
                const existing = await runSQL('SELECT id FROM updates WHERE title = $1', [item.title]);
                if (existing.rows.length === 0) {
                    await runSQL(
                        'INSERT INTO updates (title, description, category, date, link, reg_link, author, read_time, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                        [item.title, item.description, item.category, item.date, item.link, item.reg_link, 'cscafe Team', 3, item.tags]
                    );
                    console.log(`   + Added: ${item.title}`);
                } else {
                    console.log(`   ~ Skipped (Exists): ${item.title}`);
                }
            } catch (dbErr) {
                console.error(`   ❌ Error inserting ${item.title}:`, dbErr.message);
            }
        }

        console.log('\n🏁 Extraction and insertion complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to extract internships:', err.message);
        process.exit(1);
    }
}

extractInternships();
