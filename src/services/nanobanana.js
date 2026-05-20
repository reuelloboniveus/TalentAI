const CLOUD_RUN_URL = "https://resume-analyzer-service-396523767033.asia-south1.run.app";

/**
 * Service to handle image generation using the backend microservice /generate-image endpoint.
 * 
 * @param {string} prompt - The text prompt for image generation.
 * @returns {Promise<string>} - The base64 data URL of the generated image.
 */
export async function generateJobPostImage(prompt) {
    try {
        const response = await fetch(`${CLOUD_RUN_URL}/generate-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: "1:1"
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Image generation failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.image_base64) {
            throw new Error("No image data returned from API.");
        }

        return data.image_base64;
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}

/**
 * Alias of generateJobPostImage to maintain backward compatibility with components using the REST variant.
 */
export async function generateJobPostImageRest(prompt) {
    return generateJobPostImage(prompt);
}
