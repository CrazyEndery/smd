from typing import List, Dict, Any

def run(pipe, sentences: List[str]) -> List[Dict[str, Any]]:
    out = []
    
    # Параметры для токенизатора
    tokenizer_kwargs = {
        'padding': True,
        'truncation': True,
        'max_length': 512,
        'return_tensors': 'pt'
    }
    
    for sent in sentences:
        # Передаем параметры токенизатора
        entities = pipe(sent, **tokenizer_kwargs)
        for ent in entities:
            out.append(
                dict(
                    text       = ent["word"],
                    label      = ent["entity_group"],
                    start      = ent["start"],
                    end        = ent["end"],
                    sentence   = sent,
                )
            )
    return out
