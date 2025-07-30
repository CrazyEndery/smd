# src/inference/predict.py
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def run(pipe, sentences: List[str]) -> List[Dict[str, Any]]:
    out = []
    
    logger.info(f"Обрабатываем {len(sentences)} предложений")
    
    for i, sent in enumerate(sentences):
        try:
            logger.debug(f"Обработка предложения {i+1}: {sent[:50]}...")
            
            # Простой вызов без дополнительных параметров
            entities = pipe(sent)
            
            logger.debug(f"Найдено {len(entities)} сущностей")
            
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
        except Exception as e:
            logger.error(f"Ошибка при обработке предложения {i+1}: {e}")
            # Продолжаем обработку остальных предложений
            continue
    
    logger.info(f"Обработка завершена. Найдено {len(out)} сущностей")
    return out
