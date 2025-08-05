from typing import List, Dict, Any
from pydantic import BaseModel, Field

class FileUploadResponse(BaseModel):
    file_id: str = Field(..., description="UUID of the stored PDF")

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int
    sentence: str

class KGNode(BaseModel):
    id: str
    label: str
    attrs: Dict[str, Any] = {}

class KGEdge(BaseModel):
    source: str
    target: str
    relation: str
    attrs: Dict[str, Any] = {}

class KGPayload(BaseModel):
    nodes: List[KGNode]
    edges: List[KGEdge]

class ExtractResponse(BaseModel):
    entities: List[Entity]
    kg:     KGPayload
