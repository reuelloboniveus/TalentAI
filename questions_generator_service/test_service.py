import os
import sys
import json
import argparse

# Mock Resume for Testing
MOCK_RESUME = """
Johnathan Smith
Senior Software Engineer | Bangalore, India | johnathan.smith@email.com

SUMMARY
Innovative Senior Software Engineer with 5+ years of experience specialized in building cloud-native Python applications, microservices, and distributed systems using FastAPI, Docker, and Google Cloud Platform (Cloud Run, Pub/Sub, Firestore).

SKILLS
- Programming: Python, Go, SQL, Bash
- Frameworks: FastAPI, Flask, Django, gRPC
- Cloud Platforms: Google Cloud (GCP), AWS
- DevOps & Tools: Docker, Kubernetes, Terraform, Git, CI/CD

EXPERIENCE
Senior Software Engineer | Cloud Solutions Pvt Ltd | 2022 - Present
- Designed and built a high-throughput event processing system using Python FastAPI and GCP Pub/Sub, scaling to 10M events per day and reducing latency by 30%.
- Orchestrated container deployment on Google Cloud Run using CI/CD pipelines configured with GitHub Actions.
- Mentored 4 junior engineers on software craftsmanship and REST API design best practices.

Software Engineer | DevCorp | 2020 - 2022
- Maintained legacy Python Django applications and successfully migrated 3 core services to modular FastAPI microservices.
- Utilized Docker containers to unify local development, staging, and production environments.
"""

def test_api(url_base: str = "http://localhost:8081"):
    """
    Test the FastAPI server endpoints.
    """
    try:
        import requests
    except ImportError:
        print("Error: 'requests' package is required for local API testing. Run 'pip install requests' first.")
        sys.exit(1)

    url = f"{url_base.rstrip('/')}/generate-questions"
    print(f"Sending questions generation request to server: {url}...")
    payload = {
        "resume_text": MOCK_RESUME.strip(),
        "job_role": "Python Backend Engineer"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            print("\n[SUCCESS] Questions generation returned 200 OK:\n")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n[SERVER ERROR] ({response.status_code}): {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print(f"\n[CONNECTION ERROR] Could not connect to the server at {url_base}.")
        print("Please ensure your FastAPI questions generator server is running first on port 8081.")
        return

def test_direct():
    """
    Test direct Vertex AI SDK invocation bypassing the FastAPI server.
    """
    print("Testing Vertex AI integration directly (bypassing FastAPI)...")
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel, GenerationConfig
    except ImportError:
        print("Error: 'google-cloud-aiplatform' package is not installed. Run 'pip install google-cloud-aiplatform' first.")
        sys.exit(1)

    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("PROJECT_ID")
    location = os.environ.get("LOCATION", "us-central1")
    model_name = os.environ.get("MODEL_NAME", "gemini-2.5-flash")

    if not project_id:
        print("\n[WARNING] GOOGLE_CLOUD_PROJECT or PROJECT_ID environment variables are not set.")
        print("Vertex AI will attempt to discover your project credentials via Application Default Credentials (ADC).")
    
    try:
        if project_id:
            vertexai.init(project=project_id, location=location)
        else:
            vertexai.init(location=location)
        print(f"[INFO] Vertex AI successfully initialized.")
        print(f"  - Project: {project_id or 'Auto-discovered (ADC)'}")
        print(f"  - Location: {location}")
        print(f"  - Model: {model_name}")
    except Exception as e:
        print(f"\n[CRITICAL ERROR] Failed to initialize Vertex AI: {e}")
        sys.exit(1)

    prompt = f"""
You are an expert Talent Acquisition Coordinator conducting Level 1 (L1) initial candidate screening.
Your goal is to screen the candidate based on their specific resume experience.

Review the following candidate Resume details:
---
{MOCK_RESUME.strip()}
---

Generate exactly 5 screening questions with professional answers for the target job role of 'Python Backend Engineer'.

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
        model = GenerativeModel(model_name)
        generation_config = GenerationConfig(response_mime_type="application/json")
        print("\nSending direct API generation call to Vertex AI...")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        print("\n[SUCCESS] Received direct response from Vertex AI:\n")
        print(response.text)
    except Exception as e:
        print(f"\n[ERROR] Direct Vertex AI call failed: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test runner for Questions Generator microservice")
    parser.add_argument("--direct", action="store_true", help="Test Vertex AI API directly bypassing FastAPI server")
    parser.add_argument("--url", type=str, default="http://localhost:8081", help="FastAPI server base URL")
    args = parser.parse_args()

    if args.direct:
        test_direct()
    else:
        test_api(args.url)
