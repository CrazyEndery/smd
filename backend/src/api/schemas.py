from pydantic import BaseModel
from typing import List, Dict

class Entity(BaseModel):
    word: str
    entity_group: str
    score: float
    sentence: str

class EntitiesResponse(BaseModel):
    entities: List[Entity]

class KGNode(BaseModel):
    id: str
    type: str
    conf: float

class KGEdge(BaseModel):
    source: str
    target: str
    relation: str
    conf: float

class KGResponse(BaseModel):
    nodes: List[KGNode]
    links: List[KGEdge]

class FileUploadResponse(BaseModel):
    message: str
    file_id: str

class ErrorResponse(BaseModel):
    detail: str
