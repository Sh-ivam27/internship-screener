# this file acts as the bridge between the UI and the crewAI pipeline
# takes requests from the React frontend which trigger the crewAI pipeline, then it returns the results back to the React frontend

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import shutil
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.crew import run_crew

app = FastAPI(title="Sieve API")

# allows the React app on port 3000 to talk to the backend on port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "inputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# backend doors:

@app.get("/") # frontend knocks on this door to check if the server is alive
def root():
    return {"status": "Sieve API is running"}

@app.post("/upload-resumes") # frontend knocks on this door and hands over the resume PDFs (server saves them to /inputs)
async def upload_resumes(files: list[UploadFile] = File(...)):
    saved = []
    for file in files:
        path = os.path.join(UPLOAD_DIR, file.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved.append(path)
    return {"uploaded": saved}

@app.post("/run-screener") # frontend knocks on this door and hands over company name, roles and threshold (server triggers the crewAI pipeline)
async def run_screener(
    company: str = Form(...),
    roles: str = Form(...),
    threshold: int = Form(...),
):
    # get all uploaded resume PDFs from inputs folder
    resume_paths = [
        os.path.join(UPLOAD_DIR, f)
        for f in os.listdir(UPLOAD_DIR)
        if f.endswith(".pdf")
    ]

    if not resume_paths:
        return JSONResponse(status_code=400, content={"error": "No resumes found in inputs folder"})

    # trigger the crewAI pipeline and wait for results
    result = run_crew(
        company=company,
        roles=roles.split(","),
        resume_paths=resume_paths,
        threshold=threshold,
    )

    return {"status": "complete", "result": str(result)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)