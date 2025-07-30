from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uuid
import shutil
from pathlib import Path
from src.data_processing import pdf_ingest, clean_text, kg_builder
from src.inference import model as ner_model, predict as ner_predict
from src.api.schemas import ExtractResponse, KGPayload

# Явные импорты всех схем
from src.api.schemas import (
    FileUploadResponse, 
    ExtractResponse, 
    Entity, 
    KGNode, 
    KGEdge, 
    KGPayload
)

app = FastAPI(
    title="Metallurgy-KG Backend", 
    version="1.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

RAW_DIR = Path("data/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/upload", response_model=FileUploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> FileUploadResponse:
    """Upload PDF file for processing"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")
    
    fid = f"{uuid.uuid4()}.pdf"
    dest = RAW_DIR / fid
    
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    
    return FileUploadResponse(file_id=fid)

@app.post("/extract/{file_id}", response_model=ExtractResponse)
async def extract_entities(file_id: str) -> ExtractResponse:
    """Extract entities from uploaded PDF"""
    pdf_path = RAW_DIR / file_id
    if not pdf_path.exists():
        raise HTTPException(404, "File not found")
    
    # 1. Извлечь текст по страницам из PDF
    sentences = []
    for page_text in pdf_ingest.extract_pages(pdf_path):
        # 2. Оставить только английский текст и удалить формулы/латех
        eng_text = clean_text.filter_english(page_text)
        # 3. Разбить текст на предложения
        page_sentences = clean_text.to_sentences(eng_text)
        sentences.extend(page_sentences)

    if not sentences:
        raise HTTPException(422, "No valid English text found in PDF")
    
    # 4. Прогнать предложения через модель NER (Fine-tuned MatSciBERT)
    pipe, tokenizer = ner_model.get_pipeline("src/model")
    entities = ner_predict.run(pipe, sentences, tokenizer, max_tokens=512)

    
    # 5. Построить knowledge graph на основе найденных сущностей
    kg_graph = kg_builder.build_graph(entities)
    kg_json = kg_builder.to_json(kg_graph)  # {"nodes":..., "edges":...}

    # 6. Вернуть итоговую структуру для фронта
    return ExtractResponse(
        entities=entities,
        kg=KGPayload(
            nodes=kg_json['nodes'],
            edges=kg_json['edges']
        )
    )

@app.get("/health")
def ping():
    """Health check endpoint"""
    return {"status": "ok"}
