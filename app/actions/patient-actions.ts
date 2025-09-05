"use server"

export async function exportPatientData(patients: any[], condition: string) {
  try {
    const data = patients.map((patient) => ({
      name: patient.name,
      age: patient.age,
      condition: patient.condition,
      riskScore: patient.riskScore,
      riskLevel: patient.riskLevel,
      lastVisit: patient.lastVisit,
    }))

    const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

    return { success: true, data: csv, filename: `caresight-${condition}-patients.csv` }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export patient data",
    }
  }
}

export async function refreshPatientData(condition: string) {
  try {
    // Simulate API call to refresh patient data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: `${condition} patient data refreshed successfully`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to refresh patient data",
    }
  }
}
