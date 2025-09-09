"use client"
import { useState, useMemo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { SearchFilters } from "@/components/dashboard/search-filters"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { PatientList } from "@/components/patients/patient-list"
import { PatientDetails } from "@/components/patients/patient-details"
import { CSVUpload } from "@/components/csv/csv-upload"
import { CardiovascularUpload } from "@/components/csv/cardiovascular-upload"
import { DiabetesUpload } from "@/components/csv/diabetes-upload"
import { DiabetesDashboard } from "@/components/diabetes/diabetes-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"

import { maternalCarePatients, cardiovascularPatients, diabetesPatients, arthritisPatients } from "@/lib/patient-data"
import { exportPatientData, refreshPatientData } from "@/app/actions/patient-actions"
import { logError } from "@/lib/error-logger"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("maternal")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortBy, setSortBy] = useState("riskScore")
  const [csvPrediction, setCsvPrediction] = useState<any>(null)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert" as const,
      message: "Sarah Johnson requires immediate attention - Risk score increased to 85%",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "info" as const,
      message: "New lab results available for Robert Smith",
      time: "15 min ago",
    },
    {
      id: 3,
      type: "warning" as const,
      message: "Medication adherence alert for 3 patients",
      time: "1 hour ago",
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getPatientData = (tab: string) => {
    switch (tab) {
      case "maternal":
        return maternalCarePatients
      case "cardiovascular":
        return cardiovascularPatients
      case "diabetes":
        return diabetesPatients
      case "arthritis":
        return arthritisPatients
      default:
        return maternalCarePatients
    }
  }

  const filteredAndSortedPatients = useMemo(() => {
    let patients = getPatientData(activeTab)

    // Filter by search term
    if (searchTerm) {
      patients = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by risk level
    if (riskFilter !== "all") {
      patients = patients.filter((patient) => patient.riskLevel.toLowerCase() === riskFilter)
    }

    // Sort patients
    patients.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "age":
          return b.age - a.age
        case "riskScore":
          return b.riskScore - a.riskScore
        default:
          return 0
      }
    })

    return patients
  }, [activeTab, searchTerm, riskFilter, sortBy])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshPatientData(activeTab)
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to refresh data'), {
        component: 'DashboardPage',
        action: 'refresh-data',
        metadata: { activeTab }
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportPatientData(filteredAndSortedPatients, activeTab)
      if (result.success) {
        const blob = new Blob([result.data], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to export data'), {
        component: 'DashboardPage',
        action: 'export-data',
        metadata: { activeTab, patientCount: filteredAndSortedPatients.length }
      })
    }
  }

  const handleDismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handlePredictionUpdate = (prediction: any) => {
    setCsvPrediction(prediction)
    if (prediction && prediction.prediction) {
      // Add notification for new prediction
      const newNotification = {
        id: Date.now(),
        type: "info" as const,
        message: `New AI prediction: ${prediction.prediction} - Risk assessment completed`,
        time: "Just now",
      }
      setNotifications((prev) => [newNotification, ...prev])
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col lg:flex-row">
          <DashboardSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            notifications={notifications}
            onToggleNotifications={() => setShowNotifications(!showNotifications)}
          />

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-6">
            <DashboardHeader
              notifications={notifications}
              onExport={handleExport}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              showNotifications={showNotifications}
              onToggleNotifications={() => setShowNotifications(!showNotifications)}
            />

            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              riskFilter={riskFilter}
              onRiskFilterChange={setRiskFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <NotificationsPanel
              notifications={notifications}
              showNotifications={showNotifications}
              onClose={() => setShowNotifications(false)}
              onDismiss={handleDismissNotification}
            />

{/* Overview cards removed for diabetes - using dedicated dashboard */}
            {activeTab !== "diabetes" && <OverviewCards patients={filteredAndSortedPatients} />}

            {activeTab === "maternal" && (
              <ErrorBoundary>
                <CSVUpload onPredictionUpdate={handlePredictionUpdate} />
              </ErrorBoundary>
            )}
            {activeTab === "cardiovascular" && (
              <ErrorBoundary>
                <CardiovascularUpload onPredictionUpdate={handlePredictionUpdate} />
              </ErrorBoundary>
            )}
            {activeTab === "diabetes" && (
              <ErrorBoundary>
                <DiabetesDashboard />
              </ErrorBoundary>
            )}

            {/* Patient List and Details - Hidden for diabetes tab */}
            {activeTab !== "diabetes" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <PatientList
                    patients={filteredAndSortedPatients}
                    selectedPatient={selectedPatient}
                    onPatientSelect={setSelectedPatient}
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    riskFilter={riskFilter}
                    onRiskFilterChange={setRiskFilter}
                  />
                </div>

                <div>
                  <PatientDetails patient={selectedPatient} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
