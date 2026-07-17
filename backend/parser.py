import os
import fitz  # PyMuPDF
import docx
from typing import List, Dict, Any

def parse_pdf(file_path: str) -> List[str]:
    pages = []
    doc = fitz.open(file_path)
    for page in doc:
        text = page.get_text()
        pages.append(text)
    doc.close()
    return pages

def parse_docx(file_path: str) -> List[str]:
    doc = docx.Document(file_path)
    # Since DOCX doesn't have clear page boundaries, we simulate pages by grouping paragraphs
    # E.g., approx 500 words per page
    pages = []
    current_page_text = []
    current_word_count = 0
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        words = text.split()
        current_page_text.append(text)
        current_word_count += len(words)
        
        if current_word_count >= 400:
            pages.append("\n".join(current_page_text))
            current_page_text = []
            current_word_count = 0
            
    if current_page_text:
        pages.append("\n".join(current_page_text))
        
    return pages if pages else [""]

def parse_txt(file_path: str) -> List[str]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    
    # Split text into pages of roughly 400 words
    words = text.split()
    pages = []
    page_size = 400
    for i in range(0, len(words), page_size):
        page_words = words[i:i + page_size]
        pages.append(" ".join(page_words))
    
    return pages if pages else [""]

def extract_text_pages(file_path: str) -> List[str]:
    _, ext = os.path.splitext(file_path.lower())
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext == ".docx":
        return parse_docx(file_path)
    elif ext == ".txt":
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
