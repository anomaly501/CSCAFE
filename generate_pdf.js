const fs = require('fs');
const PDFDocument = require('pdfkit');
const { queryAll } = require('./db');

async function generateInternshipsPDF() {
    try {
        console.log('🔍 Fetching internships from database...');
        const internships = await queryAll("SELECT * FROM updates WHERE category = 'Internship' ORDER BY date DESC");

        if (internships.length === 0) {
            console.log('⚠️ No internships found in the database. Aborting PDF generation.');
            return;
        }

        console.log(`📄 Generating PDF for ${internships.length} internships...`);

        const doc = new PDFDocument({ margin: 50, bufferPages: true });
        const filePath = './internships.pdf';
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fillColor('#0a1628').fontSize(24).text('cscafe — Internship Opportunities 2026', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).fillColor('#666666').text('A curated list of current internships in science and engineering.', { align: 'center' });
        doc.moveDown(2);

        // Content
        internships.forEach((item, index) => {
            // Apply some styling
            doc.fillColor('#333333').fontSize(16).text(`${index + 1}. ${item.title}`);
            doc.moveDown(0.5);

            doc.fillColor('#555555').fontSize(11).text(`Deadline: ${new Date(item.date).toLocaleDateString()}`);
            doc.moveDown(0.5);

            doc.fillColor('#000000').fontSize(11).text(item.description);
            doc.moveDown(0.5);

            doc.fillColor('#3b82f6').fontSize(11).text(`Apply Link: ${item.link}`, {
                link: item.link,
                underline: true
            });

            doc.moveDown(1.5);

            // Add new page if needed (pdfkit handles some auto-page break, but good to check)
            if (doc.y > 700) {
                doc.addPage();
            }
        });

        // Footer
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fillColor('#999999').fontSize(10).text(
                `Generated on ${new Date().toLocaleDateString()} | Page ${i + 1} of ${pages.count}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ PDF successfully generated: ${filePath}`);
            process.exit(0);
        });

    } catch (err) {
        console.error('❌ Error generating PDF:', err.stack);
        process.exit(1);
    }
}

generateInternshipsPDF();
