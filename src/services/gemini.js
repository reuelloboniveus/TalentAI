import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");

export async function analyzeMatch(jdText, resumeText, apiKey) {
    try {
        const keyToUse = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
        if (!keyToUse) {
            throw new Error("API Key is required");
        }
        const genAIInstance = new GoogleGenerativeAI(keyToUse);
        const model = genAIInstance.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert ATS (Applicant Tracking System) and technical recruiter.
      Analyze the following Job Description (JD) and Resume.
      
      Job Description:
      ${jdText}
      
      Resume:
      ${resumeText}
      
      Provide the output in the following JSON format ONLY:
      {
        "score": number (0-100),
        "matching_skills": ["skill1", "skill2", ...],
        "missing_skills": ["skill1", "skill2", ...],
        "insights": "A brief summary of the fit and recommendations."
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing match:", error);
        throw error;
    }
}
