# this file is for testing the crewAI pipeline directly from the terminal
# without needing the frontend or FastAPI running
# usage: python -m src.main

import os
from src.crew import run_crew

def main():
    # test values — change these to test different scenarios
    roles = ["Software Engineering Intern"]
    threshold = 60

    # paste a real JD here for testing
    jds = {
        "Software Engineering Intern": """
        We are looking for a Software Engineering Intern to join our team.
        Required skills: Python, data structures, algorithms, REST APIs.
        Preferred: experience with distributed systems, machine learning, cloud platforms.
        You will work on backend systems, write clean code, and collaborate with senior engineers.
        """
    }

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
        roles=roles,
        resume_paths=resume_paths,
        threshold=threshold,
        jds=jds,
    )

    print("\n✅ Pipeline complete.")
    print(result)

if __name__ == "__main__":
    main()