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

    const emptyPara0 = '<w:p w14:paraId="7EF97398" w14:textId="77777777" w:rsidR="00FB0279" w:rsidRPr="00B10519" w:rsidRDefault="00FB0279" w:rsidP="00FB0279"><w:pPr><w:adjustRightInd w:val="0"/><w:ind w:right="1368" w:hanging="426"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Times New Roman" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="000000"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:eastAsia="es-PE"/></w:rPr></w:pPr></w:p>';
    const emptyPara1 = '<w:p w14:paraId="42D492EB" w14:textId="77777777" w:rsidR="00FB0279" w:rsidRPr="00B10519" w:rsidRDefault="00FB0279" w:rsidP="00FB0279"><w:pPr><w:adjustRightInd w:val="0"/><w:ind w:right="1368" w:hanging="426"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Times New Roman" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="000000"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:eastAsia="es-PE"/></w:rPr></w:pPr></w:p>';

    docXml = docXml.replace(emptyPara0, '');
    docXml = docXml.replace(emptyPara1, '');

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
