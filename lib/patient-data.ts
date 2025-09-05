export const maternalCarePatients = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 28,
    riskScore: 85,
    riskLevel: "High",
    lastVisit: "2024-01-15",
    condition: "Gestational Diabetes",
    vitals: { bp: "140/90", hr: 88, temp: 98.6 },
    contact: { phone: "(555) 123-4567", email: "sarah.j@email.com" },
    medicalHistory: ["Previous C-section", "Gestational diabetes"],
    medications: ["Metformin", "Prenatal vitamins"],
    allergies: ["Penicillin"],
    labResults: [
      { test: "Glucose", value: "180 mg/dL", normal: "70-140 mg/dL", status: "high" },
      { test: "HbA1c", value: "7.2%", normal: "<6.5%", status: "high" },
    ],
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    age: 32,
    riskScore: 45,
    riskLevel: "Medium",
    lastVisit: "2024-01-12",
    condition: "Hypertension",
    vitals: { bp: "130/85", hr: 75, temp: 98.4 },
    contact: { phone: "(555) 234-5678", email: "maria.r@email.com" },
    medicalHistory: ["Hypertension", "Family history of diabetes"],
    medications: ["Lisinopril", "Prenatal vitamins"],
    allergies: ["None known"],
    labResults: [
      { test: "Blood Pressure", value: "130/85", normal: "<120/80", status: "elevated" },
      { test: "Protein", value: "Trace", normal: "Negative", status: "normal" },
    ],
  },
  {
    id: 3,
    name: "Jennifer Chen",
    age: 25,
    riskScore: 25,
    riskLevel: "Low",
    lastVisit: "2024-01-10",
    condition: "Normal Pregnancy",
    vitals: { bp: "115/75", hr: 72, temp: 98.2 },
    contact: { phone: "(555) 345-6789", email: "jen.c@email.com" },
    medicalHistory: ["No significant history"],
    medications: ["Prenatal vitamins", "Folic acid"],
    allergies: ["Shellfish"],
    labResults: [
      { test: "Hemoglobin", value: "12.5 g/dL", normal: "12-15 g/dL", status: "normal" },
      { test: "Iron", value: "85 μg/dL", normal: "60-170 μg/dL", status: "normal" },
    ],
  },
]

export const cardiovascularPatients = [
  {
    id: 4,
    name: "Robert Smith",
    age: 65,
    riskScore: 78,
    riskLevel: "High",
    lastVisit: "2024-01-14",
    condition: "Coronary Artery Disease",
    vitals: { bp: "150/95", hr: 95, temp: 98.8 },
    contact: { phone: "(555) 456-7890", email: "robert.s@email.com" },
    medicalHistory: ["MI 2019", "Hypertension", "Diabetes"],
    medications: ["Atorvastatin", "Metoprolol", "Aspirin"],
    allergies: ["Sulfa drugs"],
    labResults: [
      { test: "Cholesterol", value: "240 mg/dL", normal: "<200 mg/dL", status: "high" },
      { test: "Troponin", value: "0.02 ng/mL", normal: "<0.04 ng/mL", status: "normal" },
    ],
  },
]

export const diabetesPatients = [
  {
    id: 5,
    name: "Linda Davis",
    age: 58,
    riskScore: 72,
    riskLevel: "High",
    lastVisit: "2024-01-13",
    condition: "Type 2 Diabetes",
    vitals: { bp: "135/88", hr: 82, temp: 98.5 },
    contact: { phone: "(555) 567-8901", email: "linda.d@email.com" },
    medicalHistory: ["Type 2 DM", "Neuropathy", "Retinopathy"],
    medications: ["Metformin", "Insulin", "Lisinopril"],
    allergies: ["None known"],
    labResults: [
      { test: "HbA1c", value: "8.5%", normal: "<7%", status: "high" },
      { test: "Glucose", value: "220 mg/dL", normal: "70-140 mg/dL", status: "high" },
    ],
  },
]

export const arthritisPatients = [
  {
    id: 6,
    name: "Michael Wilson",
    age: 72,
    riskScore: 55,
    riskLevel: "Medium",
    lastVisit: "2024-01-11",
    condition: "Rheumatoid Arthritis",
    vitals: { bp: "125/80", hr: 70, temp: 98.3 },
    contact: { phone: "(555) 678-9012", email: "michael.w@email.com" },
    medicalHistory: ["RA", "Osteoporosis", "GERD"],
    medications: ["Methotrexate", "Prednisone", "Calcium"],
    allergies: ["NSAIDs"],
    labResults: [
      { test: "ESR", value: "45 mm/hr", normal: "<20 mm/hr", status: "high" },
      { test: "CRP", value: "8.2 mg/L", normal: "<3 mg/L", status: "high" },
    ],
  },
]
