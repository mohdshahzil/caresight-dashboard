"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, AlertCircle, CheckCircle2, User, Users } from "lucide-react"

import { GlucoseForecastChart } from "@/components/diabetes/glucose-forecast-chart"
import { RiskHorizonChart } from "@/components/diabetes/risk-horizon-chart"
import { OverallRiskCard } from "@/components/diabetes/overall-risk-card"
import { RawResponseViewer } from "@/components/diabetes/raw-response-viewer"
import { parseDiabetesResponse, type DiabetesApiResponse, type ParsedDiabetesData } from "@/lib/diabetes-parser"
import { logError, logWarn, logDebug, logApiResponse } from "@/lib/error-logger"
import { savePatient, addReportToPatient, type StoredPatient } from "@/lib/patient-storage"
import { getDiabetesRecommendations } from "@/lib/ai/gemini"

interface DiabetesUploadProps {
  onPredictionUpdate?: (data: any) => void
}

interface PatientDemographics {
  name: string
  age: number
  gender: string
  weight?: number
  height?: number
}

type ProcessingStage = 
  | 'idle'
  | 'reading-file'
  | 'parsing-csv'
  | 'building-payload'
  | 'calling-api'
  | 'parsing-response'
  | 'complete'
  | 'error'

const STAGE_MESSAGES = {
  'reading-file': 'Reading CSV file...',
  'parsing-csv': 'Parsing CSV data...',
  'building-payload': 'Building API payload...',
  'calling-api': 'Calling diabetes prediction API...',
  'parsing-response': 'Processing API response...',
  'complete': 'Analysis complete!',
  'error': 'Error occurred'
}

const STAGE_PROGRESS = {
  'idle': 0,
  'reading-file': 10,
  'parsing-csv': 25,
  'building-payload': 40,
  'calling-api': 60,
  'parsing-response': 80,
  'complete': 100,
  'error': 0
}

