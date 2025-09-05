"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface MedicalHistoryProps {
  patientName: string
  medicalHistory: string[]
  medications: string[]
  allergies: string[]
}

export function PatientMedicalHistory({ patientName, medicalHistory, medications, allergies }: MedicalHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Medical History - {patientName}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Medical History</h4>
          <div className="space-y-1">
            {medicalHistory.map((item, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Current Medications</h4>
          <div className="space-y-1">
            {medications.map((med, index) => (
              <Badge key={index} variant="secondary" className="mr-1 mb-1">
                {med}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Allergies</h4>
          <div className="space-y-1">
            {allergies.map((allergy, index) => (
              <Badge key={index} variant="destructive" className="mr-1 mb-1">
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
