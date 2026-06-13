from crewai import Crew, Process
from src.agents import get_agents
from src.tasks import get_tasks
import time
import os

def run_crew(company: str, roles: list, resume_paths: list, threshold: int):
    start_time = time.time()

    print(f"\n🚀 Starting Sieve pipeline...")
    print(f"Company: {company}")
    print(f"Roles: {', '.join(roles)}")
    print(f"Resumes: {len(resume_paths)}")
    print(f"Threshold: {threshold}%\n")

    agents = get_agents()
    tasks = get_tasks(company, roles, resume_paths, threshold)

    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()

    end_time = time.time()
    elapsed = round(end_time - start_time, 2)

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/time_log.txt", "w") as f:
        f.write(f"Total processing time: {elapsed}s\n")
        f.write(f"Company: {company}\n")
        f.write(f"Roles: {', '.join(roles)}\n")
        f.write(f"Resumes processed: {len(resume_paths)}\n")
        f.write(f"Threshold: {threshold}%\n")

    print(f"\n✅ Pipeline complete in {elapsed}s")
    return result