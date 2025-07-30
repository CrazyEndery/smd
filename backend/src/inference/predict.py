# src/inference/predict.py
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def chunk_sentences(sentences, max_tokens=512, tokenizer=None):
    """Группирует предложения в чанки так, чтобы суммарно не превышать max_tokens."""
    if tokenizer is None:
        raise ValueError("tokenizer required")
    chunks, current_chunk = [], []
    total_tokens = 0

    for sent in sentences:
        num_tokens = len(tokenizer.tokenize(sent))
        # Если добавление предложения превысит лимит — начнём новый чанк
        if total_tokens + num_tokens > max_tokens and current_chunk:
            chunks.append(list(current_chunk))
            current_chunk = []
            total_tokens = 0
        current_chunk.append(sent)
        total_tokens += num_tokens
    if current_chunk:
        chunks.append(list(current_chunk))
    return chunks


def run(pipe, sentences, tokenizer, max_tokens=512):
    out = []
    chunks = chunk_sentences(sentences, max_tokens=max_tokens, tokenizer=tokenizer)
    for chunk in chunks:
        text = " ".join(chunk)
        entities = pipe(text)
        # Можно включить обратное сопоставление с предложениями, если нужно
        for ent in entities:
            out.append({
                "text": ent["word"],
                "label": ent["entity_group"],
                "start": ent["start"],
                "end": ent["end"],
                "sentence": text  # Чанк или позже восстановить отдельное предложение
            })
    return out

