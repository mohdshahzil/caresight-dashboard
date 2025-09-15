"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Patient {
  id: number
  name: string
  age: number
  riskScore: number
  riskLevel: string
  lastVisit: string
  condition: string
}

interface PatientListProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onPatientSelect: (patient: Patient) => void
  activeTab: string
  searchTerm: string
  onSearchChange: (value: string) => void
  riskFilter: string
  onRiskFilterChange: (value: string) => void
}

export function PatientList({
  patients,
  selectedPatient,
  onPatientSelect,
  activeTab,
  searchTerm,
  onSearchChange,
  riskFilter,
  onRiskFilterChange,
}: PatientListProps) {
  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-destructive text-white"
      case "Medium":
        return "bg-yellow-500 text-white"
      case "Low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card>
      <div className="p-6">
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedPatient?.id === patient.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
              onClick={() => onPatientSelect(patient)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Age {patient.age} • Last visit: {patient.lastVisit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                    {patient.riskScore}% {patient.riskLevel}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{patient.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
