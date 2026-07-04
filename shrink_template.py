import docx

doc = docx.Document('templates/plantilla.docx')

indices_to_remove = [213, 208, 207, 206, 198, 197, 196]

for i in sorted(indices_to_remove, reverse=True):
    p = doc.paragraphs[i]
    if not p.text.strip() and 'sectPr' not in p._element.xml:
        p._element.getparent().remove(p._element)
        print(f"Removed paragraph {i}")

doc.save('templates/plantilla.docx')
print("Successfully shrank the page.")
