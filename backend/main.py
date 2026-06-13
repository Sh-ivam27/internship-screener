# this file acts as the bridge between the UI and the crewAI pipeline
# takes requests from the React frontend which trigger the crewAI pipeline, then it returns the results back to the React frontend

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import shutil

app = FastAPI(title="Sieve API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "inputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

#backend doors :

@app.get("/") # frontend knocks on this backend door to check if the server is alive
def root():
    return {"status": "Sieve API is running"}

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)): # frontend knocks on this door and hands over the resume PDFs (server saves them to /inputs)
    saved = []
    for file in files:
        path = os.path.join(UPLOAD_DIR, file.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved.append(file.filename)
    return {"uploaded": saved}

@app.post("/run-screener") # frontend knocks on this door and hands over the company name, roles and threshold (server triggers the crewAI pipeline)
async def run_screener(
    company: str = Form(...),
    roles: str = Form(...),
    threshold: int = Form(...),
):
    return {
        "status": "started",
        "company": company,
        "roles": roles.split(","),
        "threshold": threshold,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)