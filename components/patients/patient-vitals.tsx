"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VitalsData {
  bp: string
  hr: number
  temp: number
  oxygenSat?: number
  glucose?: number
}

interface PatientVitalsProps {
  vitals: VitalsData
  patientName: string
}

export function PatientVitals({ vitals, patientName }: PatientVitalsProps) {
  const getVitalStatus = (vital: string, value: number | string) => {
    switch (vital) {
      case "hr":
        const hr = value as number
        if (hr < 60 || hr > 100) return "warning"
        return "normal"
      case "temp":
        const temp = value as number
        if (temp < 97 || temp > 99.5) return "warning"
        return "normal"
      case "oxygenSat":
        const sat = value as number
        if (sat < 95) return "critical"
        if (sat < 98) return "warning"
        return "normal"
      default:
        return "normal"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive text-destructive-foreground"
      case "warning":
        return "bg-yellow-500 text-white"
      case "normal":
        return "bg-green-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Current Vitals - {patientName}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{vitals.bp}</span>
              <Badge className={getStatusColor("normal")}>Normal</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{vitals.hr} bpm</span>
              <Badge className={getStatusColor(getVitalStatus("hr", vitals.hr))}>
                {getVitalStatus("hr", vitals.hr)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Temperature</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{vitals.temp}°F</span>
              <Badge className={getStatusColor(getVitalStatus("temp", vitals.temp))}>
                {getVitalStatus("temp", vitals.temp)}
              </Badge>
            </div>
          </div>

          {vitals.oxygenSat && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Oxygen Saturation</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{vitals.oxygenSat}%</span>
                <Badge className={getStatusColor(getVitalStatus("oxygenSat", vitals.oxygenSat))}>
                  {getVitalStatus("oxygenSat", vitals.oxygenSat)}
                </Badge>
              </div>
            </div>
          )}

          {vitals.glucose && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Blood Glucose</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{vitals.glucose} mg/dL</span>
                <Badge className={getStatusColor("normal")}>Normal</Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
