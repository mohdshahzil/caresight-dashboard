"use server"

interface CardiovascularData {
  patient_id: string
  age: number
  gender: string
  diabetes: string
  hypertension: string
  systolic_bp: number
  diastolic_bp: number
  heart_rate: number
  cholesterol: number
  glucose: number
  medication_adherence: number
  exercise_minutes: number
  diet_score: number
  stress_level: number
  weight_kg: number
  oxygen_saturation: number
  temperature_c: number
  sleep_hours: number
}

interface CardiovascularPredictionResponse {
  cohort_statistics: {
    average_risk_score: number
    high_risk_patients: number
    high_risk_percentage: number
    low_risk_patients: number
    medium_risk_patients: number
    total_patients: number
  }
  patient_predictions: Array<{
    model_info: {
      features_used: number
      model_type: string
      prediction_horizon: string
    }
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
}

export async function processCardiovascularCSV(formData: FormData): Promise<{
  success: boolean
  data?: CardiovascularData[]
  predictions?: CardiovascularPredictionResponse
  recommendations?: string
  error?: string
}> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    if (!file.name.endsWith(".csv")) {
      return { success: false, error: "Please upload a CSV file" }
    }

    // Read CSV content
    const csvText = await file.text()
    const lines = csvText.trim().split("\n").filter((l) => l.trim().length > 0)

    if (lines.length < 2) {
      return { success: false, error: "CSV file must contain headers and at least one data row" }
    }

    // Parse CSV headers
    const headers = lines[0].split(",").map((h) => h.trim())

    // Build patient data
    const rows = lines.slice(1).map((line) => line.split(",").map((d) => d.trim()))

    const patients: CardiovascularData[] = rows.map((cols) => {
      const row: any = {}
      headers.forEach((header, colIdx) => {
        row[header] = cols[colIdx]
      })

      return {
        patient_id: String(row.patient_id || `P${Math.floor(Math.random() * 1000)}`),
        age: Number.parseFloat(row.age) || 0,
        gender: String(row.gender || "Unknown"),
        diabetes: String(row.diabetes || "No"),
        hypertension: String(row.hypertension || "No"),
        systolic_bp: Number.parseFloat(row.systolic_bp) || 0,
        diastolic_bp: Number.parseFloat(row.diastolic_bp) || 0,
        heart_rate: Number.parseFloat(row.heart_rate) || 0,
        cholesterol: Number.parseFloat(row.cholesterol) || 0,
        glucose: Number.parseFloat(row.glucose) || 0,
        medication_adherence: Number.parseFloat(row.medication_adherence) || 0,
        exercise_minutes: Number.parseFloat(row.exercise_minutes) || 0,
        diet_score: Number.parseFloat(row.diet_score) || 0,
        stress_level: Number.parseFloat(row.stress_level) || 0,
        weight_kg: Number.parseFloat(row.weight_kg) || 0,
        oxygen_saturation: Number.parseFloat(row.oxygen_saturation) || 0,
        temperature_c: Number.parseFloat(row.temperature_c) || 0,
        sleep_hours: Number.parseFloat(row.sleep_hours) || 0,
      }
    })

    if (!patients.length) {
      return { success: false, error: "No valid patient data found in CSV" }
    }

    // Validate required fields for first patient
    const requiredFields = ["age", "systolic_bp", "diastolic_bp", "heart_rate", "cholesterol"]
    const firstPatient = patients[0]
    const missingFields = requiredFields.filter((field) => 
      !firstPatient[field as keyof CardiovascularData] || 
      isNaN(Number(firstPatient[field as keyof CardiovascularData]))
    )
    
    if (missingFields.length > 0) {
      return { success: false, error: `Missing or invalid values for: ${missingFields.join(", ")}` }
    }

    // Prepare the request payload
    const requestPayload = {
      patients: patients
    }

    // Call the cardiovascular API
    const baseUrl = "http://172.16.44.133:10000/api/cardiovascular";
    console.log("Calling cardiovascular API with payload:", JSON.stringify(requestPayload, null, 2))
    
    let response: Response
    try {
      response = await fetch(baseUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload),
      })
    } catch (fetchError) {
      console.error("Network error calling cardiovascular API:", fetchError)
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
    }

    console.log("API response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error response:", errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const predictions = (await response.json()) as CardiovascularPredictionResponse
    console.log("API response data:", JSON.stringify(predictions, null, 2))

    // Generate AI recommendations
    let recommendations: string | undefined
    try {
      const { getCardiovascularRecommendations } = await import("@/lib/ai/gemini")
      recommendations = await getCardiovascularRecommendations({
        data: patients,
        predictions,
      })
    } catch (aiErr) {
      console.error("Gemini generation error:", aiErr)
    }

    return {
      success: true,
      data: patients,
      predictions,
      recommendations,
    }
  } catch (error) {
    console.error("Cardiovascular CSV processing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
