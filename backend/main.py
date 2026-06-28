# this file acts as the bridge between the UI and the crewAI pipeline
# takes requests from the React frontend which trigger the crewAI pipeline, then it returns the results back to the React frontend

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import shutil
import sys
import json
from pathlib import Path

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

@app.post("/run-screener") # frontend knocks on this door and hands over roles and threshold (server triggers the crewAI pipeline)
async def run_screener(
    roles: str = Form(...),
    threshold: int = Form(...),
    jds: str = Form("{}"),
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
    # company set to generic value since recruiter provides JDs directly

    result = run_crew(
        roles=roles.split(","),
        resume_paths=resume_paths,
        threshold=threshold,
        jds=json.loads(jds) if jds else {},
    )

    return {"status": "complete", "result": str(result)}

@app.get("/results") # frontend knocks on this door to get the results after the pipeline completes
def get_results():
    report_path = Path("outputs/candidate_report.md")
    time_log_path = Path("outputs/time_log.txt")

    result = {}

    # read candidate report if it exists
    if report_path.exists():
        result["report"] = report_path.read_text()
    else:
        result["report"] = None

    # read time log if it exists
    if time_log_path.exists():
        result["time_log"] = time_log_path.read_text()
    else:
        result["time_log"] = None

    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)