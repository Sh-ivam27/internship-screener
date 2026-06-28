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

CALIBRATION_DIR = "calibration_inputs"
os.makedirs(CALIBRATION_DIR, exist_ok=True)

@app.post("/upload-calibration-resumes") # receives calibration resumes separately from screening resumes
async def upload_calibration_resumes(files: list[UploadFile] = File(...)):
    saved = []
    # clear old calibration resumes first
    for f in os.listdir(CALIBRATION_DIR):
        os.remove(os.path.join(CALIBRATION_DIR, f))
    for file in files:
        path = os.path.join(CALIBRATION_DIR, file.filename)
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

@app.post("/calibrate") # receives manual scores, reads resume PDFs, generates personalised prompt
async def calibrate(request: dict):
    import fitz
    scores = request.get("scores", {})

    if not scores:
        return JSONResponse(status_code=400, content={"error": "No scores provided"})

    # read each calibration resume PDF and pair with manual scores
    resume_examples = {}
    for filename, resume_scores in scores.items():
        pdf_path = os.path.join(CALIBRATION_DIR, filename)
        if os.path.exists(pdf_path):
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            resume_examples[filename] = {
                "resume_text": text.strip(),  # full resume text
                "manual_scores": resume_scores,
                "total": sum(resume_scores.values())
            }

    # analyse scoring pattern — find average score per field across all resumes
    fields = [
        "Relevant Skills Match", "Experience Level", "Project Relevance",
        "Educational Background", "Tools & Technologies", "Achievement Quality",
        "Communication Clarity", "Role-Specific Keywords",
        "Extracurriculars / Leadership", "Overall Fit Impression"
    ]

    field_averages = {}
    for field in fields:
        field_scores = [s["manual_scores"][field] for s in resume_examples.values() if field in s["manual_scores"]]
        field_averages[field] = round(sum(field_scores) / len(field_scores), 1) if field_scores else 5.0

    # find heavily and lightly weighted fields
    high_weight = [f for f, avg in field_averages.items() if avg >= 7]
    low_weight = [f for f, avg in field_averages.items() if avg <= 4]

    # build example strings from real resumes + scores
    examples_text = ""
    for filename, data in resume_examples.items():
        examples_text += f"\n--- Example Resume: {filename} ---\n"
        examples_text += f"Resume content:\n{data['resume_text']}\n"
        examples_text += f"Recruiter scores: {data['manual_scores']}\n"
        examples_text += f"Total: {data['total']}/100\n"

    # generate personalised prompt with real resume examples
    personalised_prompt = f"""
You are scoring resumes for a recruiter with a specific evaluation style learned from their manual scores.

RECRUITER SCORING STYLE:
- Average scores per field: {field_averages}
- Fields weighted HEAVILY (be generous, reward partial matches): {high_weight if high_weight else 'None'}
- Fields weighted LIGHTLY (be strict, only reward strong matches): {low_weight if low_weight else 'None'}

REAL EXAMPLES FROM THIS RECRUITER:
{examples_text}

INSTRUCTIONS:
- Study the examples above to understand exactly how this recruiter scores
- Mirror their scoring style precisely when evaluating new candidates
- Score each field 0-10, total out of 100
- Be consistent with the recruiter's demonstrated preferences shown in the examples above
"""

    # save personalised prompt
    os.makedirs("outputs", exist_ok=True)
    with open("outputs/personalised_prompt.txt", "w") as f:
        f.write(personalised_prompt)

    # save calibration data
    with open("outputs/calibration_data.json", "w") as f:
        json.dump({
            "resume_examples": {k: {**v} for k, v in resume_examples.items()},
            "field_averages": field_averages,
            "high_weight_fields": high_weight,
            "low_weight_fields": low_weight,
            "prompt_version": 1
        }, f, indent=2)

    return {
        "status": "calibrated",
        "resumes_used": len(resume_examples),
        "field_averages": field_averages,
        "high_weight_fields": high_weight,
        "low_weight_fields": low_weight,
        "prompt_version": 1
    }