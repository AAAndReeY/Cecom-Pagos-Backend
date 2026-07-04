import sys
from docx2pdf import convert

def main():
    if len(sys.argv) < 3:
        print("Uso: python convert_pdf.py input.docx output.pdf")
        sys.exit(1)
        
    input_docx = sys.argv[1]
    output_pdf = sys.argv[2]
    
    try:
        convert(input_docx, output_pdf)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
