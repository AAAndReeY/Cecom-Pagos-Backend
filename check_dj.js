const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const index = xml.indexOf('Art. 51.1');
if (index !== -1) {
    const djXml = xml.substring(index - 4000, index);
    const matches = [...djXml.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
    matches.forEach((m, i) => {
        const text = m[0].replace(/<[^>]+>/g, '').trim();
        console.log(`[${i}]`, text === '' ? '<EMPTY>' : text.substring(0, 50));
    });
}
