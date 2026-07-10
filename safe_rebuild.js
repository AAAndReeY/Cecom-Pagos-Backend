const fs = require('fs');
const PizZip = require('pizzip');

function replaceInXml(xml, searchStr, replaceStr) {
    const regex = new RegExp(searchStr.split('').map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(?:<[^>]+>)*'), 'g');
    return xml.replace(regex, (match) => {
        const tags = match.match(/<[^>]+>/g) || [];
        return replaceStr + tags.join('');
    });
}

try {
    const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
    const content = fs.readFileSync(backupPath, 'binary');
    const zip = new PizZip(content);

    let docXml = zip.file('word/document.xml').asText();

    docXml = replaceInXml(docXml, 'JUNIO', '{MES_ACTUAL}');
    docXml = replaceInXml(docXml, '2026', '{ANIO_ACTUAL}');

    // Now remove exactly 4 empty paragraphs that are right before Art 51.1
    const endIdx = docXml.indexOf('Art. 51.1');
    if (endIdx !== -1) {
        const before = docXml.substring(0, endIdx);
        const after = docXml.substring(endIdx);
        
        let removedCount = 0;
        
        // Find empty paragraphs from the end backwards
        const regex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>/g;
        const matches = [...before.matchAll(regex)];
        
        let newBefore = before;
        
        // Iterate backwards
        for (let i = matches.length - 1; i >= 0; i--) {
            if (removedCount >= 4) break;
            
            const p = matches[i][0];
            const hasText = p.includes('<w:t>') || p.includes('<w:t ');
            const hasDrawing = p.includes('<w:drawing') || p.includes('<v:') || p.includes('<w:pict');
            
            if (!hasText && !hasDrawing) {
                // Delete this exact paragraph from newBefore
                const lastIndex = newBefore.lastIndexOf(p);
                if (lastIndex !== -1) {
                    newBefore = newBefore.substring(0, lastIndex) + newBefore.substring(lastIndex + p.length);
                    removedCount++;
                    console.log('Removed an empty paragraph for spacing buffer.');
                }
            }
        }
        
        docXml = newBefore + after;
        console.log(`Successfully removed ${removedCount} empty lines to create a buffer.`);
    }

    zip.file('word/document.xml', docXml);

    const outBuf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });

    const targetPath = 'C:\\\\Users\\\\Soporte\\\\Desktop\\\\Cecom-20251224T131857Z-3-002\\\\Cecom\\\\BACKEND\\\\sistema_pagos_dj\\\\templates\\\\plantilla.docx';
    fs.writeFileSync(targetPath, outBuf);
    console.log('Template reconstructed safely and perfectly.');
} catch(e) {
    console.error(e);
}
