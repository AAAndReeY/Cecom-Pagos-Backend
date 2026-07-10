const fs = require('fs');
const PizZip = require('pizzip');

function makeRegex(searchStr) {
    return new RegExp(searchStr.split('').map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(?:<[^>]+>)*'), 'g');
}

function removeEmptyParas(xml, startStr, endStr, countToRemove) {
    const startIdx = xml.indexOf(startStr);
    const endIdx = xml.indexOf(endStr, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        const before = xml.substring(0, startIdx);
        let middle = xml.substring(startIdx, endIdx);
        const after = xml.substring(endIdx);
        
        let removed = 0;
        const regex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>/g;
        const matches = [...middle.matchAll(regex)];
        
        // Remove from the end backwards
        for (let i = matches.length - 1; i >= 0; i--) {
            if (removed >= countToRemove) break;
            const p = matches[i][0];
            const hasText = p.includes('<w:t>') || p.includes('<w:t ');
            const hasDrawing = p.includes('<w:drawing') || p.includes('<v:') || p.includes('<w:pict');
            
            if (!hasText && !hasDrawing) {
                const lastIndex = middle.lastIndexOf(p);
                if (lastIndex !== -1) {
                    middle = middle.substring(0, lastIndex) + middle.substring(lastIndex + p.length);
                    removed++;
                }
            }
        }
        console.log(`Removed ${removed} empty paragraphs between ${startStr} and ${endStr}`);
        return before + middle + after;
    }
    console.log(`Could not find ${startStr} or ${endStr}`);
    return xml;
}

try {
    const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
    const content = fs.readFileSync(backupPath, 'binary');
    const zip = new PizZip(content);

    let docXml = zip.file('word/document.xml').asText();

    // 1. Replace dates
    docXml = docXml.replace(makeRegex('JUNIO'), (match) => '{MES_ACTUAL}' + (match.match(/<[^>]+>/g) || []).join(''));
    docXml = docXml.replace(makeRegex('2026'), (match) => '{ANIO_ACTUAL}' + (match.match(/<[^>]+>/g) || []).join(''));

    // 2. Insert Hard Page Breaks BEFORE titles
    const titlesToBreak = [
        makeRegex('DECLARACION JURADA DE NO CONTAR'),
        makeRegex('CARTA DE AUTORIZACION DE DEP')
    ];

    for (let r of titlesToBreak) {
        let match;
        while ((match = r.exec(docXml)) !== null) {
            const pStart = docXml.lastIndexOf('<w:p ', match.index);
            if (pStart !== -1) {
                // Delete ONLY the single immediately preceding empty paragraph (if any) to avoid blank pages
                // But don't go crazy deleting everything.
                let before = docXml.substring(0, pStart);
                const emptyParaRegex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>\s*$/;
                const emptyMatch = before.match(emptyParaRegex);
                if (emptyMatch) {
                    const p = emptyMatch[0];
                    if (!p.includes('<w:t>') && !p.includes('<w:drawing') && !p.includes('<v:')) {
                        before = before.substring(0, before.length - p.length);
                    }
                }
                
                docXml = before + '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' + docXml.substring(pStart);
                r.lastIndex = 0; // reset because string modified
                console.log('Inserted Page Break.');
            }
            break;
        }
    }

    // 3. Remove empty lines inside the sections to create buffer space for long names
    // For Declaracion Jurada: there is a huge gap between "Lurigancho" and "FIRMA"
    docXml = removeEmptyParas(docXml, 'Lurigancho', 'FIRMA', 5);
    
    // For CARTA DE AUTORIZACION: there is also a huge gap between the last date and the FIRMA.
    // Let's find it. Wait, the date on CARTA is also "San Juan de Lurigancho, JUNIO del 2026".
    // We already replaced it with {MES_ACTUAL} and {ANIO_ACTUAL}. But the text "Lurigancho" is still there.
    // The first one is Declaracion Jurada, the second one is CARTA.
    // If we just search for Lurigancho to FIRMA again starting from the middle of the document, we can do it.
    const firstFirmaIdx = docXml.indexOf('FIRMA');
    if (firstFirmaIdx !== -1) {
        const secondLuriganchoIdx = docXml.indexOf('Lurigancho', firstFirmaIdx);
        const secondFirmaIdx = docXml.indexOf('FIRMA', secondLuriganchoIdx);
        if (secondLuriganchoIdx !== -1 && secondFirmaIdx !== -1) {
            const before = docXml.substring(0, secondLuriganchoIdx);
            let middle = docXml.substring(secondLuriganchoIdx, secondFirmaIdx);
            const after = docXml.substring(secondFirmaIdx);
            
            let removed = 0;
            const regex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>/g;
            const matches = [...middle.matchAll(regex)];
            for (let i = matches.length - 1; i >= 0; i--) {
                if (removed >= 5) break;
                const p = matches[i][0];
                if (!p.includes('<w:t>') && !p.includes('<w:drawing') && !p.includes('<v:')) {
                    const lastIndex = middle.lastIndexOf(p);
                    if (lastIndex !== -1) {
                        middle = middle.substring(0, lastIndex) + middle.substring(lastIndex + p.length);
                        removed++;
                    }
                }
            }
            docXml = before + middle + after;
            console.log(`Removed ${removed} empty paragraphs in CARTA`);
        }
    }

    zip.file('word/document.xml', docXml);

    const outBuf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });

    const targetPath = 'C:\\\\Users\\\\Soporte\\\\Desktop\\\\Cecom-20251224T131857Z-3-002\\\\Cecom\\\\BACKEND\\\\sistema_pagos_dj\\\\templates\\\\plantilla.docx';
    fs.writeFileSync(targetPath, outBuf);
    console.log('Master fix completed successfully.');
} catch(e) {
    console.error(e);
}
