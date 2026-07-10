const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const titles = [
    'ANEXO N° 02',
    'ANEXO Nº 03',
    'DECLARACION JURADA DE NO CONTAR',
    'CARTA DE AUTORIZACION DE DEP'
];

titles.forEach(title => {
    const idx = xml.indexOf(title);
    if (idx !== -1) {
        console.log(`\n--- Title: ${title} ---`);
        const before = xml.substring(Math.max(0, idx - 1000), idx);
        const matches = [...before.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
        let emptyConsecutive = 0;
        for (let i = matches.length - 1; i >= 0; i--) {
            const p = matches[i][0];
            const hasText = p.includes('<w:t>') || p.includes('<w:t ');
            const hasDrawing = p.includes('<w:drawing') || p.includes('<v:') || p.includes('<w:pict');
            if (!hasText && !hasDrawing) {
                emptyConsecutive++;
            } else {
                break;
            }
        }
        console.log(`Consecutive empty paragraphs before this title: ${emptyConsecutive}`);
    } else {
        console.log(`\n--- Title: ${title} NOT FOUND ---`);
    }
});
