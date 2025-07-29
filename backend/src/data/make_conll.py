import re, nltk
from nltk.tokenize import sent_tokenize
from typing import List
nltk.download("punkt", quiet=True)

CYRILLIC = re.compile(r"[А-Яа-яЁё]")
LATEX    = re.compile(r"\$[^$]+\$|\\\(.+?\\\)|\\begin\{.*?\}", re.S)

def filter_english(text: str) -> str:
    text = LATEX.sub(" ", text)
    text = re.sub(r"\s+", " ", text)
    if CYRILLIC.search(text):
        return ""           # drop whole page if Cyrillic present
    return text

def to_sentences(raw: str) -> List[str]:
    return [s.strip() for s in sent_tokenize(raw) if len(s.split()) > 3]
