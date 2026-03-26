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


@server.get("/api/suggestions")
def get_suggestions():
    if agent.df is None:
        return {"suggestions": []}

    cols     = list(agent.df.columns)
    numeric  = agent.df.select_dtypes(include="number").columns.tolist()
    categorical = agent.df.select_dtypes(include=["object", "category"]).columns.tolist()

    suggestions = []

    if len(numeric) >= 2:
        suggestions.append(f"Show a scatter plot of {numeric[0]} vs {numeric[1]}")
        suggestions.append(f"Plot the correlation heatmap of all numeric columns")
    if len(numeric) >= 1:
        suggestions.append(f"Show the distribution of {numeric[0]}")
        suggestions.append(f"Draw a histogram of {numeric[0]}")
        suggestions.append(f"Box plot of {numeric[0]}")
        suggestions.append(f"Line chart of {numeric[0]} over index")
    if len(categorical) >= 1 and len(numeric) >= 1:
        suggestions.append(f"Bar chart of {numeric[0]} grouped by {categorical[0]}")
        suggestions.append(f"Show top 10 {categorical[0]} by {numeric[0]}")
    if len(categorical) >= 1:
        suggestions.append(f"Show the count of each {categorical[0]}")
        suggestions.append(f"Pie chart of {categorical[0]} distribution")

    suggestions.append("Give me a summary of the dataset")
    suggestions.append("Show the first 5 rows as a table")

    # deduplicate and cap at 12
    return {"suggestions": list(dict.fromkeys(suggestions))[:12]}


@server.post("/api/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):

    if not agent.verify_dataset(file.filename):
        return JSONResponse(status_code=400, content={"error": "Only .csv, .xlsx, .json, .parquet files are supported."})
    
    content = await file.read()
    if agent.read_datasets(content):
        return { "message": f"Dataset '{file.filename}' uploaded successfully" }
    
    return { "message": f"Dataset '{file.filename}' uploading has failed" }


@server.post("/api/visualize")
def visualize(query: Query):

    print("[DEBUG] User entered query:", query.prompt)
    
    output = agent.execute_pipeline(query.prompt)
    
    print("[DEBUG] Output sent successfully")
    return output