"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Plus, 
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle
} from "lucide-react"
import { getStoredPatients, getPatientStats, type StoredPatient } from "@/lib/patient-storage"
import { PatientList } from "./patient-list"
import { PatientDetail } from "./patient-detail"
import { DiabetesUpload } from "../csv/diabetes-upload"
import { DiabetesAnalysis } from "@/lib/diabetes-analysis"

type ViewMode = 'overview' | 'patient-list' | 'patient-detail' | 'new-analysis'

export function DiabetesDashboard() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview')
  const [selectedPatient, setSelectedPatient] = useState<StoredPatient | null>(null)
  const [patients, setPatients] = useState<StoredPatient[]>([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReports: 0,
    averageReportsPerPatient: 0,
    recentActivity: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedPatients = getStoredPatients()
    const patientStats = getPatientStats()
    setPatients(storedPatients)
    setStats(patientStats)
  }

  const handlePatientSelect = (patient: StoredPatient) => {
    setSelectedPatient(patient)
    setCurrentView('patient-detail')
  }

  const handleNewAnalysis = () => {
    setCurrentView('new-analysis')
  }

  const handleAnalysisComplete = () => {
    loadData() // Refresh data after new analysis
    setCurrentView('overview')
  }

  const handleBackToOverview = () => {
    setCurrentView('overview')
    setSelectedPatient(null)
  }

  const handleBackToPatients = () => {
    setCurrentView('patient-list')
    setSelectedPatient(null)
  }

  const getRiskDistribution = () => {
    const distribution = { low: 0, moderate: 0, high: 0 }
    patients.forEach(patient => {
      if (patient.reports.length > 0) {
        const latestReport = patient.reports[patient.reports.length - 1]
        const analysis = latestReport.rawApiResponse ? new DiabetesAnalysis(latestReport.rawApiResponse) : null
        const risk = analysis?.overallRiskLevel?.toLowerCase()
        if (risk === 'low') distribution.low++
        else if (risk === 'moderate' || risk === 'medium') distribution.moderate++
        else if (risk === 'high') distribution.high++
      }
    })
    return distribution
  }

  const riskDistribution = getRiskDistribution()

  // Overview Dashboard
  if (currentView === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diabetes Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor patient health and risk assessments</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('patient-list')}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Users className="h-4 w-4 mr-2" />
              View All Patients
            </Button>
            <Button 
              onClick={handleNewAnalysis}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Reports/Patient</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageReportsPerPatient}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Patient Risk Distribution
            </CardTitle>
            <CardDescription>
              Current risk levels across all patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-800">{riskDistribution.low}</p>
                <p className="text-sm font-medium text-green-600">Low Risk Patients</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-3xl font-bold text-yellow-800">{riskDistribution.moderate}</p>
                <p className="text-sm font-medium text-yellow-600">Moderate Risk Patients</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-3xl font-bold text-red-800">{riskDistribution.high}</p>
                <p className="text-sm font-medium text-red-600">High Risk Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Analysis */}
        {patients.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Analysis
                  </CardTitle>
                  <CardDescription>
                    Latest diabetes risk assessments and patient updates
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentView('patient-list')}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patients
                  .flatMap(patient => 
                    patient.reports.map(report => ({
                      ...report,
                      patientName: patient.name,
                      patientAge: patient.age,
                      patientGender: patient.gender,
                      patientId: patient.id
                    }))
                  )
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 5)
                  .map((report, index) => {
                    const analysis = report.rawApiResponse ? new DiabetesAnalysis(report.rawApiResponse) : null
                    const risk = analysis ? { score: analysis.overallRiskScore, level: analysis.overallRiskLevel } : null
                    
                    return (
                      <div 
                        key={`${report.patientId}-${report.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border"
                        onClick={() => {
                          const patient = patients.find(p => p.id === report.patientId)
                          if (patient) handlePatientSelect(patient)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {report.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.patientName}</p>
                            <p className="text-sm text-gray-600">
                              {report.patientAge} years • {report.patientGender} • Analysis #{index + 1}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {risk && risk.level && (
                            <Badge 
                              variant="outline"
                              className={
                                risk.level.toLowerCase() === 'low' 
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : risk.level.toLowerCase() === 'high'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }
                            >
                              {risk.level} Risk{risk.score !== undefined ? ` (${(risk.score * 100).toFixed(0)}%)` : ''}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    )
  }

  // Patient List View
  if (currentView === 'patient-list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToOverview}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
        </div>
        <PatientList 
          onPatientSelect={handlePatientSelect}
          onNewPatient={handleNewAnalysis}
        />
      </div>
    )
  }

  // Patient Detail View
  if (currentView === 'patient-detail' && selectedPatient) {
    return (
      <PatientDetail 
        patient={selectedPatient}
        onBack={handleBackToPatients}
      />
    )
  }

  // New Analysis View
  if (currentView === 'new-analysis') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToOverview}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">New Diabetes Analysis</h1>
        </div>
        <DiabetesUpload onPredictionUpdate={handleAnalysisComplete} />
      </div>
    )
  }

  return null
}
