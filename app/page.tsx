"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { IntakeForm } from "@/components/intake-form"
import { LoadingScreen } from "@/components/loading-screen"
import { Dashboard } from "@/components/dashboard"
import { Header } from "@/components/header"
import { BottomSheet } from "@/components/bottom-sheet"
import { ChatPopup } from "@/components/chat-popup"
import type { Facility, StateData, NGOInputs } from "@/lib/types"

// Dynamically import the map to avoid SSR issues with Leaflet
const FacilityMap = dynamic(() => import("@/components/facility-map").then((mod) => mod.FacilityMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

type AppStage = "intake" | "loading" | "output"
type ViewMode = "dashboard" | "map"

export default function Home() {
  const [appStage, setAppStage] = useState<AppStage>("intake")
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [ngoInputs, setNgoInputs] = useState<NGOInputs | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [stateData, setStateData] = useState<StateData[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRatings, setUserRatings] = useState<Record<string, { recommend: boolean; tags: string[] }>>({})
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/facilities").then((res) => res.json()),
      fetch("/desert_state.json").then((res) => res.json()),
    ])
      .then(([facilitiesData, stateDataRes]) => {
        if (Array.isArray(facilitiesData)) {
          setFacilities(facilitiesData)
        }
        if (Array.isArray(stateDataRes)) {
          setStateData(stateDataRes)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setIsLoading(false)
      })
  }, [])

  // Filter facilities and state data based on NGO's selected states
  const filteredStateData = ngoInputs
    ? stateData.filter((s) => ngoInputs.states.includes(s.state))
    : stateData

  const relevantFacilities = ngoInputs
    ? facilities.filter((f) => ngoInputs.states.includes(f.state))
    : facilities

  const filteredFacilities = selectedState
    ? relevantFacilities.filter((f) => f.state === selectedState)
    : relevantFacilities

  useEffect(() => {
    if (selectedState && relevantFacilities.length > 0) {
      const facilitiesInState = relevantFacilities.filter((f) => f.state === selectedState)
      if (facilitiesInState.length === 1) {
        setSelectedFacility(facilitiesInState[0])
      }
    }
  }, [selectedState, relevantFacilities])

  const handleIntakeSubmit = (inputs: NGOInputs) => {
    setNgoInputs(inputs)
    setAppStage("loading")
  }

  const handleLoadingComplete = () => {
    setAppStage("output")
  }

  const handleRatingChange = (facilityId: string, recommend: boolean, tags: string[]) => {
    setUserRatings((prev) => ({
      ...prev,
      [facilityId]: { recommend, tags },
    }))
  }

  const handleStateSelect = (state: StateData) => {
    setSelectedState(state.state)
    setMapCenter({ lat: state.latitude, lng: state.longitude, zoom: 7 })
    setViewMode("map")
  }

  const handleBackToDashboard = () => {
    setViewMode("dashboard")
    setSelectedState("")
    setSelectedFacility(null)
    setMapCenter(null)
  }

  // Calculate metrics for selected states
  const totalFacilities = relevantFacilities.length || 0
  const verifiedCount = relevantFacilities.filter((f) => f.trust_score > 0.7).length || 0
  const gapsCount = relevantFacilities.filter((f) => f.trust_score < 0.4).length || 0
  const citiesWithZeroCoverage = new Set(
    relevantFacilities
      .filter((f) => f.trust_score < 0.4)
      .map((f) => f.city)
  ).size

  // Show initial loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading data...</div>
      </div>
    )
  }

  // Intake Form
  if (appStage === "intake") {
    return (
      <div className="h-screen w-full max-w-[480px] mx-auto bg-white overflow-hidden">
        <IntakeForm stateData={stateData} onSubmit={handleIntakeSubmit} />
      </div>
    )
  }

  // Loading Screen
  if (appStage === "loading" && ngoInputs) {
    return (
      <div className="h-screen w-full max-w-[480px] mx-auto bg-white overflow-hidden">
        <LoadingScreen
          selectedStates={ngoInputs.states}
          onComplete={handleLoadingComplete}
        />
      </div>
    )
  }

  // Output: Dashboard + Map
  return (
    <div className="h-screen w-full max-w-[480px] mx-auto flex flex-col bg-white">
      {viewMode === "dashboard" ? (
        <Dashboard
          stateData={filteredStateData}
          totalFacilities={totalFacilities}
          verifiedCount={verifiedCount}
          gapsCount={gapsCount}
          citiesWithZeroCoverage={citiesWithZeroCoverage}
          onViewMap={() => setViewMode("map")}
          onSelectState={handleStateSelect}
        />
      ) : (
        <>
          <Header
            facilities={relevantFacilities}
            selectedState={selectedState}
            onStateChange={setSelectedState}
            onBackToDashboard={handleBackToDashboard}
          />
          <div className="flex-1 relative">
            <FacilityMap
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              onResetMap={() => setSelectedFacility(null)}
              initialCenter={mapCenter}
              stateData={filteredStateData}
            />
          </div>
          <BottomSheet
            facility={selectedFacility}
            onClose={() => setSelectedFacility(null)}
            userRatings={userRatings}
            onRatingChange={handleRatingChange}
          />
        </>
      )}
      <ChatPopup selectedFacility={selectedFacility} ngoInputs={ngoInputs} />
    </div>
  )
}
