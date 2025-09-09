"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Trash2
} from "lucide-react"
import { getStoredPatients, deletePatient, type StoredPatient } from "@/lib/patient-storage"
import { DiabetesAnalysis } from "@/lib/diabetes-analysis"

interface PatientListProps {
  onPatientSelect?: (patient: StoredPatient) => void
  onNewPatient?: () => void
}

export function PatientList({ onPatientSelect, onNewPatient }: PatientListProps) {
  const [patients, setPatients] = useState<StoredPatient[]>([])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = () => {
    const storedPatients = getStoredPatients()
    setPatients(storedPatients)
  }

  const handleDeletePatient = (patientId: string) => {
    if (confirm('Are you sure you want to delete this patient and all their reports?')) {
      deletePatient(patientId)
      loadPatients()
    }
  }

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLatestRisk = (patient: StoredPatient) => {
    if (patient.reports.length === 0) return null
    const latest = patient.reports[patient.reports.length - 1]
    const analysis = latest.rawApiResponse ? new DiabetesAnalysis(latest.rawApiResponse) : null
    return analysis ? { score: analysis.overallRiskScore, level: analysis.overallRiskLevel } : null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Patient Dashboard
            </CardTitle>
            <CardDescription>
              Manage diabetes patients and their health reports
            </CardDescription>
          </div>
          <Button onClick={onNewPatient} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first diabetes analysis</p>
            <Button onClick={onNewPatient} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add First Patient
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => {
              const latestRisk = getLatestRisk(patient)
              return (
                <div 
                  key={patient.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{patient.age} years • {patient.gender}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {patient.reports.length} report{patient.reports.length !== 1 ? 's' : ''}
                        </span>
                        <span>Last: {formatDate(patient.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {latestRisk && (
                      <Badge 
                        variant="outline" 
                        className={getRiskColor(latestRisk.level)}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {latestRisk.level} Risk
                      </Badge>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPatientSelect?.(patient)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
