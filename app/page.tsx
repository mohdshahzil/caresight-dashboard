"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Shield, BarChart3, Users, Brain, Heart, Activity, Stethoscope, Play, X } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CareSight</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#why" className="text-muted-foreground hover:text-foreground transition-colors">
              Why It Matters
            </a>
          </nav>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent border-accent/20">
            AI-Powered Healthcare Analytics
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            CareSight – AI-Driven Risk Prediction for <span className="text-primary">Chronic Care Patients</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            See risks early. Act with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setShowVideoModal(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* About CareSight */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About CareSight</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              CareSight empowers healthcare professionals with AI-driven insights to predict and prevent complications
              in chronic care patients, enabling proactive interventions that save lives.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Transforming Patient Care</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Predictive Analytics</h4>
                    <p className="text-muted-foreground">
                      Advanced AI models analyze patient data to identify risk patterns before complications arise.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Clinical Intelligence</h4>
                    <p className="text-muted-foreground">
                      Evidence-based recommendations tailored to each patient's unique health profile.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Activity className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Real-time Monitoring</h4>
                    <p className="text-muted-foreground">
                      Continuous assessment of patient vitals and lab results for immediate alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">85%</div>
                  <div className="text-sm text-muted-foreground">Risk Prediction Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">40%</div>
                  <div className="text-sm text-muted-foreground">Reduction in Readmissions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Continuous Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Healthcare Providers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Comprehensive tools designed specifically for healthcare professionals managing chronic care patients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Risk Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive view of patient risk scores across multiple chronic conditions with interactive
                  visualizations.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Patient Cohort Management</CardTitle>
                <CardDescription>
                  Organize and monitor patient groups by condition type: Maternal Care, Cardiovascular, Diabetes, and
                  Arthritis.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Explainability</CardTitle>
                <CardDescription>
                  Understand why patients are at risk with clear, clinician-friendly explanations of AI predictions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Early Warning System</CardTitle>
                <CardDescription>
                  Automated alerts for high-risk patients with recommended interventions and next steps.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Vital Trends Monitoring</CardTitle>
                <CardDescription>
                  Track patient vitals and lab results over time with predictive trend analysis.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Clinical Decision Support</CardTitle>
                <CardDescription>
                  Evidence-based recommendations and treatment pathways tailored to individual patient profiles.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section id="why" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Why It Matters</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">2.6M</div>
              <div className="text-muted-foreground">Preventable hospital readmissions annually</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">$15B</div>
              <div className="text-muted-foreground">Healthcare costs from chronic disease complications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">60%</div>
              <div className="text-muted-foreground">Of adverse events are preventable with early intervention</div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground text-pretty">
            CareSight transforms reactive healthcare into proactive care, helping clinicians identify at-risk patients
            before complications occur, ultimately saving lives and reducing healthcare costs.
          </p>
        </div>
      </section>

      {/* Contact section removed for hackathon version */}

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">CareSight</span>
              </div>
              <p className="text-muted-foreground text-sm">AI-driven risk prediction for better patient outcomes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 CareSight. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Video Demo Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                CareSight Demo
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/UW0U5jUQNsE?autoplay=1&rel=0&modestbranding=1"
              title="CareSight Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
