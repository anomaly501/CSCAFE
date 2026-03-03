const https = require('https');
const fs = require('fs');
const path = require('path');

const logos = [
    { name: 'iisc', domain: 'iisc.ac.in' },
    { name: 'iitk', domain: 'iitk.ac.in' },
    { name: 'iitj', domain: 'iitj.ac.in' },
    { name: 'serc', domain: 'serc.res.in' },
    { name: 'iiserpune', domain: 'iiserpune.ac.in' },
    { name: 'iitm', domain: 'iitm.ac.in' },
    { name: 'iitmandi', domain: 'iitmandi.ac.in' },
    { name: 'iitgn', domain: 'iitgn.ac.in' },
    { name: 'vssc', domain: 'vssc.gov.in' },
    { name: 'lpsc', domain: 'lpsc.gov.in' },
    { name: 'google', domain: 'google.com' },
    { name: 'microsoft', domain: 'microsoft.com' },
    { name: 'university', domain: 'berkeley.edu' } // generic uni
];

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

logos.forEach(logo => {
    const file = fs.createWriteStream(path.join(dir, `${logo.name}.png`));
    https.get(`https://www.google.com/s2/favicons?domain=${logo.domain}&sz=128`, function (response) {
        response.pipe(file);
    });
});
console.log('Logos downloading...');
