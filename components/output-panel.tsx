"use client"

import { useState } from "react"
import { Download, MapPin, Phone, AlertTriangle, CheckCircle, ChevronRight, Users, Building2, ArrowUpDown, Mountain } from "lucide-react"
import type { Facility, StateData } from "@/lib/types"

interface Recommendation {
  facility: Facility
  interventionType: string
  populationImpact: string
  priority: number
}

interface OutputPanelProps {
  recommendations: Recommendation[]
  selectedFacility: Facility | null
  onSelectFacility: (facility: Facility) => void
  onDownloadBrief: () => void
  extractedStates: string[]
  stateData: StateData[]
  onSelectState?: (state: StateData) => void
}

export function OutputPanel({
  recommendations,
  selectedFacility,
  onSelectFacility,
  onDownloadBrief,
  extractedStates,
  stateData,
  onSelectState,
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"states" | "recommendations" | "details">(
    selectedFacility ? "details" : "states"
  )
  const [sortBy, setSortBy] = useState<"distance" | "gap_rate">("distance")

  // Sort state data based on selected sort method
  const sortedStateData = [...stateData].sort((a, b) => {
    if (sortBy === "distance") {
      return b.avg_nearest_verified_km - a.avg_nearest_verified_km
    }
    return b.gap_rate - a.gap_rate
  })

  // Geographic desert states (high gap rate + extreme distances)
  const geographicDeserts = ["Assam", "Chhattisgarh"]

  const getTrustColor = (score: number) => {
    if (score > 0.7) return "text-[#639922]"
    if (score >= 0.4) return "text-orange-500"
    return "text-red-500"
  }

  const getTrustBg = (score: number) => {
    if (score > 0.7) return "bg-[#639922]"
    if (score >= 0.4) return "bg-orange-500"
    return "bg-red-500"
  }

  const getTrustLabel = (score: number) => {
    if (score > 0.7) return "Verified"
    if (score >= 0.4) return "Uncertain"
    return "Gap"
  }

  // Convert camelCase to human readable
  const formatLabel = (text: string): string => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Output</h2>
          <button
            onClick={onDownloadBrief}
            disabled={recommendations.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a2e1a] text-white rounded-lg hover:bg-[#2a3e2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Brief
          </button>
        </div>
        {extractedStates.length > 0 && (
          <p className="text-xs text-gray-500">
            Filtered to: {extractedStates.join(", ")}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab("states")}
          className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "states"
              ? "text-[#639922] border-b-2 border-[#639922]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Priority States
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "recommendations"
              ? "text-[#639922] border-b-2 border-[#639922]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sites
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "details"
              ? "text-[#639922] border-b-2 border-[#639922]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Details
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "states" ? (
          <div className="p-4">
            {/* Sort Toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Priority Ranking
              </p>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setSortBy("distance")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "distance"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  By Distance
                </button>
                <button
                  onClick={() => setSortBy("gap_rate")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "gap_rate"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  By Gap Rate
                </button>
              </div>
            </div>

            {/* State Cards */}
            <div className="space-y-2">
              {sortedStateData.map((state, index) => {
                const isGeographicDesert = geographicDeserts.includes(state.state)
                const severityColor = state.gap_rate > 0.85
                  ? "bg-red-500"
                  : state.gap_rate > 0.75
                  ? "bg-orange-500"
                  : "bg-yellow-500"
                const severityLabel = state.gap_rate > 0.85
                  ? "CRITICAL"
                  : state.gap_rate > 0.75
                  ? "SEVERE"
                  : "UNDERSERVED"

                return (
                  <button
                    key={state.state}
                    onClick={() => onSelectState?.(state)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">
                            {state.state}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {state.total_facilities} facilities
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${severityColor}`}>
                          {severityLabel}
                        </span>
                        {isGeographicDesert && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                            <Mountain className="w-2.5 h-2.5" />
                            Geographic Desert
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Distance metric */}
                    <div className="mb-2 p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Avg. distance to verified care</span>
                        <span className="font-bold text-gray-900">{state.avg_nearest_verified_km} km</span>
                      </div>
                    </div>

                    {/* Gap rate bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Gap rate</span>
                        <span className="font-medium text-red-600">{Math.round(state.gap_rate * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${state.gap_rate * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : activeTab === "recommendations" ? (
          <div className="p-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">No recommendations yet</p>
                <p className="text-xs text-gray-400">
                  Tell the agent about your organization to receive tailored intervention recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Top {recommendations.length} Recommended Sites
                </p>
                {recommendations.map((rec, index) => (
                  <button
                    key={`${rec.facility.name}-${index}`}
                    onClick={() => {
                      onSelectFacility(rec.facility)
                      setActiveTab("details")
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                      selectedFacility?.name === rec.facility.name
                        ? "border-[#639922] bg-[#639922]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1a2e1a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {rec.facility.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 ml-7">
                          {rec.facility.city}, {rec.facility.state}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="ml-7 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getTrustColor(rec.facility.trust_score)}`}>
                          {Math.round(rec.facility.trust_score * 100)}% trust
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${getTrustBg(rec.facility.trust_score)}`}>
                          {getTrustLabel(rec.facility.trust_score)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Intervention:</span> {rec.interventionType}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{rec.populationImpact}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {!selectedFacility ? (
              <div className="text-center py-8">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">No facility selected</p>
                <p className="text-xs text-gray-400">
                  Click on a map pin or recommendation to view facility details.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedFacility.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedFacility.city}, {selectedFacility.state}
                  </p>
                </div>

                {/* Trust Score */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-500">Trust Score</span>
                    <span className={`text-sm font-bold ${getTrustColor(selectedFacility.trust_score)}`}>
                      {Math.round(selectedFacility.trust_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getTrustBg(selectedFacility.trust_score)}`}
                      style={{ width: `${selectedFacility.trust_score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedFacility.has_emergency_ob ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#639922]/10 text-[#639922] text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Emergency OB
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      No Emergency OB
                    </span>
                  )}
                </div>

                {/* Contact */}
                {selectedFacility.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Contact</p>
                    <a
                      href={`tel:${selectedFacility.phone}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedFacility.phone}
                    </a>
                  </div>
                )}

                {/* Evidence */}
                {selectedFacility.evidence.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Evidence</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFacility.evidence.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
                        >
                          {formatLabel(item)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {selectedFacility.red_flags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      Red Flags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFacility.red_flags.map((flag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs"
                        >
                          {formatLabel(flag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Assessment</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedFacility.reasoning}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#639922] text-white rounded-lg text-sm font-medium hover:bg-[#537a1c] transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
