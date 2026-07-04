import docx
import re
import os

def modify_template(input_path, output_path):
    doc = docx.Document(input_path)
    
    for p in doc.paragraphs:
        text = p.text
        if not text.strip():
            continue
            
        # Replace large underscore lines with tags
        # We need to be careful with the signature line
        
        # In the text: "El que suscribe_______________________________________________identificado"
        if "El que suscribe" in text or "El(la) que suscribe" in text or "Yo," in text or "Yo_" in text:
            p.text = re.sub(r'_{20,}', ' {NOMBRE} ', p.text)
            
        if "DNI N" in p.text:
            p.text = re.sub(r'_{8,}', '{DNI}', p.text)
            
        if "RUC N" in p.text:
            p.text = re.sub(r'_{8,}', '{RUC}', p.text)
            
        if "domiciliado" in p.text:
            p.text = re.sub(r'_{20,}', ' {DIRECCION} ', p.text)
            
        if "centro de estudios" in p.text:
            p.text = re.sub(r'_{20,}', ' {COLEGIO} ', p.text)
            
        if "año" in p.text or "ao" in p.text:
            p.text = re.sub(r'_{4,}', '{ANIO}', p.text)
            
        if "BANCO" in p.text:
            p.text = re.sub(r'_{10,}', ' {BANCO} ', p.text)
            
        if "CCI" in p.text and "agradeci" not in p.text:
            p.text = re.sub(r'_{15,}', ' {CCI} ', p.text)
            
        if "a nombre de" in p.text:
            p.text = re.sub(r'_{20,}', ' {NOMBRE} ', p.text)

        # For the signature block, we leave the signature line ______ intact, 
        # but replace the labels below if they exist.
        # However docxtemplater only Replaces text. 
        # So we leave the line ________ alone unless it's one of the above.
        
        # DNI: 
        if p.text.strip().startswith("DNI:") or p.text.strip() == "DNI N":
            p.text = "DNI: {DNI}"
            
        if p.text.strip().startswith("RUC:") or p.text.strip() == "RUC N":
            p.text = "RUC: {RUC}"
            
        if p.text.strip() == "NOMBRE:":
            p.text = "NOMBRE: {NOMBRE}"
            
        if p.text.strip() == "NOMBRES:":
            p.text = "NOMBRES: {NOMBRE}"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    print("Template saved to", output_path)

input_docx = r"C:\Users\Soporte\Desktop\Cecom-20251224T131857Z-3-002\Cecom\PAGOS\DJJunio-mano.docx"
output_docx = r"C:\Users\Soporte\Desktop\Cecom-20251224T131857Z-3-002\Cecom\BACKEND\sistema_pagos_dj\templates\plantilla.docx"
modify_template(input_docx, output_docx)
