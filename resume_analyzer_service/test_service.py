import os
import sys
import json
import argparse

# Mock data for testing
MOCK_JD = """
We are looking for a Senior React Developer with 5+ years of experience in front-end web development.
Key Skills:
- React.js, JavaScript (ES6+), HTML5, CSS3
- State management: Redux, Context API
- Cloud platforms: Google Cloud, Firebase
- Testing: Jest, React Testing Library
- Strong communication and collaboration skills
"""

MOCK_RESUME = """
Jane Doe
Senior Frontend Engineer | New York, NY | jane.doe@example.com

SUMMARY
Highly motivated Senior Frontend Engineer with 6 years of experience building modern, responsive web applications using React.js and Google Cloud/Firebase.

SKILLS
- Frontend: React, Redux, Context API, JavaScript, HTML5, CSS3
- Cloud & Backend: Firebase (Auth, Firestore, Hosting), Google Cloud Platform
- Testing: Jest, Cypress, React Testing Library
- Other: Git, Webpack, Agile methodologies

EXPERIENCE
Senior React Developer | Tech Corp | 2021 - Present
- Led a team of 3 developers to migrate a legacy web application to React and Redux, improving load times by 40%.
- Integrated Firebase auth and Firestore databases for real-time document sync.
- Wrote unit and integration tests using Jest and RTL to maintain 90%+ coverage.
"""

def test_api(url_base: str = "http://localhost:8080"):
    """
    Test the FastAPI server endpoints.
    """
    try:
        import requests
    except ImportError:
        print("Error: 'requests' package is required for local API testing. Run 'pip install requests' first.")
        sys.exit(1)

    url = f"{url_base.rstrip('/')}/analyze"
    print(f"Sending single analysis request to server: {url}...")
    payload = {
        "jd_text": MOCK_JD.strip(),
        "resume_text": MOCK_RESUME.strip()
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            print("\n[SUCCESS] Single analysis returned 200 OK:\n")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n[SERVER ERROR] ({response.status_code}): {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print(f"\n[CONNECTION ERROR] Could not connect to the server at {url_base}.")
        print("Please ensure the FastAPI server is running first.")
        return

    # Test Bulk Endpoint
    bulk_url = f"{url_base.rstrip('/')}/analyze-bulk"
    print(f"\nSending bulk analysis request to server: {bulk_url}...")
    bulk_payload = {
        "jd_text": MOCK_JD.strip(),
        "resumes": [
            {"name": "jane_doe_resume.pdf", "text": MOCK_RESUME.strip()},
            {"name": "empty_resume.txt", "text": "This is a completely irrelevant resume for a truck driver with no tech skills."}
        ]
    }
    
    try:
        response = requests.post(bulk_url, json=bulk_payload, timeout=30)
        if response.status_code == 200:
            print("\n[SUCCESS] Bulk analysis returned 200 OK:\n")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n[SERVER ERROR] ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"\n[ERROR] Bulk analysis call failed: {e}")

def test_direct():
    """
    Test direct Vertex AI SDK invocation bypassing the FastAPI server.
    Useful to isolate and diagnose authentication/GCP issues.
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
        print("Please verify that your Google Cloud SDK environment is set up and active.")
        print("Run `gcloud auth application-default login` to set up credentials locally.")
        sys.exit(1)

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and technical recruiter.
Analyze the following Job Description (JD) and Resume.

Job Description:
{MOCK_JD.strip()}

Resume:
{MOCK_RESUME.strip()}

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
        print("\nTroubleshooting tips:")
        print("1. Ensure the Vertex AI API (aiplatform.googleapis.com) is enabled in your Google Cloud Project.")
        print("2. Ensure your active identity has 'roles/aiplatform.user' permissions in the project.")
        print("3. Run `gcloud auth application-default login` in your terminal.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test runner for Resume Analyzer microservice")
    parser.add_argument("--direct", action="store_true", help="Test Vertex AI API directly bypassing FastAPI server")
    parser.add_argument("--url", type=str, default="http://localhost:8080", help="FastAPI server base URL")
    args = parser.parse_args()

    if args.direct:
        test_direct()
    else:
        test_api(args.url)
