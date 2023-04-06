/**
 * Watches index.html for edits and automatically copies them to out/index.html
 */
import * as fs from 'fs';

fs.writeFileSync('out/index.html', fs.readFileSync('src/html/index.html'))

fs.watchFile('src/html/index.html', () => {
    fs.writeFileSync('out/index.html', fs.readFileSync('src/html/index.html'))
    console.log(`Copied src/html/index.html to out/index.html`)
});

console.log("Listener ready")