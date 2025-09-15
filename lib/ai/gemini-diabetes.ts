import { GoogleGenerativeAI } from "@google/generative-ai"
import { DiabetesAnalysis } from "@/lib/diabetes-analysis"

/**
 * Generates AI insights and intervention suggestions for a diabetes report using Gemini.
 * @param analysis DiabetesAnalysis instance or raw API response
 * @param options Optional: { selectedHorizon: string, recentTrends?: string }
 * @returns Gemini-generated insights/interventions as markdown string (with emojis)
 */
export async function getDiabetesAIInsights(
  analysis: DiabetesAnalysis | any,
  options?: { selectedHorizon?: string; recentTrends?: string }
): Promise<string> {
  const apiKey = "AIzaSyB75CXjVkrGpvEkULCpfN6_Qo7Zlt7sE40"
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

  // Accept either DiabetesAnalysis or raw API response
  const data = analysis instanceof DiabetesAnalysis ? analysis : new DiabetesAnalysis(analysis)

  // Extract demographics (fallback to predictionMetadata if needed)
  const demographics = {
    name: data.predictionMetadata?.name || data.raw?.prediction_metadata?.name || "Patient",
    age: data.predictionMetadata?.age || data.raw?.prediction_metadata?.age || "N/A",
    gender: data.predictionMetadata?.gender || data.raw?.prediction_metadata?.gender || "N/A",
  }

  // Use selected horizon or default to 90d
  const selectedHorizon = options?.selectedHorizon || "90d"
  const horizonKey = `horizon_${selectedHorizon}`
  const horizonRisk = data.horizonRisks?.[horizonKey] || {}

  // Context factors
  const contextFactors = data.contextFactors || {}

  // Calculate averages and summary stats
  const forecast = data.forecastData || []
  const avgGlucose = forecast.length ? (
    forecast.reduce((sum, d) => sum + (d.p50 ?? 0), 0) / forecast.length
  ) : undefined
  const volatility = horizonRisk.volatility_risk !== undefined ? horizonRisk.volatility_risk : data.baseRiskComponents?.volatility_risk
  const hyperRisk = horizonRisk.hyper_risk !== undefined ? horizonRisk.hyper_risk : data.baseRiskComponents?.hyper_risk
  const hypoRisk = horizonRisk.hypo_risk !== undefined ? horizonRisk.hypo_risk : data.baseRiskComponents?.hypo_risk

  // Compose the summary object for Gemini
  const summary = {
    demographics,
    selectedHorizon,
    avgGlucose: avgGlucose ? Math.round(avgGlucose) : undefined,
    volatility: volatility !== undefined ? Math.round(volatility * 100) + "%" : undefined,
    hyperRisk: hyperRisk !== undefined ? Math.round(hyperRisk * 100) + "%" : undefined,
    hypoRisk: hypoRisk !== undefined ? Math.round(hypoRisk * 100) + "%" : undefined,
    overallRiskLevel: data.overallRiskLevel,
    overallRiskScore: data.overallRiskScore !== undefined ? Math.round(data.overallRiskScore * 100) + "%" : undefined,
    contextFactors: Object.entries(contextFactors).map(([k, v]: any) => `${k.replace(/_/g, ' ')}: ${v.value} (${v.impact.replace('_', ' ')})`).join(', '),
    recentTrends: options?.recentTrends || undefined,
  }

  // Compose the prompt
  const prompt = `
You are a diabetes care specialist. Given the following patient summary, generate a detailed, non-generic report in **markdown** with:
- A friendly greeting and a short summary of the patient's diabetes risk using the provided data (use emojis for clarity)
- 2-3 personalized, plain-language insights about the patient's diabetes risk and what is driving it (reference the actual numbers)
- 3-5 actionable, patient-friendly recommendations to improve diabetes risk (use checklists and emojis)
- 2-3 clinical intervention suggestions for a healthcare provider (label this section clearly, use medical emojis)
- When to seek medical attention if relevant (with a warning emoji)

**Patient Data Summary:**
${JSON.stringify(summary, null, 2)}

**Instructions:**
- Use markdown formatting (headings, bold, lists, etc.)
- Use relevant emojis for each section (e.g., 🩸, 💡, ✅, ⚠️, 🍽️, 🏃‍♂️, 💊, 👩‍⚕️, etc.)
- Reference the provided numbers and factors directly in your explanations
- Do NOT repeat the raw data as-is; interpret and explain it
- Make the report feel personalized, not generic
- Keep the total length under 350 words
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}
