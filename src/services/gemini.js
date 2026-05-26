const CLOUD_RUN_URL = import.meta.env.VITE_RESUME_SERVICE_URL || "https://resume-analyzer-service-396523767033.asia-south1.run.app";

export async function analyzeMatch(jdText, resumeText) {
    try {
        const response = await fetch(`${CLOUD_RUN_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jd_text: jdText,
                resume_text: resumeText
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Analysis failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error analyzing match:", error);
        throw error;
    }
}

export async function analyzeBulkMatch(jdText, resumes) {
    try {
        const response = await fetch(`${CLOUD_RUN_URL}/analyze-bulk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jd_text: jdText,
                resumes: resumes
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Bulk analysis failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error in bulk analysis:", error);
        throw error;
    }
}
