const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const idx2 = xml.indexOf('FIRMA');
if (idx2 !== -1) {
    const chunk = xml.substring(idx2 - 2000, idx2);
    const matches = [...chunk.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
    matches.forEach((m, i) => {
        const hasText = m[0].includes('<w:t>') || m[0].includes('<w:t ');
        const hasDrawing = m[0].includes('<w:drawing') || m[0].includes('<v:') || m[0].includes('<w:pict');
        console.log(`[${i}] hasText:${hasText}, hasDrawing:${hasDrawing} - ${m[0].substring(0, 80)}...`);
        if (!hasText && !hasDrawing) {
            console.log(`  -> TOTALLY EMPTY: ${m[0]}`);
        }
    });
}
