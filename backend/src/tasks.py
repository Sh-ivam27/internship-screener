# this file contains all the tasks we need to perform 

from crewai import Task
from src.agents import get_agents

def get_tasks(company: str, roles: list, resume_paths: list, threshold: int):
    agents = get_agents()
    tasks = []

    for role in roles:

        # Stage 0 — JD Generation
        jd_gen_task = Task(
            description=f"""
            Generate a detailed, realistic job description for the role of {role} at {company}.
            Include: role overview, key responsibilities, required skills, preferred qualifications, and tools/technologies.
            Make it specific to what {company} would actually look for.
            """,
            expected_output="A full structured job description for the role.",
            agent=agents["jd_generator"],
        )
        tasks.append(jd_gen_task)

        # Stage 0 — JD Analysis
        jd_analyst_task = Task(
            description=f"""
            Take the generated job description for {role} at {company} and structure it into a 10-field scoring rubric.
            The 10 fields are:
            1. Relevant Skills Match
            2. Experience Level
            3. Project Relevance
            4. Educational Background
            5. Tools & Technologies
            6. Achievement Quality
            7. Communication Clarity
            8. Role-Specific Keywords
            9. Extracurriculars / Leadership
            10. Overall Fit Impression
            For each field, specify exactly what to look for based on the JD.
            """,
            expected_output="A structured 10-field scoring rubric for this role.",
            agent=agents["jd_analyst"],
            context=[jd_gen_task],
        )
        tasks.append(jd_analyst_task)

        for resume_path in resume_paths:

            # Stage 1 — Resume Screening
            screen_task = Task(
                description=f"""
                Read the resume at {resume_path} using the PDF reader tool.
                Score it against the 10-field rubric for {role} at {company}.
                Score each field from 0-10 with reasoning.
                Compute total score out of 100.
                If total >= {threshold}, mark as PASS. Otherwise mark as FAIL.
                """,
                expected_output=f"Candidate name, score per field, total score, PASS/FAIL decision, reasoning.",
                agent=agents["resume_screener"],
                context=[jd_analyst_task],
            )
            tasks.append(screen_task)

            # Stage 2 — Deep Analysis (for passed candidates)
            deep_task = Task(
                description=f"""
                If the candidate PASSED screening for {role} at {company}:
                Read the resume at {resume_path} and perform deep analysis.
                Extract relevant projects and explain why they matter for this role.
                Identify 3-5 role-specific strengths.
                Identify 2-3 role-specific weaknesses or gaps.
                """,
                expected_output="Relevant projects, strengths, and weaknesses for this candidate.",
                agent=agents["deep_analyser"],
                context=[screen_task],
            )
            tasks.append(deep_task)

            # Stage 2 — Alternate Role Matching (for failed candidates)
            alt_role_task = Task(
                description=f"""
                If the candidate FAILED screening for {role} at {company}:
                Check if they might be a better fit for any of these other open roles: {', '.join([r for r in roles if r != role])}.
                If yes, specify which role and why.
                If no match found, state that clearly.
                """,
                expected_output="Alternate role match or no match found with reasoning.",
                agent=agents["alternate_role_matcher"],
                context=[screen_task],
            )
            tasks.append(alt_role_task)

            # Stage 2 — Interview Questions
            iq_task = Task(
                description=f"""
                If the candidate PASSED for {role} at {company}:
                Generate 3-5 tailored interview questions based on their profile and the role requirements.
                Questions should be specific to their actual background — not generic.
                """,
                expected_output="3-5 tailored interview questions for this candidate.",
                agent=agents["interview_question_generator"],
                context=[deep_task],
            )
            tasks.append(iq_task)

            # Stage 2 — Email Drafting
            email_task = Task(
                description=f"""
                Draft a personalised email for this candidate applying for {role} at {company}.
                If PASSED: write an interview invite email referencing their strengths.
                If FAILED but alternate role found: write a redirect email to the alternate role.
                If FAILED and no alternate role: write a warm rejection email.
                """,
                expected_output="A complete email ready to send to the candidate.",
                agent=agents["email_drafter"],
                context=[screen_task, deep_task, alt_role_task],
            )
            tasks.append(email_task)

            # Stage 2 — Report Writing
            report_task = Task(
                description=f"""
                Compile a complete candidate report for this applicant for {role} at {company}.
                Include: candidate name, total score, field-by-field scores, strengths, weaknesses,
                relevant projects, interview questions, and email draft.
                Save the report as a markdown file to outputs/{{candidate_name}}_{{role}}_report.md
                """,
                expected_output="A complete formatted markdown candidate report saved to outputs/.",
                agent=agents["report_writer"],
                context=[screen_task, deep_task, iq_task, email_task],
            )
            tasks.append(report_task)

    # Validation
    validation_task = Task(
        description=f"""
        Compare the system's scores against manual scores if provided.
        Produce a side-by-side validation sheet showing system score vs manual score per field per candidate.
        Highlight fields with large differences (>2 points).
        """,
        expected_output="A validation sheet comparing system and manual scores.",
        agent=agents["validation_agent"],
    )
    tasks.append(validation_task)

    return tasks