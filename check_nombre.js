const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const index = xml.indexOf('{NOMBRE}');
if (index !== -1) {
    const djXml = xml.substring(Math.max(0, index - 800), index + 800);
    console.log("Text around {NOMBRE}:");
    console.log(djXml.replace(/<[^>]+>/g, ''));
} else {
    console.log('{NOMBRE} not found in XML.');
}
