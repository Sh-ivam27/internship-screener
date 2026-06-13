# this file is for testing the crewAI pipeline directly from the terminal
# without needing the frontend or FastAPI running
# usage: python -m src.main

import os
from src.crew import run_crew

def main():
    # test inputs — change these to match your actual test data
    company = "Zepto"
    roles = ["Software Engineering Intern"]
    threshold = 60

    # get all PDFs from inputs folder
    resume_paths = [
        os.path.join("inputs", f)
        for f in os.listdir("inputs")
        if f.endswith(".pdf")
    ]

    if not resume_paths:
        print("❌ No resumes found in inputs/ folder. Add some PDFs and try again.")
        return

    print(f"Found {len(resume_paths)} resume(s): {resume_paths}")

    result = run_crew(
        company=company,
        roles=roles,
        resume_paths=resume_paths,
        threshold=threshold,
    )

    print("\n✅ Pipeline complete.")
    print(result)

if __name__ == "__main__":
    main()