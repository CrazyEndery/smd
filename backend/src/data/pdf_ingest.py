import fitz  # PyMuPDF
from typing import Iterator, Union, List
from pathlib import Path

def extract_pages(pdf_path: Union[str, "Path"]) -> Iterator[str]:
    with fitz.open(pdf_path) as doc:
        for page in doc:
            yield page.get_text("text")
