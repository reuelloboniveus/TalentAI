# 🚀 HireMeAI Resume Analyzer Service

A premium, high-performance Python-based microservice powered by **FastAPI** and **Google Cloud Vertex AI** (Gemini). It replaces and offloads client-side API requests into a secure, scalable, and concurrent backend architecture designed to run on **Google Cloud Run**.

---

## ✨ Features

- **Vertex AI Gemini Integration**: Harnesses the state-of-the-art `gemini-1.5-flash` model natively on Google Cloud.
- **Asynchronous Bulk Parsing**: Concurrently processes multiple resumes against a single Job Description utilizing Python `asyncio` and thread pools for blazingly fast parallel performance.
- **Robust API Design**: Built with **FastAPI** for low latency, native Pydantic schemas, and auto-generated Swagger documentation (`/docs`).
- **Production-Ready Dockerization**: Comes with a highly optimized, light-weight `Dockerfile` configured for dynamic port binding and sub-second startup times on Google Cloud Run.
- **Dual-Mode Test Runner**: Includes a script `test_service.py` that can query the local web service or test the GCP/Vertex AI SDK connectivity directly.

---

## 🛠️ Tech Stack

- **Core**: Python 3.11
- **API Framework**: FastAPI & Uvicorn
- **AI Backend**: Google Cloud Vertex AI SDK (`google-cloud-aiplatform`)
- **Data Validation**: Pydantic v2
- **Deployment**: Google Cloud Run (Containerized via Docker)

---

## 📦 Local Setup & Installation

### 1. Prerequisites
Ensure you have Python 3.10+ installed and the Google Cloud SDK (`gcloud` CLI) configured.

### 2. Clone and Setup Virtual Environment
Navigate to the microservice directory and create a virtual environment:

```bash
cd resume_analyzer_service
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all required production and testing dependencies:

```bash
pip install -r requirements.txt
pip install requests  # required only for the test runner script
```

### 4. Authenticate Google Cloud
To connect to Vertex AI locally, you must authenticate your local shell session with Google Cloud using Application Default Credentials (ADC):

```bash
# Log in to Google Cloud
gcloud auth login

# Set up your Application Default Credentials
gcloud auth application-default login

# Configure your default GCP project ID
gcloud config set project YOUR_GCP_PROJECT_ID
```

---

## 🚀 Running the Service Locally

Start the development server with live reloading enabled:

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

- **API Base URL**: `http://localhost:8080`
- **Interactive Swagger Docs**: `http://localhost:8080/docs`
- **Health Check Endpoint**: `http://localhost:8080/health`

### Environment Configurations
You can override standard settings using environment variables:
- `PROJECT_ID`: Your GCP project ID (autodetected if omitted).
- `LOCATION`: Vertex AI service region (defaults to `us-central1`).
- `MODEL_NAME`: Gemini model identifier (defaults to `gemini-1.5-flash`).

Example with custom settings:
```bash
MODEL_NAME=gemini-2.5 LOCATION=us-east4 uvicorn main:app --port 8080 --reload
```

---
x
## 🧪 Verification & Testing

The microservice includes `test_service.py` containing sample inputs to easily verify both the API endpoints and Google Cloud credentials.

### Mode A: Test the Local API Server
Start the local server in one terminal:
```bash
uvicorn main:app --port 8080
```
In another terminal, execute the test runner:
```bash
python test_service.py
```
This sends POST requests to `/analyze` and `/analyze-bulk` and outputs the structured matching JSON data returned by Vertex AI.

### Mode B: Test Vertex AI Directly (Bypass Server)
If you want to isolate credential or project access issues, test the SDK connection directly without booting up the server:
```bash
# Make sure to set your GCP Project ID environment variable
export GOOGLE_CLOUD_PROJECT="your-gcp-project-id"

# Run direct execution test
python test_service.py --direct
```

---

## 🐳 Future Production Deployment to Google Cloud Run

To deploy this service to Google Cloud Run, follow these steps. 

### Step 1: Build the Container Image
Build the container image using Google Cloud Builds (which pushes it to Google Artifact Registry):

```bash
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/resume-analyzer-service
```

### Step 2: Deploy to Cloud Run
Deploy the container with the required environment variables. It will be fully serverless, scaling down to 0 instances when not in use:

```bash
gcloud run deploy resume-analyzer-service \
  --image gcr.io/YOUR_GCP_PROJECT_ID/resume-analyzer-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="PROJECT_ID=YOUR_GCP_PROJECT_ID,LOCATION=us-central1,MODEL_NAME=gemini-1.5-flash"
```

> [!IMPORTANT]
> Ensure the **Cloud Run Service Account** (usually `<project-number>-compute@developer.gserviceaccount.com`) has the **Vertex AI User** role (`roles/aiplatform.user`) enabled in your IAM console, allowing the container to authenticate securely with the Vertex AI service without storing any API keys!

---

## 🔗 Connecting the Frontend

Once the microservice is deployed on Cloud Run (e.g. at `https://resume-analyzer-service-xxxxxx-uc.a.run.app`), you can seamlessly swap out the client-side API calls inside the frontend React application.

Simply update `src/services/gemini.js` to dispatch a fetch to the Cloud Run service instead of initializing the client-side generative model:

```javascript
// Example modification for future frontend integration:
export async function analyzeMatch(jdText, resumeText) {
  const response = await fetch("https://resume-analyzer-service-xxxxxx-uc.a.run.app/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd_text: jdText, resume_text: resumeText })
  });
  return await response.json();
}
```
