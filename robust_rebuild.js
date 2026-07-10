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

    // Find the section for Declaracion Jurada
    const startIdx = docXml.indexOf('{NOMBRE}');
    const endIdx = docXml.indexOf('Art. 51.1');
    
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        const before = docXml.substring(0, startIdx);
        let middle = docXml.substring(startIdx, endIdx);
        const after = docXml.substring(endIdx);
        
        // Remove ALL empty <w:p> tags in the middle section (between {NOMBRE} and Art 51.1)
        // This creates a massive vertical buffer, ensuring it never spills over.
        middle = middle.replace(/<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>/g, (match) => {
            if (match.replace(/<[^>]+>/g, '').trim() === '') {
                return ''; // Delete the empty paragraph
            }
            return match;
        });
        
        docXml = before + middle + after;
        console.log('Successfully removed empty lines from Declaracion Jurada.');
    }

    zip.file('word/document.xml', docXml);

    const outBuf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });

    const targetPath = 'C:\\\\Users\\\\Soporte\\\\Desktop\\\\Cecom-20251224T131857Z-3-002\\\\Cecom\\\\BACKEND\\\\sistema_pagos_dj\\\\templates\\\\plantilla.docx';
    fs.writeFileSync(targetPath, outBuf);
    console.log('Template reconstructed successfully with PizZip.');
} catch(e) {
    console.error(e);
}
