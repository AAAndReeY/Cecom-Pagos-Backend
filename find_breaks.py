import docx
doc = docx.Document('templates/plantilla.docx')
for i, p in enumerate(doc.paragraphs):
    if p.paragraph_format.page_break_before:
        print('Page break before paragraph ' + str(i))
