import os
import logging
import asyncio
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("questions_generator")

app = FastAPI(
    title="TalentAI Q&A Generator Service",
    description="Python microservice running on Cloud Run to generate candidate-specific L1 interview questions using Vertex AI Gemini",
    version="1.0.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production to specify exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vertex AI parameters from environment
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("PROJECT_ID")
LOCATION = os.environ.get("GOOGLE_CLOUD_REGION") or os.environ.get("LOCATION", "us-central1")
MODEL_NAME = os.environ.get("MODEL_NAME", "gemini-2.5-flash")

is_vertex_initialized = False
try:
    if PROJECT_ID:
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        is_vertex_initialized = True
        logger.info(f"Vertex AI successfully initialized with Project: {PROJECT_ID}, Location: {LOCATION}")
    else:
        logger.warning(
            "PROJECT_ID / GOOGLE_CLOUD_PROJECT environment variable not set. "
            "Vertex AI is not initialized yet. It will attempt to use Application Default Credentials (ADC) at runtime."
        )
except Exception as e:
    logger.error(f"Failed to initialize Vertex AI: {str(e)}")


# Pydantic Schemas for Requests/Responses
class GenerateQuestionsRequest(BaseModel):
    resume_text: str = Field(..., description="The plain text extracted from candidate's resume")
    job_role: Optional[str] = Field(default="", description="The target job title or role (optional)")

class QuestionItem(BaseModel):
    id: int = Field(..., description="1-indexed unique identifier of the question")
    question: str = Field(..., description="The interview question tailored to the candidate's resume")
    expected_answer: str = Field(..., description="A detailed ideal answer describing what key competencies or keywords to listen for")
    rationale: str = Field(..., description="The reason why this question is being asked, tied directly to their resume experience/projects")
    category: str = Field(..., description="The question category (e.g. Technical, Behavioral, Project-Specific, Experience-Based)")
    difficulty: str = Field(default="L1 Basic", description="Difficulty level, set to L1 Basic but professional")

class QuestionsResponse(BaseModel):
    candidate_name: str = Field(..., description="Extracted candidate name from the resume")
    questions: List[QuestionItem] = Field(..., description="List of exactly 5 interview questions and answers")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "vertex_initialized": is_vertex_initialized,
        "model_configured": MODEL_NAME,
        "project_id": PROJECT_ID,
        "region": LOCATION
    }


def run_gemini_questions_generation(resume_text: str, job_role: str = "") -> Dict[str, Any]:
    """
    Synchronous function that interacts with Vertex AI Gemini to generate Q&As.
    Runs inside a threadpool via asyncio.to_thread to prevent blocking the FastAPI event loop.
    """
    global is_vertex_initialized
    if not is_vertex_initialized:
        try:
            vertexai.init(location=LOCATION)
            is_vertex_initialized = True
            logger.info("Vertex AI successfully auto-initialized at runtime.")
        except Exception as e:
            logger.error(f"Failed to auto-initialize Vertex AI at runtime: {str(e)}")
            raise RuntimeError("Vertex AI is not initialized.") from e

    job_role_clause = f"for the target job role of '{job_role}'" if job_role else "for general screening"

    prompt = f"""
You are an expert Talent Acquisition Coordinator conducting Level 1 (L1) initial candidate screening.
Your goal is to screen the candidate based on their specific resume experience.

Review the following candidate Resume details:
---
{resume_text}
---

Generate exactly 5 screening questions with professional answers {job_role_clause}.

Rules for question generation:
1. **Never make questions too simple or generic** (e.g. "Tell me about your job", "What is Python?"). Instead, formulate professional, targeted screening questions that test the candidate's actual claims on their resume (e.g. questioning their role in a specific project, asking them to explain a specific architecture they mentioned, or testing their understanding of a specific tool they listed).
2. For each question, provide a detailed **expected answer** that a recruiter can use to evaluate the candidate's response. It should explain key technical/professional keywords or methodologies the candidate should ideally mention in their answer.
3. For each question, provide a **rationale** explaining why this question is crucial to ask this candidate based on their specific resume background.
4. Try to make the difficulty "L1 Basic" but with high professional standard, covering a mixture of Technical skill verification, Project-Specific details, and Behavioral/Experience questions.
5. Accurately extract the candidate's name from the resume to populate "candidate_name". If no clear name is found, use "Candidate".

Provide the output in the following JSON format ONLY:
{{
  "candidate_name": "Candidate Full Name",
  "questions": [
    {{
      "id": 1,
      "question": "Question text...",
      "expected_answer": "Detailed ideal answer highlighting keywords and terms the recruiter should listen for...",
      "rationale": "Rationale explaining how this relates specifically to their resume...",
      "category": "Technical | Project-Specific | Experience-Based | Behavioral",
      "difficulty": "L1 Basic"
    }},
    ...
  ]
}}
"""
    try:
        model = GenerativeModel(MODEL_NAME)
        # Strict JSON output enforce
        generation_config = GenerationConfig(
            response_mime_type="application/json"
        )
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        response_text = response.text.strip()
        
        # Clean markdown codeblocks if they are somehow returned
        if response_text.startswith("```"):
            lines = response_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            response_text = "\n".join(lines).strip()
            
        data = json.loads(response_text)
        return data
    except json.JSONDecodeError as je:
        logger.error(f"Failed to parse model output as JSON. Raw output: {response_text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini model returned invalid JSON format. Raw output: {response_text}"
        ) from je
    except Exception as e:
        logger.error(f"Error calling Vertex AI Gemini: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vertex AI Gemini generation failed: {str(e)}"
        ) from e


@app.post("/generate-questions", response_model=QuestionsResponse)
async def generate_questions(request: GenerateQuestionsRequest):
    """
    Endpoint that parses a resume and target job role, returning exactly 5 L1 screening questions.
    """
    logger.info("Received request for generating questions based on resume")
    result = await asyncio.to_thread(run_gemini_questions_generation, request.resume_text, request.job_role)
    return result


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8081))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
