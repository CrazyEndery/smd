from typing import List, Dict, Any

def run(pipe, sentences: List[str]) -> List[Dict[str, Any]]:
    out = []
    for sent in sentences:
        for ent in pipe(sent):
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
