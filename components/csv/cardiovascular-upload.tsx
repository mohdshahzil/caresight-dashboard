"use client"

import type React from "react"

import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, RotateCcw, Heart, Download } from "lucide-react"
import { processCardiovascularCSV } from "@/app/actions/cardiovascular-processing"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, PieChart, Pie, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

interface CardiovascularUploadProps {
  onPredictionUpdate?: (prediction: any) => void
}

export function CardiovascularUpload({ onPredictionUpdate }: CardiovascularUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await processCardiovascularCSV(formData)

      if (response.success && response.data && response.predictions) {
        setResult(response)
        onPredictionUpdate?.(response.predictions)
      } else {
        setError(response.error || "Failed to process cardiovascular CSV")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Upload error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onPredictionUpdate?.(null)
  }

  const downloadSampleCSV = () => {
    const link = document.createElement('a')
    link.href = '/sample-cardiovascular-data.csv'
    link.download = 'sample-cardiovascular-data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRiskColor = (risk: string | number) => {
    if (typeof risk === 'number') {
      if (risk < 0.3) return "text-green-600 bg-green-50"
      if (risk < 0.7) return "text-yellow-600 bg-yellow-50"
      return "text-red-600 bg-red-50"
    }
    
    switch (risk.toLowerCase()) {
      case "low":
      case "low risk":
        return "text-green-600 bg-green-50"
      case "medium":
      case "mid risk":
      case "moderate":
        return "text-yellow-600 bg-yellow-50"
      case "high":
      case "high risk":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getPatientSummaryData = () => {
    if (!result?.data) return []
    
    const patients = result.data
    const ageGroups = { "18-30": 0, "31-50": 0, "51-70": 0, "70+": 0 }
    const genderCount = { Male: 0, Female: 0, Other: 0 }
    const diabetesCount = { Yes: 0, No: 0 }
    const hypertensionCount = { Yes: 0, No: 0 }

    patients.forEach((patient: any) => {
      // Age groups
      if (patient.age <= 30) ageGroups["18-30"]++
      else if (patient.age <= 50) ageGroups["31-50"]++
      else if (patient.age <= 70) ageGroups["51-70"]++
      else ageGroups["70+"]++

      // Gender
      if (patient.gender in genderCount) {
        genderCount[patient.gender as keyof typeof genderCount]++
      } else {
        genderCount.Other++
      }

      // Conditions
      diabetesCount[patient.diabetes as keyof typeof diabetesCount]++
      hypertensionCount[patient.hypertension as keyof typeof hypertensionCount]++
    })

    return { ageGroups, genderCount, diabetesCount, hypertensionCount }
  }

  const getVitalsDistribution = () => {
    if (!result?.data) return []
    
    return result.data.map((patient: any, index: number) => ({
      patient: `P${index + 1}`,
      systolic_bp: patient.systolic_bp,
      diastolic_bp: patient.diastolic_bp,
      heart_rate: patient.heart_rate,
      cholesterol: patient.cholesterol,
      glucose: patient.glucose,
      age: patient.age,
    }))
  }

  const getRiskFactorsData = () => {
    if (!result?.data) return []
    
    return result.data.map((patient: any, index: number) => ({
      patient: `P${index + 1}`,
      age: patient.age,
      exercise: patient.exercise_minutes,
      diet_score: patient.diet_score,
      stress: patient.stress_level,
      medication_adherence: patient.medication_adherence,
      sleep: patient.sleep_hours,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Upload Cardiovascular Risk Assessment CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing cardiovascular patient data with parameters like age, blood pressure, cholesterol, diabetes status, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> cardiovascular CSV file
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={downloadSampleCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sample CSV
              </Button>
            </div>

            {result && (
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload New CSV File
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span className="text-sm text-gray-600">Processing cardiovascular data...</span>
                </div>
                <Progress value={65} className="w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Dataset Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Dataset Summary
              </CardTitle>
              <CardDescription>
                Overview of {result.data?.length || 0} patients uploaded for cardiovascular risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{result.data?.length || 0}</p>
                  <p className="text-sm text-blue-800">Total Patients</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {result.data?.filter((p: any) => p.diabetes === "No").length || 0}
                  </p>
                  <p className="text-sm text-green-800">Non-Diabetic</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {result.data?.filter((p: any) => p.hypertension === "Yes").length || 0}
                  </p>
                  <p className="text-sm text-yellow-800">Hypertensive</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {result.data?.filter((p: any) => p.diabetes === "Yes" && p.hypertension === "Yes").length || 0}
                  </p>
                  <p className="text-sm text-red-800">High Risk Combo</p>
                </div>
              </div>

              {/* Age Distribution */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Age Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(getPatientSummaryData().ageGroups).map(([age, count]) => ({ age, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vitals Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Patient Vitals Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Blood Pressure Scatter */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Blood Pressure Distribution</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={getVitalsDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="systolic_bp" name="Systolic BP" unit="mmHg" />
                        <YAxis dataKey="diastolic_bp" name="Diastolic BP" unit="mmHg" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Patients" dataKey="diastolic_bp" fill="#ef4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cholesterol vs Age */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Cholesterol vs Age</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={getVitalsDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" name="Age" unit="years" />
                        <YAxis dataKey="cholesterol" name="Cholesterol" unit="mg/dL" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Patients" dataKey="cholesterol" fill="#8b5cf6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Factors Radar */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Average Risk Factors Profile</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        {
                          factor: "Exercise (min/week)",
                          value: result.data?.reduce((sum: number, p: any) => sum + p.exercise_minutes, 0) / result.data?.length || 0,
                          max: 300
                        },
                        {
                          factor: "Diet Score",
                          value: result.data?.reduce((sum: number, p: any) => sum + p.diet_score, 0) / result.data?.length || 0,
                          max: 10
                        },
                        {
                          factor: "Sleep Hours",
                          value: result.data?.reduce((sum: number, p: any) => sum + p.sleep_hours, 0) / result.data?.length || 0,
                          max: 12
                        },
                        {
                          factor: "Medication Adherence",
                          value: result.data?.reduce((sum: number, p: any) => sum + p.medication_adherence, 0) / result.data?.length || 0,
                          max: 100
                        }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                        <Radar name="Average" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Response */}
          {result.predictions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cardiovascular Risk Assessment Results
                </CardTitle>
                <CardDescription>
                  AI-powered analysis from the cardiovascular risk model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cohort Statistics */}
                  {result.predictions.cohort_statistics && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Cohort Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{result.predictions.cohort_statistics.total_patients}</p>
                          <p className="text-sm text-blue-800">Total Patients</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{result.predictions.cohort_statistics.low_risk_patients}</p>
                          <p className="text-sm text-green-800">Low Risk</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{result.predictions.cohort_statistics.medium_risk_patients}</p>
                          <p className="text-sm text-yellow-800">Medium Risk</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{result.predictions.cohort_statistics.high_risk_patients}</p>
                          <p className="text-sm text-red-800">High Risk</p>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-gray-600">
                          Average Risk Score: {(result.predictions.cohort_statistics.average_risk_score * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Individual Patient Predictions */}
                  {result.predictions.patient_predictions && result.predictions.patient_predictions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Individual Risk Assessments</h4>
                      <div className="space-y-4">
                        {result.predictions.patient_predictions.map((patient, index) => (
                          <div key={patient.patient_id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold">Patient {patient.patient_id}</h5>
                              <Badge className={`px-3 py-1 ${getRiskColor(patient.risk_level)}`}>
                                {patient.risk_level} RISK
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Risk Score</p>
                                <p className="text-lg font-semibold">{(patient.risk_score * 100).toFixed(2)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Prediction</p>
                                <p className="text-lg font-semibold">{patient.prediction === "0" ? "No Risk" : "At Risk"}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Model</p>
                                <p className="text-lg font-semibold">{patient.model_info.model_type}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Horizon</p>
                                <p className="text-lg font-semibold">{patient.model_info.prediction_horizon}</p>
                              </div>
                            </div>

                            {/* Probabilities */}
                            <div className="mb-4">
                              <h6 className="font-medium mb-2">Risk Probabilities</h6>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                  <span className="text-sm">No Risk</span>
                                  <span className="font-semibold">{(patient.probabilities["0"] * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                  <span className="text-sm">At Risk</span>
                                  <span className="font-semibold">{(patient.probabilities["1"] * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>

                            {/* SHAP Values - Top 5 most important */}
                            {patient.shap_values && (
                              <div>
                                <h6 className="font-medium mb-2">Key Risk Factors (SHAP Values)</h6>
                                <div className="space-y-1">
                                  {Object.entries(patient.shap_values)
                                    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                                    .slice(0, 5)
                                    .map(([feature, value]) => (
                                      <div key={feature} className="flex items-center justify-between text-sm">
                                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                                        <span className={`font-medium ${value > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                          {value > 0 ? '+' : ''}{value.toFixed(4)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
