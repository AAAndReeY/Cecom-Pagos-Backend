const fs = require('fs');
const PizZip = require('pizzip');

function makeRegex(searchStr) {
    // Escapes regex characters and inserts (?:<[^>]+>)* between every character
    return new RegExp(searchStr.split('').map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(?:<[^>]+>)*'), 'g');
}

try {
    const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
    const content = fs.readFileSync(backupPath, 'binary');
    const zip = new PizZip(content);

    let docXml = zip.file('word/document.xml').asText();

    // 1. Replace JUNIO -> {MES_ACTUAL}
    docXml = docXml.replace(makeRegex('JUNIO'), (match) => {
        const tags = match.match(/<[^>]+>/g) || [];
        return '{MES_ACTUAL}' + tags.join('');
    });
    // 2. Replace 2026 -> {ANIO_ACTUAL}
    docXml = docXml.replace(makeRegex('2026'), (match) => {
        const tags = match.match(/<[^>]+>/g) || [];
        return '{ANIO_ACTUAL}' + tags.join('');
    });

    // We want to insert a Page Break before each of these section titles, 
    // AND remove the massive blocks of empty Enters (empty <w:p> tags) preceding them.
    const sections = [
        'ANEXO N° 02',
        'ANEXO N° 03', // Or Nº
        'DECLARACION JURADA DE NO CONTAR',
        'CARTA DE AUTORIZACION DE DEP'
    ];
    
    // Also check alternate spelling for Anexo 3
    const regexes = [
        makeRegex('ANEXO N° 02'),
        makeRegex('ANEXO Nº 03'),
        makeRegex('DECLARACION JURADA DE NO CONTAR'),
        makeRegex('CARTA DE AUTORIZACION DE DEP')
    ];

    for (let r of regexes) {
        let match;
        // Find the index of the matched title
        while ((match = r.exec(docXml)) !== null) {
            const titleIndex = match.index;
            
            // Find the <w:p ...> tag that contains this title
            const pStart = docXml.lastIndexOf('<w:p ', titleIndex);
            if (pStart === -1) continue;
            
            // Now, looking BACKWARDS from pStart, we want to delete all consecutive empty <w:p> tags
            // to eliminate the "Enters" that cause blank pages when combined with our Page Break.
            let before = docXml.substring(0, pStart);
            const after = docXml.substring(pStart);
            
            // Regex to match an empty paragraph at the very end of the string
            const emptyParaRegex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>\s*$/;
            
            let removedEnters = 0;
            while (true) {
                const emptyMatch = before.match(emptyParaRegex);
                if (emptyMatch) {
                    const p = emptyMatch[0];
                    const hasText = p.includes('<w:t>') || p.includes('<w:t ');
                    const hasDrawing = p.includes('<w:drawing') || p.includes('<v:') || p.includes('<w:pict');
                    if (!hasText && !hasDrawing) {
                        before = before.substring(0, before.length - p.length);
                        removedEnters++;
                    } else {
                        break; // Stop at first non-empty paragraph
                    }
                } else {
                    break;
                }
            }
            
            console.log(`Title found. Removed ${removedEnters} preceding empty Enters.`);
            
            // Now insert the Page Break right before the <w:p> of the title
            // A clean hard page break: <w:p><w:r><w:br w:type="page"/></w:r></w:p>
            docXml = before + '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' + after;
            
            // Update regex lastIndex because we modified the string before the match
            r.lastIndex = 0; 
            break; // only do it once per title
        }
    }

    zip.file('word/document.xml', docXml);

    const outBuf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });

    const targetPath = 'C:\\\\Users\\\\Soporte\\\\Desktop\\\\Cecom-20251224T131857Z-3-002\\\\Cecom\\\\BACKEND\\\\sistema_pagos_dj\\\\templates\\\\plantilla.docx';
    fs.writeFileSync(targetPath, outBuf);
    console.log('Template completely fixed with Hard Page Breaks and removed Enters!');
} catch(e) {
    console.error(e);
}
