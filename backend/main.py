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

@app.post("/calibrate") # frontend sends recruiter's manual scores, backend generates personalised scoring prompt
async def calibrate(request: dict):
    scores = request.get("scores", {})
    
    if not scores:
        return JSONResponse(status_code=400, content={"error": "No scores provided"})

    # analyse scoring pattern — find average score per field across all resumes
    field_averages = {}
    for field in [
        "Relevant Skills Match", "Experience Level", "Project Relevance",
        "Educational Background", "Tools & Technologies", "Achievement Quality",
        "Communication Clarity", "Role-Specific Keywords",
        "Extracurriculars / Leadership", "Overall Fit Impression"
    ]:
        field_scores = [resume_scores[field] for resume_scores in scores.values() if field in resume_scores]
        field_averages[field] = round(sum(field_scores) / len(field_scores), 1) if field_scores else 5.0

    # find which fields the recruiter weights heavily (score > 7) and lightly (score < 4)
    high_weight = [f for f, avg in field_averages.items() if avg >= 7]
    low_weight = [f for f, avg in field_averages.items() if avg <= 4]

    # generate personalised scoring prompt based on recruiter's pattern
    personalised_prompt = f"""
You are scoring resumes for a recruiter with a specific evaluation style learned from their manual scores.

RECRUITER SCORING STYLE:
- Average scores per field from manual evaluation: {field_averages}
- Fields this recruiter weights HEAVILY (score generously): {high_weight if high_weight else 'None identified yet'}
- Fields this recruiter weights LIGHTLY (score strictly): {low_weight if low_weight else 'None identified yet'}

INSTRUCTIONS:
- Mirror this recruiter's scoring style when evaluating candidates
- For heavily weighted fields: be generous, reward partial matches
- For lightly weighted fields: be strict, only reward strong matches
- Score each field 0-10, total out of 100
- Maintain consistency with the recruiter's demonstrated preferences
"""

    # save personalised prompt to file
    os.makedirs("outputs", exist_ok=True)
    with open("outputs/personalised_prompt.txt", "w") as f:
        f.write(personalised_prompt)

    # save calibration data for validation later
    with open("outputs/calibration_data.json", "w") as f:
        json.dump({
            "manual_scores": scores,
            "field_averages": field_averages,
            "high_weight_fields": high_weight,
            "low_weight_fields": low_weight,
            "prompt_version": 1
        }, f, indent=2)

    return {
        "status": "calibrated",
        "field_averages": field_averages,
        "high_weight_fields": high_weight,
        "low_weight_fields": low_weight,
        "prompt_version": 1
    }