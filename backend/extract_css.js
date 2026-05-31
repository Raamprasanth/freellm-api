const fs = require('fs');
const html = fs.readFileSync('../public/frontend/lobby.html', 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  fs.writeFileSync('../public/frontend/shared_auction.css', styleMatch[1]);
  const newHtml = html.replace(styleMatch[0], '<link rel="stylesheet" href="shared_auction.css">');
  fs.writeFileSync('../public/frontend/lobby.html', newHtml);
  console.log('Successfully extracted CSS and updated lobby.html');
} else {
  console.log('Style tag not found');
}
