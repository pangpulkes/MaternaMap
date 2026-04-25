"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import type { StateData, NGOInputs } from "@/lib/types"

interface IntakeFormProps {
  stateData: StateData[]
  onSubmit: (inputs: NGOInputs) => void
}

const BUDGET_OPTIONS = [
  { value: "under-50l", label: "Under ₹50 lakhs" },
  { value: "50l-1cr", label: "₹50L – ₹1 crore" },
  { value: "1cr-5cr", label: "₹1 – 5 crore" },
  { value: "above-5cr", label: "Above ₹5 crore" },
]

const INTERVENTION_OPTIONS = [
  "Equipment upgrade",
  "Staff training",
  "Mobile maternity unit",
  "New facility",
  "Referral network",
]

const TIMELINE_OPTIONS = [
  { value: "under-6m", label: "Under 6 months" },
  { value: "6m-12m", label: "6 – 12 months" },
  { value: "1y-3y", label: "1 – 3 years" },
]

const GOAL_OPTIONS = [
  { value: "reduce-mortality", label: "Reduce maternal mortality" },
  { value: "increase-coverage", label: "Increase verified facility coverage" },
  { value: "build-referrals", label: "Build referral networks" },
]

export function IntakeForm({ stateData, onSubmit }: IntakeFormProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [interventions, setInterventions] = useState<string[]>([])
  const [timeline, setTimeline] = useState("")
  const [goal, setGoal] = useState("")

  const states = stateData.map((s) => s.state).sort()

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    )
  }

  const toggleIntervention = (intervention: string) => {
    setInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention]
    )
  }

  const isValid = selectedStates.length > 0 && budget && interventions.length > 0 && timeline && goal

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({
        states: selectedStates,
        budget,
        interventions,
        timeline,
        goal,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a2e1a] text-white px-6 py-8">
        <h1 className="text-2xl font-bold leading-tight mb-2">Maternal Emergency Desert Map</h1>
        <p className="text-sm text-white/70">AI-powered resource allocation for NGO planners</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-8">
          {/* States Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Which states do you operate in?
            </label>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedStates.includes(state)
                      ? "bg-[#639922] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#639922]"
                  }`}
                >
                  {selectedStates.includes(state) && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              What is your budget?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBudget(option.value)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    budget === option.value
                      ? "bg-[#639922] text-white shadow-lg"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#639922]"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interventions Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              What interventions can you fund?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERVENTION_OPTIONS.map((intervention) => (
                <button
                  key={intervention}
                  onClick={() => toggleIntervention(intervention)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    interventions.includes(intervention)
                      ? "bg-[#639922] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#639922]"
                  }`}
                >
                  {interventions.includes(intervention) && (
                    <Check className="w-3.5 h-3.5 inline mr-1" />
                  )}
                  {intervention}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              What is your timeline?
            </label>
            <div className="flex gap-3">
              {TIMELINE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeline(option.value)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    timeline === option.value
                      ? "bg-[#639922] text-white shadow-lg"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#639922]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              What is your primary goal?
            </label>
            <div className="space-y-2">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoal(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    goal === option.value
                      ? "bg-[#639922] text-white shadow-lg"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#639922]"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
            isValid
              ? "bg-[#639922] text-white hover:bg-[#537a1c] shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Generate Intervention Plan
        </button>
      </div>
    </div>
  )
}
