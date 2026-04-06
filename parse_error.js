const fs = require('fs');
const html = fs.readFileSync('error.html', 'utf8');
console.log(html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').substring(0, 1000));
