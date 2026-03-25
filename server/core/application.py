from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.orchestrator import Orchestrator

server = FastAPI()

agent = Orchestrator()

server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    prompt: str


@server.get("/health")
def health_check():
    return { "status": "OK" }

@server.post("/api/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):

    if not agent.verify_dataset(file.filename):
        return JSONResponse(status_code=400, content={"error": "Only  files are supported."})
    
    content = await file.read()
    if agent.read_datasets(content):
        return { "message": f"Dataset '{file.filename}' uploaded successfully" }
    
    return { "message": f"Dataset '{file.filename}' uploading has failed" }

@server.post("/api/visualize")
async def visualize(query: Query):
    
    output = await agent.execute_pipeline(query.prompt)
    
    return output