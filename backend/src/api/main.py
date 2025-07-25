from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "metallurgy-kg API"} 