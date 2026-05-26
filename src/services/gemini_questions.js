// Service for L1 Questions Generator microservice on Cloud Run
const CLOUD_RUN_URL = import.meta.env.VITE_QUESTIONS_SERVICE_URL || "http://localhost:8081";

export async function generateQuestions(resumeText, jobRole = "") {
    try {
        const response = await fetch(`${CLOUD_RUN_URL}/generate-questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resume_text: resumeText,
                job_role: jobRole
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Questions generation failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error in generateQuestions service:", error);
        throw error;
    }
}
