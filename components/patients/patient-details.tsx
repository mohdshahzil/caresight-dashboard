"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface Patient {
  id: number
  name: string
  age: number
  contact: {
    phone: string
    email: string
  }
  vitals: {
    bp: string
    hr: number
    temp: number
  }
  medications: string[]
  labResults: Array<{
    test: string
    value: string
    status: string
  }>
}

interface PatientDetailsProps {
  patient: Patient | null
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  if (!patient) {
    return (
      <Card>
        <div className="p-6 text-center text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a patient to view details</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Patient Details</h3>
      </CardHeader>
      <div className="p-6 pt-0 space-y-4">
        <div>
          <h4 className="font-medium mb-2">{patient.name}</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Age: {patient.age} years</p>
            <p>Phone: {patient.contact.phone}</p>
            <p>Email: {patient.contact.email}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Current Vitals</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>BP: {patient.vitals.bp}</div>
            <div>HR: {patient.vitals.hr} bpm</div>
            <div>Temp: {patient.vitals.temp}°F</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Medications</h4>
          <div className="space-y-1">
            {patient.medications.map((med, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {med}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Recent Lab Results</h4>
          <div className="space-y-2">
            {patient.labResults.map((lab, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{lab.test}</span>
                <Badge variant={lab.status === "normal" ? "default" : "destructive"}>{lab.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
