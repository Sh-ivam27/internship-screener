# this file defines all the tasks in the pipeline
# each task has a description (the actual prompt), expected output, and which agent runs it
# resume text is passed directly into task descriptions — no tool calling needed

from crewai import Task

def get_tasks(company: str, roles: list, resume_paths: list, threshold: int, resume_texts: dict):
    from src.agents import get_agents
    agents = get_agents()
    tasks = []

    for role in roles:

        # Stage 0 — generate a full JD from company name + role title
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

        # Stage 0 — convert JD into structured 10-field scoring rubric
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

            # get the pre-read resume text — no tool calling needed
            resume_text = resume_texts.get(resume_path, "Could not read resume")

            # Stage 1 — score resume against rubric, pass/fail decision
            screen_task = Task(
                description=f"""
                Score this resume against the 10-field rubric for {role} at {company}.
                Score EACH field with a single number from 0 to 10. No other scale. No partial scores.
                Add all 10 field scores together. The total MUST be out of 100 maximum.
                Do not use any other scoring system.
                If total >= {threshold}, mark as PASS. Otherwise mark as FAIL.

                Resume content:
                {resume_text}
                """,
                expected_output="Candidate name, score per field, total score, PASS/FAIL decision, reasoning.",
                agent=agents["resume_screener"],
                context=[jd_analyst_task],
            )
            tasks.append(screen_task)

            # Stage 2 — deep analysis for passed candidates
            deep_task = Task(
                description=f"""
                If the candidate PASSED screening for {role} at {company}:
                Analyse the resume in context of the role.
                Extract relevant projects and explain why they matter for this role.
                Identify 3-5 role-specific strengths.
                Identify 2-3 role-specific weaknesses or gaps.

                Resume content:
                {resume_text}
                """,
                expected_output="Relevant projects, role-specific strengths, and weaknesses for this candidate.",
                agent=agents["deep_analyser"],
                context=[screen_task],
            )
            tasks.append(deep_task)

            # Stage 2 — check if failed candidates fit any other open role
            alt_role_task = Task(
                description=f"""
                If the candidate FAILED screening for {role} at {company}:
                Check if they might be a better fit for any of these other open roles: {', '.join([r for r in roles if r != role]) or 'No other roles available'}.
                If yes, specify which role and why.
                If no match found, state that clearly.

                Resume content:
                {resume_text}
                """,
                expected_output="Alternate role match or no match found with reasoning.",
                agent=agents["alternate_role_matcher"],
                context=[screen_task],
            )
            tasks.append(alt_role_task)

            # Stage 2 — generate tailored interview questions for passed candidates
            iq_task = Task(
                description=f"""
                If the candidate PASSED for {role} at {company}:
                Generate 3-5 tailored interview questions based on their profile and the role requirements.
                Questions must be specific to their actual background — not generic.

                Resume content:
                {resume_text}
                """,
                expected_output="3-5 tailored interview questions for this candidate.",
                agent=agents["interview_question_generator"],
                context=[deep_task],
            )
            tasks.append(iq_task)

            # Stage 2 — draft personalised email for every candidate
            email_task = Task(
                description=f"""
                Draft a personalised email for this candidate applying for {role} at {company}.
                If PASSED: write an interview invite email referencing their specific strengths.
                If FAILED but alternate role found: write a redirect email to the alternate role.
                If FAILED and no alternate role: write a warm rejection email.
                """,
                expected_output="A complete, personalised email ready to send to the candidate.",
                agent=agents["email_drafter"],
                context=[screen_task, deep_task, alt_role_task],
            )
            tasks.append(email_task)

            # Stage 2 — compile everything into a clean candidate report
            # Stage 2 — compile everything into a clean candidate report
            report_task = Task(
                description=f"""
                You are a report writer. Output ONLY a structured markdown report. Do not roleplay, do not write scripts, do not add commentary.

                Write a candidate report with EXACTLY these sections:
                # Candidate Report: [Candidate Name]
                ## Score: [total]/100 — [PASS/FAIL]
                ## Field Scores
                [list each of the 10 fields with score out of 10]
                ## Strengths
                [bullet points]
                ## Weaknesses
                [bullet points]
                ## Relevant Projects
                [bullet points]
                ## Interview Questions
                [numbered list]
                ## Draft Email
                [email text]

                Base everything on the previous agents' outputs for {role} at {company}.
                Output the report and nothing else.
                """,
                expected_output="A complete structured markdown candidate report with all sections filled in.",
                agent=agents["report_writer"],
                context=[screen_task, deep_task, iq_task, email_task],
            )
            tasks.append(report_task)

    # Stage 3 — compare system scores vs manual scores
    validation_task = Task(
        description=f"""
        Compare the system's scores against manual scores if provided.
        Produce a side-by-side validation sheet showing system score vs manual score per field per candidate.
        Highlight fields with large differences (more than 2 points).
        If no manual scores provided, note that validation was skipped.
        """,
        expected_output="A validation sheet comparing system and manual scores.",
        agent=agents["validation_agent"],
    )
    tasks.append(validation_task)

    return tasks