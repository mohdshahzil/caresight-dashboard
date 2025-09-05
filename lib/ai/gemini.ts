import { GoogleGenerativeAI } from "@google/generative-ai"
import { requireEnv } from "@/lib/utils"

export interface MaternalPrediction {
  prediction: string
  probabilities: Record<string, number>
  shap_values: Record<string, number>
}

export async function getMaternalRecommendations(
  input: {
    data: Record<string, number>
    prediction: MaternalPrediction
  }
): Promise<string> {
  const apiKey = requireEnv("GOOGLE_GENERATIVE_AI_API_KEY")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
You are a clinical decision support assistant. Given maternal vital parameters, a model's risk classification, probabilities, and SHAP explanations, write concise, patient-friendly and clinician-actionable recommendations. Include:
- 3-5 personalized recommendations
- Monitoring suggestions tied to the top SHAP factors
- When to escalate or seek immediate care if relevant
Keep to <180 words. Use bullet points. Avoid duplicating data. Use US units and general safety guidance only.

Patient parameters: ${JSON.stringify(input.data)}
Risk summary: ${JSON.stringify(input.prediction.probabilities)}; class=${input.prediction.prediction}
Top SHAP factors: ${JSON.stringify(input.prediction.shap_values)}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}


