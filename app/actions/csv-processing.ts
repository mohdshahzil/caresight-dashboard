"use server"

interface MaternalCareData {
  Age: number
  SystolicBP: number
  DiastolicBP: number
  BS: number
  BodyTemp: number
  HeartRate: number
}

interface PredictionResponse {
  prediction: string
  probabilities: {
    "high risk": number
    "low risk": number
    "mid risk": number
  }
  shap_values: {
    Age: number
    BS: number
    BodyTemp: number
    DiastolicBP: number
    HeartRate: number
    SystolicBP: number
  }
}

export async function processCSV(formData: FormData): Promise<{
  success: boolean
  data?: MaternalCareData
  prediction?: PredictionResponse
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
    const lines = csvText.trim().split("\n")

    if (lines.length < 2) {
      return { success: false, error: "CSV file must contain headers and at least one data row" }
    }

    // Parse CSV headers and data
    const headers = lines[0].split(",").map((h) => h.trim())
    const dataRow = lines[1].split(",").map((d) => d.trim())

    // Create data object
    const csvData: any = {}
    headers.forEach((header, index) => {
      csvData[header] = dataRow[index]
    })

    // Extract required parameters
    const extractedData: MaternalCareData = {
      Age: Number.parseFloat(csvData.Age || csvData.age),
      SystolicBP: Number.parseFloat(csvData.SystolicBP || csvData.systolicbp),
      DiastolicBP: Number.parseFloat(csvData.DiastolicBP || csvData.diastolicbp),
      BS: Number.parseFloat(csvData.BS || csvData.bs),
      BodyTemp: Number.parseFloat(csvData.BodyTemp || csvData.bodytemp),
      HeartRate: Number.parseFloat(csvData.HeartRate || csvData.heartrate),
    }

    // Validate extracted data
    const requiredFields = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"]
    const missingFields = requiredFields.filter((field) => isNaN(extractedData[field as keyof MaternalCareData]))

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing or invalid values for: ${missingFields.join(", ")}`,
      }
    }

    // Make API call to maternal health endpoint
    const response = await fetch("https://health-models.onrender.com/api/maternal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(extractedData),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      }
    }

    const prediction: PredictionResponse = await response.json()

    // Generate Gemini recommendations based on the API response
    let recommendations: string | undefined
    try {
      const { getMaternalRecommendations } = await import("@/lib/ai/gemini")
      recommendations = await getMaternalRecommendations({
        data: extractedData as unknown as Record<string, number>,
        prediction: prediction as unknown as any,
      })
    } catch (aiErr) {
      console.error("Gemini generation error:", aiErr)
    }

    return {
      success: true,
      data: extractedData,
      prediction,
      recommendations,
    }
  } catch (error) {
    console.error("CSV processing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
