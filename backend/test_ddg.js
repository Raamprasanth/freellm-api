const fs = require('fs');
const html = fs.readFileSync('ddglite.html', 'utf8');
const matches = [...html.matchAll(/class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi)];
console.log('Snippets length:', matches.length);
if(matches.length > 0) console.log(matches[0][1]);
else console.log(html.substring(0, 500));