export function DiabetesUpload({ onPredictionUpdate }: DiabetesUploadProps) {
  const [stage, setStage] = useState<ProcessingStage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedDiabetesData | null>(null)
  const [rawResponse, setRawResponse] = useState<DiabetesApiResponse | null>(null)
  const [patientDemographics, setPatientDemographics] = useState<PatientDemographics>({
    name: '',
    age: 0,
    gender: '',
    weight: undefined,
    height: undefined
  })
  const [showDemographicsForm, setShowDemographicsForm] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [payloadJson, setPayloadJson] = useState<any | null>(null)

  const handleShowForm = () => {
    setShowDemographicsForm(true)
    setError(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
  }

  const handleDemographicsSubmit = () => {
    if (!patientDemographics.name || !patientDemographics.age || !patientDemographics.gender) {
      setError('Please fill in all required patient information (Name, Age, Gender)')
      return
    }
    
    if (!uploadedFile) {
      setError('Please select a CSV file')
      return
    }

    setShowDemographicsForm(false)
    processFileWithDemographics(uploadedFile, patientDemographics)
  }

  const processFileWithDemographics = async (file: File, demographics: PatientDemographics) => {
    setError(null)
    setStage('reading-file')

    try {
      // Stage 1: Read file
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })

      setStage('parsing-csv')
      await sleep(200) // Small delay for UX

      // Stage 2: Parse CSV
      const lines = text.trim().split('\n')
      if (lines.length < 2) throw new Error('CSV must have at least header and one data row')

      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()))

      setStage('building-payload')
      await sleep(200)

      // Stage 3: Build payload
      const payload = await buildApiPayload(headers, rows, demographics)
      setPayloadJson(payload)

      setStage('calling-api')
      await sleep(200)

      // Stage 4: Call API
      const baseUrl = "http://127.0.0.1:8000/api/glucose"
      const isCohort = payload.patients && Array.isArray(payload.patients) && payload.patients.length > 1
      const apiUrl = isCohort ? `${baseUrl}/cohort` : baseUrl

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCohort ? payload : payload.patients?.[0] || payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const apiResponse: DiabetesApiResponse = await response.json()
      logApiResponse(apiUrl, apiResponse, {
        component: 'DiabetesUpload',
        action: 'api-call',
        metadata: { isCohort, patientCount: payload.patients?.length || 1 }
      })
      setRawResponse(apiResponse)

      setStage('parsing-response')
      await sleep(200)

      // Stage 5: Parse response
      const parsed = parseDiabetesResponse(apiResponse)
      // Use toParsedData if available (class instance)
      const parsedData = parsed?.toParsedData ? parsed.toParsedData() : parsed;
      if (!parsedData) {
        setParsedData(null);
        throw new Error('Failed to parse diabetes API response');
      }
      // Explicitly assert type for downstream usage
      const parsedDataTyped = parsedData as any; // If you have ParsedDiabetesData type, use it here
      setParsedData(parsedDataTyped);

      // Stage 6: Generate explainability data
      setStage('parsing-response')
      await sleep(200)

      let riskFactors: Record<string, number> = {}

      try {
        // Extract risk factors from API response and input data
        const riskFactorsResult = await getDiabetesRecommendations({
          demographics: {
            name: demographics.name,
            age: demographics.age,
            gender: demographics.gender
          },
          contextFactors: apiResponse.risk_assessment?.context_factors || {},
          selectedHorizon: '90d',
          horizonRisk: apiResponse.risk_assessment?.horizon_risks?.horizon_90d || {}
        })
        riskFactors = typeof riskFactorsResult === 'object' && riskFactorsResult !== null ? riskFactorsResult : {};
        logDebug('Risk factors extracted successfully')
      } catch (riskError) {
        logError(riskError instanceof Error ? riskError : new Error('Failed to extract risk factors'), {
          component: 'DiabetesUpload',
          action: 'extract-risk-factors'
        })
      }

      // Stage 7: Save to patient storage
      try {
        const savedPatient = savePatient({
          name: demographics.name,
          age: demographics.age,
          gender: demographics.gender,
          weight: demographics.weight,
          height: demographics.height,
          reports: []
        })

        addReportToPatient(savedPatient.id, {
          analysisDate: new Date().toISOString(),
          glucoseData: payload.patients?.[0]?.data || [],
          riskFactors,
          rawApiResponse: apiResponse,
          payload // Use the local variable, not payloadJson
        })

        logDebug('Patient data saved successfully', { patientId: savedPatient.id })
      } catch (saveError) {
        logError(saveError instanceof Error ? saveError : new Error('Failed to save patient data'), {
          component: 'DiabetesUpload',
          action: 'save-patient-data'
        })
      }

      setStage('complete')
      onPredictionUpdate?.(apiResponse)

    } catch (err) {
      logError(err instanceof Error ? err : new Error('Diabetes upload failed'), {
        component: 'DiabetesUpload',
        action: 'file-upload',
        metadata: { fileName: file.name, fileSize: file.size, stage }
      })
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setStage('error')
    }
  }

  const handleReset = () => {
    setStage('idle')
    setError(null)
    setParsedData(null)
    setRawResponse(null)
    setShowDemographicsForm(false)
    setUploadedFile(null)
    setPatientDemographics({
      name: '',
      age: 0,
      gender: '',
      weight: undefined,
      height: undefined
    })
  }

  const isProcessing = stage !== 'idle' && stage !== 'complete' && stage !== 'error'

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Diabetes Risk Assessment
          </CardTitle>
          <CardDescription>
            Upload CSV with patient glucose data for 90-day forecasting and risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleShowForm}
              disabled={isProcessing || showDemographicsForm}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Start New Analysis
            </Button>
            {stage === 'complete' && (
              <Button onClick={handleReset} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-gray-600">
                  {STAGE_MESSAGES[stage]}
                </span>
              </div>
              <Progress value={STAGE_PROGRESS[stage]} className="w-full" />
            </div>
          )}

          {/* Success Indicator */}
          {stage === 'complete' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{STAGE_MESSAGES[stage]}</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Patient Demographics Form */}
      {showDemographicsForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Please provide patient demographics for personalized analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name *</Label>
                <Input
                  id="patient-name"
                  placeholder="Enter patient name"
                  value={patientDemographics.name}
                  onChange={(e) => setPatientDemographics(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-age">Age *</Label>
                <Input
                  id="patient-age"
                  type="number"
                  placeholder="Enter age"
                  value={patientDemographics.age || ''}
                  onChange={(e) => setPatientDemographics(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-gender">Gender *</Label>
                <Select 
                  value={patientDemographics.gender} 
                  onValueChange={(value) => setPatientDemographics(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-weight">Weight (kg)</Label>
                <Input
                  id="patient-weight"
                  type="number"
                  placeholder="Enter weight"
                  value={patientDemographics.weight || ''}
                  onChange={(e) => setPatientDemographics(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-height">Height (cm)</Label>
                <Input
                  id="patient-height"
                  type="number"
                  placeholder="Enter height"
                  value={patientDemographics.height || ''}
                  onChange={(e) => setPatientDemographics(prev => ({ ...prev, height: parseFloat(e.target.value) || undefined }))}
                />
              </div>
              
            </div>
            
            {/* CSV File Upload within the form */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="csv-file">Glucose Data CSV File *</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Upload CSV containing glucose monitoring data (patient_id, missed_insulin, exercise_flag, illness_flag, etc.)
              </p>
              {uploadedFile && (
                <p className="text-sm text-green-600">
                  ✓ Selected: {uploadedFile.name}
                </p>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleDemographicsSubmit} className="flex-1">
                Continue with Analysis
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Results */}
      {parsedData && stage === 'complete' && (
        <Card className="mt-4">
          {/* Download Payload JSON Button - always visible if payloadJson exists */}
          {payloadJson && (
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                onClick={() => {
                  const patientName = patientDemographics.name || 'patient';
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                  const filename = `${patientName.replace(/\s+/g, '_')}_diabetes_payload_${timestamp}.json`;
                  const jsonStr = JSON.stringify(payloadJson, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download Payload JSON
              </Button>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Analysis Results</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!payloadJson) return;
                  const patientName = patientDemographics.name || 'patient';
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                  const filename = `${patientName.replace(/\s+/g, '_')}_diabetes_payload_${timestamp}.json`;
                  const jsonStr = JSON.stringify(payloadJson, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download Payload JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!rawResponse) return;
                  const patientName = patientDemographics.name || 'patient';
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                  const filename = `${patientName.replace(/\s+/g, '_')}_diabetes_analysis_${timestamp}.json`;
                  const jsonStr = JSON.stringify(rawResponse, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {parsedData.overallRisk && (
              <OverallRiskCard data={parsedData.overallRisk} />
            )}

            {parsedData.forecastData.length > 0 && (
              <GlucoseForecastChart data={parsedData.forecastData} />
            )}

            {parsedData.horizonRiskData.length > 0 && (
              <RiskHorizonChart data={parsedData.horizonRiskData} />
            )}

            {/* Raw API Response */}
            <RawResponseViewer response={rawResponse || { debug: "No API response yet", stage: stage, hasError: !!error }} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function buildApiPayload(headers: string[], rows: string[][], demographics: PatientDemographics): Promise<any> {
  const toJsonObjects = (headers: string[], row: string[]) => {
    const obj: Record<string, any> = {}
    headers.forEach((header, i) => {
      const value = row[i]
      if (value === undefined || value === '') {
        obj[header] = null
      } else if (!isNaN(Number(value))) {
        obj[header] = Number(value)
      } else if (value.toLowerCase() === 'true') {
        obj[header] = true
      } else if (value.toLowerCase() === 'false') {
        obj[header] = false
      } else {
        obj[header] = value
      }
    })
    return obj
  }

  // Group by patient_id
  const grouped: Record<string, { patient_id: string | number; data: Record<string, any>[] }> = {}
  
  rows.forEach((row, idx) => {
    const rawRecord = toJsonObjects(headers, row)
    const patientId = rawRecord["patient_id"] ?? demographics.name
    
    // Normalize boolean flags and percentages
    const normalizedRecord = {
      ...rawRecord,
      patient_id: patientId,
      missed_insulin: rawRecord.missed_insulin === true ? 1 : rawRecord.missed_insulin === false ? 0 : Number(rawRecord.missed_insulin || 0),
      exercise_flag: rawRecord.exercise_flag === true ? 1 : rawRecord.exercise_flag === false ? 0 : Number(rawRecord.exercise_flag || 0),
      illness_flag: rawRecord.illness_flag === true ? 1 : rawRecord.illness_flag === false ? 0 : Number(rawRecord.illness_flag || 0),
      is_weekend: rawRecord.is_weekend === true ? 1 : rawRecord.is_weekend === false ? 0 : Number(rawRecord.is_weekend || 0),
      pct_hypo: typeof rawRecord.pct_hypo === 'number' && rawRecord.pct_hypo <= 1 ? rawRecord.pct_hypo * 100 : Number(rawRecord.pct_hypo || 0),
      pct_hyper: typeof rawRecord.pct_hyper === 'number' && rawRecord.pct_hyper <= 1 ? rawRecord.pct_hyper * 100 : Number(rawRecord.pct_hyper || 0),
    }

    if (!grouped[String(patientId)]) {
      grouped[String(patientId)] = { patient_id: patientId, data: [] }
    }
    grouped[String(patientId)].data.push(normalizedRecord)
  })

  // Safety check before Object.values
  const patients = grouped && typeof grouped === 'object' ? Object.values(grouped) : []
  const risk_horizons = [7, 14, 30, 60, 90]

  // Build final payload with patient demographics
  return {
    patients: patients.map(patient => {
      const lastRecord = patient.data[patient.data.length - 1]
      return {
        patient_id: patient.patient_id,
        name: demographics.name,
        age: demographics.age,
        gender: demographics.gender,
        weight: demographics.weight,
        height: demographics.height,
        analysis_timestamp: new Date().toISOString(),
        data: patient.data,
        contexts: {
          insulin_adherence: lastRecord?.insulin_adherence || 1,
          sleep_quality: lastRecord?.sleep_quality || 0.8,
          insulin_dose: lastRecord?.insulin_dose || 30,
        },
        risk_horizons,
      }
    })
  }
}