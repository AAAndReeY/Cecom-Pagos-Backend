const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Let's find the CARTA DE AUTORIZACION title
const cartaIdx = xml.indexOf('CARTA DE AUTORIZACION DE DEP');
if (cartaIdx !== -1) {
    // Look at the 2000 characters before it
    const beforeCarta = xml.substring(Math.max(0, cartaIdx - 2000), cartaIdx);
    
    // Regex to match consecutive empty paragraphs
    // An empty paragraph is <w:p ...>...</w:p> containing NO <w:t> and NO <w:drawing> etc.
    // Actually, a simpler way is to match any <w:p> that has only spaces/formatting, but it's hard to define with regex without missing things.
    // Let's just print out all the <w:p> tags before the CARTA title.
    const matches = [...beforeCarta.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
    console.log("Paragraphs before CARTA:");
    for (let i = matches.length - 1; i >= Math.max(0, matches.length - 15); i--) {
        const p = matches[i][0];
        const hasText = p.includes('<w:t>') || p.includes('<w:t ');
        console.log(`[${i}] hasText=${hasText}: ${p.substring(0, 100)}...`);
    }
}
