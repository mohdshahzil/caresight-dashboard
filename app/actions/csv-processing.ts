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
  series?: Array<{
    index: number
    timestamp?: string
    data: MaternalCareData
    prediction: PredictionResponse
  }>
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

    // Identify optional timestamp column
    const tsKey = headers.find((h) => /^(date|timestamp|time)$/i.test(h))

    // Build time series rows
    const rows = lines.slice(1).map((line) => line.split(",").map((d) => d.trim()))

    const seriesData: Array<{
      index: number
      timestamp?: string
      data: MaternalCareData
    }> = rows.map((cols, idx) => {
      const row: any = {}
      headers.forEach((header, colIdx) => {
        row[header] = cols[colIdx]
      })
      const dataPoint: MaternalCareData = {
        Age: Number.parseFloat(row.Age || row.age),
        SystolicBP: Number.parseFloat(row.SystolicBP || row.systolicbp),
        DiastolicBP: Number.parseFloat(row.DiastolicBP || row.diastolicbp),
        BS: Number.parseFloat(row.BS || row.bs),
        BodyTemp: Number.parseFloat(row.BodyTemp || row.bodytemp),
        HeartRate: Number.parseFloat(row.HeartRate || row.heartrate),
      }
      const timestamp = tsKey ? String(row[tsKey]) : undefined
      return { index: idx, timestamp, data: dataPoint }
    })

    if (!seriesData.length) {
      return { success: false, error: "No data rows found in CSV" }
    }

    // Validate first row to ensure required fields exist
    const requiredFields = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"]
    const missingFields = requiredFields.filter((field) => isNaN(seriesData[0].data[field as keyof MaternalCareData]))
    if (missingFields.length > 0) {
      return { success: false, error: `Missing or invalid values for: ${missingFields.join(", ")}` }
    }

    // Call API for each data point (in parallel)
    const predictions: PredictionResponse[] = await Promise.all(
      seriesData.map(async (entry) => {
        const resp = await fetch("https://health-models.onrender.com/api/maternal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.data),
        })
        if (!resp.ok) {
          throw new Error(`API request failed: ${resp.status} ${resp.statusText}`)
        }
        return (await resp.json()) as PredictionResponse
      })
    )

    const series = seriesData.map((s, i) => ({ ...s, prediction: predictions[i] }))

    // Use last entry for snapshot fields and recommendations
    const last = series[series.length - 1]

    let recommendations: string | undefined
    try {
      const { getMaternalRecommendations } = await import("@/lib/ai/gemini")
      recommendations = await getMaternalRecommendations({
        data: last.data as unknown as Record<string, number>,
        prediction: last.prediction as unknown as any,
      })
    } catch (aiErr) {
      console.error("Gemini generation error:", aiErr)
    }

    return {
      success: true,
      data: last.data,
      prediction: last.prediction,
      series,
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
