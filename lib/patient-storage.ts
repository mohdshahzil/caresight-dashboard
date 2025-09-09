/**
 * Patient Storage System for Diabetes Monitoring
 * Handles storing and retrieving patient data and their reports
 */

export interface DiabetesReport {
  id: string
  timestamp: string
  analysisDate: string
  glucoseData: any[]
  riskFactors: Record<string, number>
  aiExplanation?: string
  rawApiResponse: any
  payload?: any // The request payload sent to the backend
}

export interface StoredPatient {
  id: string
  name: string
  age: number
  gender: string
  weight?: number
  height?: number
  createdAt: string
  lastUpdated: string
  reports: DiabetesReport[]
}

export interface PatientStorage {
  patients: StoredPatient[]
  lastUpdated: string
}

const STORAGE_KEY = 'caresight_diabetes_patients'

/**
 * Get all stored patients
 */
export function getStoredPatients(): StoredPatient[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const data: PatientStorage = JSON.parse(stored)
    return data.patients || []
  } catch (error) {
    console.error('Error loading stored patients:', error)
    return []
  }
}

/**
 * Save patients to storage
 */
export function savePatients(patients: StoredPatient[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const storage: PatientStorage = {
      patients,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Error saving patients:', error)
  }
}

/**
 * Add or update a patient
 */
export function savePatient(patient: Omit<StoredPatient, 'id' | 'createdAt' | 'lastUpdated'>): StoredPatient {
  const patients = getStoredPatients()
  
  // Check if patient already exists (by name for now)
  const existingIndex = patients.findIndex(p => 
    p.name.toLowerCase() === patient.name.toLowerCase()
  )
  
  const now = new Date().toISOString()
  
  if (existingIndex >= 0) {
    // Update existing patient
    patients[existingIndex] = {
      ...patients[existingIndex],
      ...patient,
      lastUpdated: now
    }
    savePatients(patients)
    return patients[existingIndex]
  } else {
    // Create new patient
    const newPatient: StoredPatient = {
      ...patient,
      id: generatePatientId(),
      createdAt: now,
      lastUpdated: now
    }
    patients.push(newPatient)
    savePatients(patients)
    return newPatient
  }
}

/**
 * Add a report to a patient
 */
export function addReportToPatient(patientId: string, report: Omit<DiabetesReport, 'id' | 'timestamp'>): void {
  const patients = getStoredPatients()
  const patientIndex = patients.findIndex(p => p.id === patientId)
  
  if (patientIndex >= 0) {
    const newReport: DiabetesReport = {
      ...report,
      id: generateReportId(),
      timestamp: new Date().toISOString()
    }
    
    patients[patientIndex].reports.push(newReport)
    patients[patientIndex].lastUpdated = new Date().toISOString()
    savePatients(patients)
  }
}

/**
 * Get a specific patient by ID
 */
export function getPatientById(id: string): StoredPatient | null {
  const patients = getStoredPatients()
  return patients.find(p => p.id === id) || null
}

/**
 * Delete a patient
 */
export function deletePatient(id: string): void {
  const patients = getStoredPatients()
  const filtered = patients.filter(p => p.id !== id)
  savePatients(filtered)
}

/**
 * Delete a specific report
 */
export function deleteReport(patientId: string, reportId: string): void {
  const patients = getStoredPatients()
  const patientIndex = patients.findIndex(p => p.id === patientId)
  
  if (patientIndex >= 0) {
    patients[patientIndex].reports = patients[patientIndex].reports.filter(r => r.id !== reportId)
    patients[patientIndex].lastUpdated = new Date().toISOString()
    savePatients(patients)
  }
}

/**
 * Generate a unique patient ID
 */
function generatePatientId(): string {
  return `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique report ID
 */
function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get patient statistics
 */
export function getPatientStats(): {
  totalPatients: number
  totalReports: number
  averageReportsPerPatient: number
  recentActivity: number // reports in last 30 days
} {
  const patients = getStoredPatients()
  const totalPatients = patients.length
  const totalReports = patients.reduce((sum, p) => sum + p.reports.length, 0)
  const averageReportsPerPatient = totalPatients > 0 ? totalReports / totalPatients : 0
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentActivity = patients.reduce((sum, p) => 
    sum + p.reports.filter(r => new Date(r.timestamp) > thirtyDaysAgo).length, 0
  )
  
  return {
    totalPatients,
    totalReports,
    averageReportsPerPatient: Math.round(averageReportsPerPatient * 10) / 10,
    recentActivity
  }
}
