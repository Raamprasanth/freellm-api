const fs = require('fs');

async function searchYahoo(query) {
    const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    // <div class="compTitle..."><a ...>Title</a></div>...<div class="compText...">Snippet</div>
    const matches = [...html.matchAll(/<div class="compTitle[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div class="compText[^>]*>([\s\S]*?)<\/div>/gi)];
    const snippets = matches.map(m => {
        const title = m[1].replace(/<[^>]*>?/gm, '').trim();
        const snippet = m[2].replace(/<[^>]*>?/gm, '').trim();
        return title + ' - ' + snippet;
    });
    console.log(snippets.join('\n\n'));
}

searchYahoo('Virat Kohli IPL stats cricbuzz').catch(console.error);
