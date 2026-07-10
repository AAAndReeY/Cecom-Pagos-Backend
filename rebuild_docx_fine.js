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

    // Fix pagination between page 4 and 5 by replacing an empty line with a hard page break
    docXml = docXml.replace('<w:p w14:paraId="5E4833C5" w14:textId="77777777" w:rsidR="00FB0279" w:rsidRDefault="00FB0279"><w:pPr><w:pStyle w:val="Ttulo1"/><w:ind w:left="2659"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:u w:val="thick"/></w:rPr></w:pPr></w:p>', '<w:p><w:r><w:br w:type="page"/></w:r></w:p>');

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
