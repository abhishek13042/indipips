import zipfile
import xml.etree.ElementTree as ET
import os

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for paragraph in tree.findall('.//w:p', namespace):
            texts = paragraph.findall('.//w:t', namespace)
            if texts:
                text.append(''.join(t.text for t in texts))
        return '\n'.join(text)
    except Exception as e:
        return f"Error reading {path}: {e}"

docs_dir = r'c:\Users\Admin\Desktop\indipips\zUpdatedDocs'
files = [f for f in os.listdir(docs_dir) if f.endswith('.docx')]

for file in files:
    path = os.path.join(docs_dir, file)
    print(f"--- START OF {file} ---")
    print(get_docx_text(path))
    print(f"--- END OF {file} ---\n")
