const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

const startIdx = xml.indexOf('Lurigancho');
const endIdx = xml.indexOf('FIRMA', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const chunk = xml.substring(startIdx, endIdx);
    const matches = [...chunk.matchAll(/<w:p\b[^>]*>.*?<\/w:p>/g)];
    
    let emptyCount = 0;
    matches.forEach((m, i) => {
        const p = m[0];
        const hasText = p.includes('<w:t>') || p.includes('<w:t ');
        const hasDrawing = p.includes('<w:drawing') || p.includes('<v:') || p.includes('<w:pict');
        if (!hasText && !hasDrawing) {
            console.log(`[EMPTY PARA ${emptyCount}]: ${p}`);
            emptyCount++;
        }
    });
    console.log(`Total completely empty paragraphs between Lurigancho and FIRMA: ${emptyCount}`);
} else {
    console.log("Could not find start or end text.");
}
