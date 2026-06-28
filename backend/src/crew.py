# this file is the orchestrator — it pulls agents and tasks together and runs the pipeline
# also reads all PDFs upfront so agents don't need tool calling at runtime

from crewai import Crew, Process
from src.agents import get_agents
from src.tasks import get_tasks
import fitz  # PyMuPDF — reads PDFs before the crew starts
import time
import os

def run_crew(roles: list, resume_paths: list, threshold: int, jds: dict):
    start_time = time.time()

    print(f"\n🚀 Starting Sieve pipeline...")
    print(f"Roles: {', '.join(roles)}")
    print(f"Resumes: {len(resume_paths)}")
    print(f"Threshold: {threshold}%\n")
    
    # read all PDFs upfront — plain text passed into task descriptions
    # this avoids tool calling at runtime which breaks with llama3.2 + litellm
    resume_texts = {}
    for path in resume_paths:
        try:
            doc = fitz.open(path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            resume_texts[path] = text.strip()
            print(f"✅ Read resume: {path}")
        except Exception as e:
            resume_texts[path] = f"Could not read resume: {str(e)}"
            print(f"❌ Failed to read resume: {path} — {str(e)}")

    # load personalised prompt if calibration has been done
    personalised_prompt = ""
    prompt_path = "outputs/personalised_prompt.txt"
    if os.path.exists(prompt_path):
        with open(prompt_path, "r") as f:
            personalised_prompt = f.read()
        print("✅ Loaded personalised scoring prompt from calibration")
    else:
        print("⚠️ No calibration found — using default scoring")

    # assemble the crew and run sequentially
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()

    # save the final report output to file since LLM may not save it itself
    os.makedirs("outputs", exist_ok=True)
    with open("outputs/candidate_report.md", "w") as f:
        f.write(str(result))

    end_time = time.time()
    elapsed = round(end_time - start_time, 2)

    # save time log to outputs/
    with open("outputs/time_log.txt", "w") as f:
        f.write(f"Total processing time: {elapsed}s\n")
        f.write(f"Company: {company}\n")
        f.write(f"Roles: {', '.join(roles)}\n")
        f.write(f"Resumes processed: {len(resume_paths)}\n")
        f.write(f"Threshold: {threshold}%\n")

    print(f"\n✅ Pipeline complete in {elapsed}s")
    return result