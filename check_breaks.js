const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const index = xml.indexOf('type="page"');
console.log('Page breaks found:', index !== -1);
if (index !== -1) {
    console.log(xml.substring(Math.max(0, index - 200), index + 200));
}

// Find all matches
const matches = [...xml.matchAll(/type="page"/g)];
console.log('Total hard page breaks:', matches.length);
