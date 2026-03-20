import zipfile
import xml.etree.ElementTree as ET
import os
import traceback

def get_docx_text(path):
    try:
        if not os.path.exists(path):
            return f"File not found: {path}"
        with zipfile.ZipFile(path, 'r') as docx:
            if 'word/document.xml' not in docx.namelist():
                return f"word/document.xml not found in zip {path}. Content: {docx.namelist()}"
            xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text_lines = []
        for paragraph in tree.findall('.//w:p', namespace):
            texts = paragraph.findall('.//w:t', namespace)
            if texts:
                para_parts = []
                for t in texts:
                    if t.text is not None:
                        para_parts.append(str(t.text))
                    else:
                        para_parts.append("")
                text_lines.append("".join(para_parts))
        return '\n'.join(text_lines)
    except Exception as e:
        return f"Error reading {path}: {e}\n{traceback.format_exc()}"

docs_dir = r'c:\Users\Admin\Desktop\indipips\zUpdatedDocs'
files = sorted([f for f in os.listdir(docs_dir) if f.endswith('.docx')])

with open(r'c:\Users\Admin\Desktop\indipips\all_docs_content_utf8.txt', 'w', encoding='utf-8') as out:
    for file in files:
        path = os.path.join(docs_dir, file)
        out.write(f"--- START OF {file} ---\n")
        out.write(get_docx_text(path))
        out.write(f"\n--- END OF {file} ---\n\n")
