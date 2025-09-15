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
    height_cm: data.predictionMetadata?.height || data.raw?.prediction_metadata?.height || undefined,
    weight_kg: data.predictionMetadata?.weight || data.raw?.prediction_metadata?.weight || undefined,
  }

  // Compute BMI if possible
  let bmi: number | undefined
  if (typeof demographics.weight_kg === "number" && typeof demographics.height_cm === "number" && demographics.height_cm > 0) {
    const heightMeters = demographics.height_cm / 100
    bmi = +(demographics.weight_kg / (heightMeters * heightMeters)).toFixed(1)
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
    bmi,
    selectedHorizon,
    avgGlucose: avgGlucose ? Math.round(avgGlucose) : undefined,
    volatility: volatility !== undefined ? Math.round(volatility * 100) + "%" : undefined,
    hyperRisk: hyperRisk !== undefined ? Math.round(hyperRisk * 100) + "%" : undefined,
    hypoRisk: hypoRisk !== undefined ? Math.round(hypoRisk * 100) + "%" : undefined,
    overallRiskLevel: data.overallRiskLevel,
    overallRiskScore: data.overallRiskScore !== undefined ? Math.round(data.overallRiskScore * 100) + "%" : undefined,
    contextFactors: Object.entries(contextFactors).map(([k, v]: any) => `${k.replace(/_/g, ' ')}: ${v.value} (${v.impact.replace('_', ' ')})`).join(', '),
    recentTrends: options?.recentTrends || undefined,
    lifestyleDefaults: {
      smoking_status: "yes",
      alcohol_use: "yes",
    },
  }

  // Compose the prompt
  const prompt = `
You are a diabetes care specialist. Create a friendly, plain‑language report in **markdown** that an average person can easily understand. Avoid technical jargon; explain terms simply.

Provide:
- A warm greeting and a short, clear summary of the person's current diabetes risk using the actual numbers (use a few helpful emojis).
- 3–5 personalized insights in simple words explaining what's driving risk (e.g., average glucose, highs/lows, volatility). Make these a bit longer than one sentence each but still concise.
- 5–7 day‑to‑day actions the person can do starting today (sleep, meals, activity, hydration, meds adherence, stress, routine). Use checkboxes and plain language.
- A lifestyle section that always mentions smoking and alcohol, even if not in the data. Give practical guidance to cut down/quit smoking and to limit alcohol with specific weekly limits.
- A brief note for the clinician with 2–3 intervention ideas (clearly labeled for clinicians).
- Clear guidance on when to seek medical help, with concrete examples.

Use the following patient summary. If height and weight are present, calculate BMI; if BMI is high or low, explain what that means in simple terms and how it relates to glucose.

Patient Summary:
${JSON.stringify(summary, null, 2)}

Writing rules:
- Keep language friendly and encouraging. Prefer everyday words over medical terms.
- Reference the real numbers (e.g., average glucose, risks) but explain them simply.
- Always include smoking 🚭 and alcohol 🍷 guidance even if lifestyle data is "unknown".
- Use short sections with headings, bold highlights, and lists.
- Aim for ~400–550 words for richer insights.
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}
