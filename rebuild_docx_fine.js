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

    // Fix pagination by pulling the text up (removing an empty line)
    const emptyLine = '<w:p w14:paraId="1FE5D2DF" w14:textId="77777777" w:rsidR="002552C1" w:rsidRDefault="002552C1" w:rsidP="00FB0279"><w:pPr><w:ind w:right="1084"/><w:jc w:val="both"/><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:sz w:val="16"/></w:rPr></w:pPr></w:p>';
    docXml = docXml.replace(emptyLine, '');

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
