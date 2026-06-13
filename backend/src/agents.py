# this file defines all 10 agents in the pipeline
# each agent has a role, goal, and backstory that tells the LLM who it is and what it does
# no tools needed here anymore — PDFs are read upfront in crew.py

from crewai import Agent, LLM

# local LLM running via Ollama — no API key needed, runs fully on your machine
llm = LLM(model="ollama/llama3.2", base_url="http://localhost:11434", api_key="ollama")

def get_agents():

    # Stage 0 — generates a full JD from just a company name and role title
    jd_generator = Agent(
        role="Job Description Generator",
        goal="Generate a realistic, detailed job description for a given role at a given company",
        backstory="You are an expert HR professional who has written hundreds of job descriptions for top tech companies. You know exactly what skills, experience, and qualities to look for in each role.",
        llm=llm,
        verbose=True,
    )

    # Stage 0 — converts the generated JD into a structured 10-field scoring rubric
    jd_analyst = Agent(
        role="Job Description Analyst",
        goal="Structure a job description into a clear 10-field scoring rubric",
        backstory="You are an expert HR analyst who breaks down job descriptions into discrete, measurable criteria that can be used to evaluate candidates objectively.",
        llm=llm,
        verbose=True,
    )

    # Stage 1 — scores each resume against the rubric, pass/fail decision
    resume_screener = Agent(
        role="Resume Screener",
        goal="Score each resume against the 10-field rubric and decide pass or fail based on the threshold",
        backstory="You are a detail-oriented recruiter who evaluates resumes fairly and thoroughly, giving clear reasoning for every scoring decision.",
        llm=llm,
        verbose=True,
    )

    # Stage 2 — deep analysis for passed candidates only
    deep_analyser = Agent(
        role="Deep Candidate Analyser",
        goal="Extract relevant projects and achievements from passed candidates and identify strengths and weaknesses specific to the role",
        backstory="You are a senior talent evaluator who goes beyond surface-level screening to understand how a candidate's experience truly maps to a role.",
        llm=llm,
        verbose=True,
    )

    # Stage 2 — checks if failed candidates fit any other open role
    alternate_role_matcher = Agent(
        role="Alternate Role Matcher",
        goal="For failed candidates, check if they are a better fit for any other open role",
        backstory="You are a resourceful recruiter who hates losing good talent to the wrong role. You always check if a rejected candidate might shine elsewhere.",
        llm=llm,
        verbose=True,
    )

    # Stage 2 — generates tailored interview questions for passed candidates
    interview_question_generator = Agent(
        role="Interview Question Generator",
        goal="Generate 3-5 tailored interview questions based on the candidate's profile and the role requirements",
        backstory="You are an experienced interviewer who crafts insightful, specific questions that reveal how well a candidate fits the role.",
        llm=llm,
        verbose=True,
    )

    # Stage 2 — drafts personalised emails for every candidate
    email_drafter = Agent(
        role="Email Drafter",
        goal="Draft personalised emails for every candidate — interview invite, alternate role redirect, or rejection",
        backstory="You are a professional communicator who writes clear, warm, and personalised emails that represent the company well regardless of the outcome.",
        llm=llm,
        verbose=True,
    )

    # Stage 2 — compiles everything into a clean candidate report
    report_writer = Agent(
        role="Candidate Report Writer",
        goal="Compile all analysis into a clean, structured candidate report saved to the outputs folder",
        backstory="You are a professional technical writer who produces clear, concise recruiter-ready reports that help hiring teams make fast, informed decisions.",
        llm=llm,
        verbose=True,
    )

    # Stage 3 — compares system scores vs manual scores
    validation_agent = Agent(
        role="Validation Agent",
        goal="Compare system scores against manual scores and produce a side-by-side validation sheet",
        backstory="You are a meticulous QA analyst who ensures the screening system is scoring accurately by comparing it against human judgment.",
        llm=llm,
        verbose=True,
    )

    # Stage 3 — logs total processing time
    time_logger = Agent(
        role="Time Logger",
        goal="Track and record the processing time for each stage of the pipeline",
        backstory="You are a precise analyst who documents how long each part of the pipeline takes to help optimise performance.",
        llm=llm,
        verbose=True,
    )

    return {
        "jd_generator": jd_generator,
        "jd_analyst": jd_analyst,
        "resume_screener": resume_screener,
        "deep_analyser": deep_analyser,
        "alternate_role_matcher": alternate_role_matcher,
        "interview_question_generator": interview_question_generator,
        "email_drafter": email_drafter,
        "report_writer": report_writer,
        "validation_agent": validation_agent,
        "time_logger": time_logger,
    }