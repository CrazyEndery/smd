from transformers import pipeline
import torch

_PIPE = None
def get_pipeline():
    global _PIPE
    if _PIPE is None:
        _PIPE = pipeline(
            "ner",
            model="../model/",
            tokenizer="../model/",
            aggregation_strategy="simple",
            device=0 if torch.cuda.is_available() else -1,
        )
    return _PIPE
