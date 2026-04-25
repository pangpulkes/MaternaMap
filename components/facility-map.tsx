"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Circle, useMap, Tooltip } from "react-leaflet"
import { ArrowLeft, Map, Layers } from "lucide-react"
import type { Facility, StateData } from "@/lib/types"
import "leaflet/dist/leaflet.css"

// Default map center and zoom for India
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5
const SELECTED_ZOOM = 14

type MapViewMode = "heatmap" | "facilities"

interface FacilityMapProps {
  facilities: Facility[]
  selectedFacility: Facility | null
  onSelectFacility: (facility: Facility) => void
  onResetMap?: () => void
  initialCenter?: { lat: number; lng: number; zoom: number } | null
  stateData?: StateData[]
}

function MapUpdater({ 
  selectedFacility, 
  shouldReset, 
  onResetComplete,
  initialCenter,
}: { 
  selectedFacility: Facility | null
  shouldReset: boolean
  onResetComplete: () => void
  initialCenter?: { lat: number; lng: number; zoom: number } | null
}) {
  const map = useMap()
  const prevSelectedRef = useRef<Facility | null>(null)
  const initialCenterApplied = useRef(false)

  useEffect(() => {
    // Apply initial center on first mount if provided
    if (initialCenter && !initialCenterApplied.current) {
      map.flyTo([initialCenter.lat, initialCenter.lng], initialCenter.zoom, {
        duration: 0.5,
      })
      initialCenterApplied.current = true
      return
    }

    if (shouldReset) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, {
        duration: 0.5,
      })
      onResetComplete()
      return
    }

    if (selectedFacility && selectedFacility !== prevSelectedRef.current) {
      map.flyTo([selectedFacility.latitude, selectedFacility.longitude], SELECTED_ZOOM, {
        duration: 0.5,
      })
      prevSelectedRef.current = selectedFacility
    }
  }, [selectedFacility, shouldReset, map, onResetComplete, initialCenter])

  return null
}

// Get heatmap color based on gap rate
function getHeatmapColor(gapRate: number): string {
  if (gapRate > 0.9) return "#dc2626" // dark red
  if (gapRate > 0.7) return "#f97316" // orange
  if (gapRate > 0.5) return "#eab308" // yellow
  return "#22c55e" // green
}

// Get heatmap fill opacity based on gap rate
function getHeatmapOpacity(gapRate: number): number {
  if (gapRate > 0.9) return 0.6
  if (gapRate > 0.7) return 0.5
  if (gapRate > 0.5) return 0.4
  return 0.3
}

export function FacilityMap({ 
  facilities, 
  selectedFacility, 
  onSelectFacility, 
  onResetMap, 
  initialCenter,
  stateData = []
}: FacilityMapProps) {
  const [shouldReset, setShouldReset] = useState(false)
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>("heatmap")
  const [showGaps, setShowGaps] = useState(false)

  const getColor = (score: number) => {
    if (score > 0.7) return "#639922"
    if (score >= 0.4) return "#f97316"
    return "#ef4444"
  }

  const handleResetMap = () => {
    setShouldReset(true)
    onResetMap?.()
  }

  // Filter facilities based on showGaps toggle
  const visibleFacilities = showGaps 
    ? facilities 
    : facilities.filter((f) => f.trust_score >= 0.4)

  return (
    <div className="relative w-full h-full">
      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start justify-between gap-2">
        {/* Left side - Back button */}
        <div>
          {selectedFacility && (
            <button
              onClick={handleResetMap}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to full map
            </button>
          )}
        </div>

        {/* Right side - View toggles */}
        <div className="flex flex-col gap-2 items-end">
          {/* Heatmap / Facilities toggle */}
          <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setMapViewMode("heatmap")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                mapViewMode === "heatmap"
                  ? "bg-[#1a2e1a] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Heatmap
            </button>
            <button
              onClick={() => setMapViewMode("facilities")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                mapViewMode === "facilities"
                  ? "bg-[#1a2e1a] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Facilities
            </button>
          </div>

          {/* Show gaps toggle - only in facilities mode */}
          {mapViewMode === "facilities" && (
            <button
              onClick={() => setShowGaps(!showGaps)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors ${
                showGaps
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGaps ? "bg-white" : "bg-red-500"}`} />
              {showGaps ? "Showing gaps" : "Show gaps"}
            </button>
          )}

          {/* Heatmap legend - only in heatmap mode */}
          {mapViewMode === "heatmap" && (
            <div className="bg-white rounded-lg shadow-lg p-2">
              <p className="text-[10px] font-medium text-gray-500 mb-1.5">Gap Rate</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
                  <span className="text-[10px] text-gray-600">{">"}90%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-[10px] text-gray-600">70-90%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="text-[10px] text-gray-600">50-70%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-[10px] text-gray-600">{"<"}50%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapUpdater 
          selectedFacility={selectedFacility} 
          shouldReset={shouldReset}
          onResetComplete={() => setShouldReset(false)}
          initialCenter={initialCenter}
        />

        {/* Heatmap view - state circles */}
        {mapViewMode === "heatmap" && stateData.map((state) => (
          <Circle
            key={state.state}
            center={[state.latitude, state.longitude]}
            radius={120000} // ~120km radius for visibility
            pathOptions={{
              fillColor: getHeatmapColor(state.gap_rate),
              fillOpacity: getHeatmapOpacity(state.gap_rate),
              color: getHeatmapColor(state.gap_rate),
              weight: 2,
              opacity: 0.8,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div className="text-center">
                <p className="font-semibold text-sm">{state.state}</p>
                <p className="text-xs text-gray-600">Gap Rate: {Math.round(state.gap_rate * 100)}%</p>
                <p className="text-xs text-gray-500">{state.total_facilities} facilities</p>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* Facilities view - individual dots */}
        {mapViewMode === "facilities" && visibleFacilities.map((facility) => {
          const isSelected = selectedFacility?.name === facility.name && selectedFacility?.city === facility.city
          return (
            <CircleMarker
              key={`${facility.name}-${facility.latitude}-${facility.longitude}`}
              center={[facility.latitude, facility.longitude]}
              radius={isSelected ? 14 : 8}
              pathOptions={{
                fillColor: getColor(facility.trust_score),
                fillOpacity: 0.9,
                color: isSelected ? "#639922" : getColor(facility.trust_score),
                weight: isSelected ? 3 : 1,
              }}
              className={isSelected ? "selected-pin" : ""}
              eventHandlers={{
                click: () => onSelectFacility(facility),
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
