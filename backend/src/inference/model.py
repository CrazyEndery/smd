# from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
# import torch

# _PIPE = None
# def get_pipeline(model_dir):
#     global _PIPE
#     if _PIPE is None:
#         # Загружаем модель и токенизатор отдельно
#         model = AutoModelForTokenClassification.from_pretrained(model_dir)
#         tokenizer = AutoTokenizer.from_pretrained(
#             model_dir,
#             model_max_length=512,
#             padding_side="right",
#             truncation_side="right"
#         )
        
#         _PIPE = pipeline(
#             "ner",
#             model=model,
#             tokenizer=tokenizer,
#             aggregation_strategy="simple",
#             device=0 if torch.cuda.is_available() else -1,
#             # Можно также передать параметры обработки здесь
#             truncation=True,
#             padding=True,
#             max_length=512
#         )
#     return _PIPE


# src/inference/model.py
from transformers import (
    TokenClassificationPipeline, 
    AutoTokenizer, 
    AutoModelForTokenClassification
)
import torch

class CustomNERPipeline(TokenClassificationPipeline):
    def preprocess(self, sentence, offset_mapping=None):
        model_inputs = self.tokenizer(
            sentence,
            return_tensors=self.framework,
            truncation=True,        # Включаем усечение
            max_length=512,         # Максимальная длина
            padding=True,           # Включаем дополнение
            return_special_tokens_mask=True,
            return_offsets_mapping=self.tokenizer.is_fast,
        )
        if offset_mapping:
            model_inputs["offset_mapping"] = offset_mapping
        model_inputs["sentence"] = sentence
        return model_inputs

_PIPE = None

def get_pipeline(model_dir):
    global _PIPE
    if _PIPE is None:
        # ВАЖНО: Загружаем модель и токенизатор отдельно
        model = AutoModelForTokenClassification.from_pretrained(model_dir)
        tokenizer = AutoTokenizer.from_pretrained(
            model_dir,
            model_max_length=512,
            use_fast=True
        )
        
        # Передаем уже загруженные объекты
        _PIPE = CustomNERPipeline(
            model=model,           # Загруженная модель
            tokenizer=tokenizer,   # Загруженный токенизатор
            aggregation_strategy="simple",
            device=0 if torch.cuda.is_available() else -1,
        )
    return _PIPE
