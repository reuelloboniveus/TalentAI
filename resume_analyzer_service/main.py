import os
import logging
import asyncio
import json
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from vertexai.preview.vision_models import ImageGenerationModel
import base64

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("resume_analyzer")

app = FastAPI(
    title="HireMeAI Resume Analyzer Service",
    description="Python microservice running on Cloud Run to analyze resumes using Vertex AI Gemini",
    version="1.0.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production to specify the exact origin
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
class ResumeInput(BaseModel):
    name: str = Field(..., description="Filename or identifier of the resume")
    text: str = Field(..., description="Extracted plain text of the resume")

class AnalyzeMatchRequest(BaseModel):
    jd_text: str = Field(..., description="Job Description text")
    resume_text: str = Field(..., description="Resume text")

class AnalyzeBulkMatchRequest(BaseModel):
    jd_text: str = Field(..., description="Job Description text")
    resumes: List[ResumeInput] = Field(..., description="List of resumes to analyze")

class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., description="The prompt to generate an image for")
    aspect_ratio: str = Field(default="1:1", description="Aspect ratio for generated image")

class GenerateImageResponse(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image data")


class AnalysisDetails(BaseModel):
    score: float = Field(..., description="Score from 0 to 10 rating the match quality")
    candidate_name: str = Field(..., description="Name of the candidate extracted from resume")
    job_role: str = Field(..., description="Target job title or role from JD")
    matching_skills: List[str] = Field(..., description="Skills from the resume that match the JD")
    missing_skills: List[str] = Field(..., description="Skills in the JD that are missing from the resume")
    profile_fit_analysis: str = Field(..., description="Detailed paragraph analyzing candidate's overall fit")
    strong_areas: List[str] = Field(..., description="Areas of strength / highly matching sections")
    insights: str = Field(..., description="Summary of fit and strategic recommendation")

class BulkAnalysisResponse(AnalysisDetails):
    resumeName: str = Field(..., description="Original filename of the resume")
    id: str = Field(..., description="Unique generated ID for the result")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "vertex_initialized": is_vertex_initialized,
        "model_configured": MODEL_NAME,
        "project_id": PROJECT_ID,
        "region": LOCATION
    }

def run_gemini_analysis(jd_text: str, resume_text: str) -> Dict[str, Any]:
    """
    Synchronous function that interacts with Vertex AI Gemini.
    Runs inside a threadpool via asyncio.to_thread to prevent blocking the FastAPI event loop.
    """
    global is_vertex_initialized
    if not is_vertex_initialized:
        try:
            # Fallback auto-init using Application Default Credentials
            vertexai.init(location=LOCATION)
            is_vertex_initialized = True
            logger.info("Vertex AI successfully auto-initialized at runtime.")
        except Exception as e:
            logger.error(f"Failed to auto-initialize Vertex AI at runtime: {str(e)}")
            raise RuntimeError(
                "Vertex AI is not initialized. Please ensure your GCP credentials are set correctly "
                "or that the GOOGLE_CLOUD_PROJECT environment variable is set."
            ) from e

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and technical recruiter.
Analyze the following Job Description (JD) and Resume.

Job Description:
{jd_text}

Resume:
{resume_text}

Provide the output in the following JSON format ONLY:
{{
  "score": number (0-10),
  "candidate_name": "Full Name of the candidate extracted from the resume",
  "job_role": "The target job title or role from the JD",
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "profile_fit_analysis": "A detailed paragraph explaining why this candidate is or isn't a good fit, highlighting specific experience matching the JD.",
  "strong_areas": ["area1", "area2", ...],
  "insights": "A brief summary of the fit and recommendations."
}}
"""
    try:
        model = GenerativeModel(MODEL_NAME)
        # Strict JSON output enforce by Gemini Vertex AI
        generation_config = GenerationConfig(
            response_mime_type="application/json"
        )
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        response_text = response.text.strip()
        
        # Strip markdown syntax if returned
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

@app.post("/analyze", response_model=AnalysisDetails)
async def analyze_match(request: AnalyzeMatchRequest):
    """
    Analyzes a single Job Description and Resume match.
    """
    logger.info("Received request for single resume analysis")
    result = await asyncio.to_thread(run_gemini_analysis, request.jd_text, request.resume_text)
    return result

async def analyze_single_bulk_item(jd_text: str, resume: ResumeInput) -> Dict[str, Any]:
    """
    Helper to run a single analysis in parallel and format response.
    """
    try:
        result = await asyncio.to_thread(run_gemini_analysis, jd_text, resume.text)
        return {
            **result,
            "resumeName": resume.name,
            "id": str(uuid.uuid4())[:9]
        }
    except Exception as e:
        logger.error(f"Error bulk analyzing {resume.name}: {str(e)}")
        return {
            "resumeName": resume.name,
            "id": str(uuid.uuid4())[:9],
            "score": 0.0,
            "candidate_name": "Unknown (Failed)",
            "job_role": "Failed to analyze",
            "matching_skills": [],
            "missing_skills": [],
            "profile_fit_analysis": f"Analysis failed: {str(e)}",
            "strong_areas": [],
            "insights": "Could not analyze this resume."
        }

@app.post("/analyze-bulk", response_model=List[BulkAnalysisResponse])
async def analyze_bulk_match(request: AnalyzeBulkMatchRequest):
    """
    Analyzes multiple resumes concurrently against a single Job Description.
    """
    logger.info(f"Received request for bulk resume analysis of {len(request.resumes)} resumes")
    
    # Concurrent async tasks
    tasks = [
        analyze_single_bulk_item(request.jd_text, resume)
        for resume in request.resumes
    ]
    
    results = await asyncio.gather(*tasks)
    return results

def run_image_generation(prompt: str, aspect_ratio: str) -> str:
    """Synchronous function to generate image using Vertex AI Vision models"""
    global is_vertex_initialized
    if not is_vertex_initialized:
        try:
            vertexai.init(location=LOCATION)
            is_vertex_initialized = True
        except Exception as e:
            raise RuntimeError("Vertex AI is not initialized.") from e

    model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
    images = model.generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio=aspect_ratio
    )
    
    if not images or not hasattr(images[0], '_image_bytes'):
        raise ValueError("Image generation failed to return valid image bytes")
        
    encoded = base64.b64encode(images[0]._image_bytes).decode("utf-8")
    return f"data:image/png;base64,{encoded}"

@app.post("/generate-image", response_model=GenerateImageResponse)
async def generate_image(request: GenerateImageRequest):
    """
    Generate an image based on a prompt.
    """
    logger.info(f"Received request for image generation with prompt length: {len(request.prompt)}")
    try:
        base64_image = await asyncio.to_thread(run_image_generation, request.prompt, request.aspect_ratio)
        return GenerateImageResponse(image_base64=base64_image)
    except Exception as e:
        logger.error(f"Image generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
