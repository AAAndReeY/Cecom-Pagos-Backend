const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Let's find "San Juan de Lurigancho, JUNIO del 2026" (which was the original text before replacement)
const idx1 = xml.indexOf('San Juan de Lurigancho, JUNIO del 2026');
const idx2 = xml.indexOf('FIRMA', idx1);

if (idx1 !== -1 && idx2 !== -1) {
    const context = xml.substring(idx1, idx2);
    const matches = [...context.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
    matches.forEach((m, i) => {
        const text = m[0].replace(/<[^>]+>/g, '').trim();
        console.log(`[${i}]`, text === '' ? '<EMPTY OR SHAPE>' : text.substring(0, 50));
    });
}
