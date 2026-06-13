import fitz
from crewai.tools import tool

@tool("score_resume")
def read_pdf(file_path: str) -> str:
    """Reads a PDF file and returns its text content for scoring."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip() if text.strip() else "No text could be extracted from this PDF."
    except Exception as e:
        return f"Error reading PDF: {str(e)}"