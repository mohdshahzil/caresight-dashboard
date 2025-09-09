import { GoogleGenerativeAI } from "@google/generative-ai"
import { requireEnv } from "@/lib/utils"

export interface MaternalPrediction {
  prediction: string
  probabilities: Record<string, number>
  shap_values: Record<string, number>
}

export interface CardiovascularPrediction {
  patient_predictions: Array<{
    patient_id: string
    prediction: string
    probabilities: {
      "0": number
      "1": number
    }
    risk_level: string
    risk_score: number
    shap_values: Record<string, number>
  }>
  cohort_statistics: {
    average_risk_score: number
    high_risk_patients: number
    medium_risk_patients: number
    low_risk_patients: number
    total_patients: number
  }
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

export async function getCardiovascularRecommendations(
  input: {
    data: Array<Record<string, any>>
    predictions: CardiovascularPrediction
  }
): Promise<string> {
  const apiKey = requireEnv("GOOGLE_GENERATIVE_AI_API_KEY")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  // Focus on the highest risk patients for recommendations
  const highRiskPatients = input.predictions.patient_predictions.filter(p => p.risk_level === "HIGH")
  const mediumRiskPatients = input.predictions.patient_predictions.filter(p => p.risk_level === "MEDIUM")
  const cohortStats = input.predictions.cohort_statistics

  // Get top SHAP factors across all patients
  const allShapValues: Record<string, number[]> = {}
  input.predictions.patient_predictions.forEach(patient => {
    Object.entries(patient.shap_values).forEach(([feature, value]) => {
      if (!allShapValues[feature]) allShapValues[feature] = []
      allShapValues[feature].push(value)
    })
  })

  const avgShapValues = Object.entries(allShapValues).map(([feature, values]) => ({
    feature,
    avgValue: values.reduce((sum, val) => sum + val, 0) / values.length
  })).sort((a, b) => Math.abs(b.avgValue) - Math.abs(a.avgValue)).slice(0, 5)

  const prompt = `
You are a cardiovascular health specialist providing clinical decision support. Based on a cohort analysis of ${cohortStats.total_patients} patients with cardiovascular risk assessment results, provide actionable recommendations.

COHORT OVERVIEW:
- Total patients: ${cohortStats.total_patients}
- High risk: ${cohortStats.high_risk_patients} (${cohortStats.high_risk_percentage?.toFixed(1)}%)
- Medium risk: ${cohortStats.medium_risk_patients}
- Low risk: ${cohortStats.low_risk_patients}
- Average risk score: ${(cohortStats.average_risk_score * 100).toFixed(1)}%

TOP RISK FACTORS (SHAP Analysis):
${avgShapValues.map(f => `- ${f.feature.replace(/_/g, ' ')}: ${f.avgValue > 0 ? 'increases' : 'decreases'} risk (${f.avgValue.toFixed(4)})`).join('\n')}

HIGH RISK PATIENTS: ${highRiskPatients.length}
MEDIUM RISK PATIENTS: ${mediumRiskPatients.length}

Provide concise, evidence-based recommendations including:
- 4-6 key intervention strategies for the cohort
- Specific monitoring recommendations based on top SHAP factors
- Risk stratification guidance for follow-up care
- When to escalate care for high-risk patients

Keep to <200 words. Use bullet points. Focus on actionable clinical guidance. Use US medical standards.
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}

export async function getDiabetesRecommendations(
  input: {
    demographics: { name: string; age: number; gender: string }
    contextFactors: Record<string, { impact: string; value: number; multiplier: number }>
    selectedHorizon: string
    horizonRisk: {
      hyper_risk?: number
      hypo_risk?: number
      risk_level?: string
      risk_score?: number
      trend_high_risk?: number
      volatility_risk?: number
    }
    recentTrends?: string
  }
): Promise<string> {
  const apiKey = requireEnv("GOOGLE_GENERATIVE_AI_API_KEY")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const contextList = Object.entries(input.contextFactors || {})
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v.value} (${v.impact.replace('_', ' ')})`)
    .join(', ')

  const prompt = `
You are a diabetes care specialist providing personalized risk reduction advice. Given the following patient summary, provide:
- 3-5 actionable, patient-friendly recommendations to improve diabetes risk
- A brief explanation of the main risk drivers
- Tips for lifestyle or medication improvements
- When to seek medical attention if relevant

PATIENT PROFILE:
- Name: ${input.demographics.name}
- Age: ${input.demographics.age}
- Gender: ${input.demographics.gender}

CONTEXT FACTORS:
${contextList}

RISK FOR NEXT ${input.selectedHorizon.replace('d', ' days')}:
- Hyperglycemia risk: ${input.horizonRisk.hyper_risk !== undefined ? Math.round(input.horizonRisk.hyper_risk * 100) + '%' : 'N/A'}
- Hypoglycemia risk: ${input.horizonRisk.hypo_risk !== undefined ? Math.round(input.horizonRisk.hypo_risk * 100) + '%' : 'N/A'}
- Overall risk level: ${input.horizonRisk.risk_level || 'N/A'}
- Overall risk score: ${input.horizonRisk.risk_score !== undefined ? Math.round(input.horizonRisk.risk_score * 100) + '%' : 'N/A'}
- Glucose trend risk: ${input.horizonRisk.trend_high_risk !== undefined ? Math.round(input.horizonRisk.trend_high_risk * 100) + '%' : 'N/A'}
- Volatility risk: ${input.horizonRisk.volatility_risk !== undefined ? Math.round(input.horizonRisk.volatility_risk * 100) + '%' : 'N/A'}

${input.recentTrends ? `RECENT TRENDS: ${input.recentTrends}` : ''}

Keep your answer under 200 words. Use clear, encouraging language. Focus on what the patient can do next to improve their diabetes risk.
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}
