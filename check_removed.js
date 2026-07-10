const fs = require('fs');
const PizZip = require('pizzip');

const backupPath = 'C:\\\\Users\\\\Soporte\\\\.gemini\\\\antigravity\\\\brain\\\\7c62bc48-12e7-4e84-93d3-799e43b64d4d\\\\scratch\\\\plantilla.zip';
const content = fs.readFileSync(backupPath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

const index = xml.indexOf('Art. 51.1');
if (index !== -1) {
    const context = xml.substring(Math.max(0, index - 3000), index);
    
    // Find all empty <w:p> tags in this section
    const emptyParas = [];
    const regex = /<w:p\b[^>]*>(?:(?!<w:p\b[^>]*>).)*?<\/w:p>/g;
    let match;
    while ((match = regex.exec(context)) !== null) {
        const text = match[0].replace(/<[^>]+>/g, '').trim();
        if (text === '') {
            emptyParas.push(match[0]);
        }
    }
    
    console.log(`Found ${emptyParas.length} empty paragraphs in the section before Art 51.1.`);
    
    // Let's also check the actual current plantilla.docx to see if they were removed
    const currentPath = 'C:\\\\Users\\\\Soporte\\\\Desktop\\\\Cecom-20251224T131857Z-3-002\\\\Cecom\\\\BACKEND\\\\sistema_pagos_dj\\\\templates\\\\plantilla.docx';
    const currentZip = new PizZip(fs.readFileSync(currentPath, 'binary'));
    const currentXml = currentZip.file('word/document.xml').asText();
    
    let currentEmptyCount = 0;
    const currentIndex = currentXml.indexOf('Art. 51.1');
    const currentContext = currentXml.substring(Math.max(0, currentIndex - 3000), currentIndex);
    while ((match = regex.exec(currentContext)) !== null) {
        if (match[0].replace(/<[^>]+>/g, '').trim() === '') {
            currentEmptyCount++;
        }
    }
    console.log(`Current plantilla.docx has ${currentEmptyCount} empty paragraphs in the same section.`);
}
