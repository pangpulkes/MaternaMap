"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, GeoJSON, useMap } from "react-leaflet"
import { Map, Layers } from "lucide-react"
import type { Facility, StateData } from "@/lib/types"
import type { Feature, FeatureCollection, Geometry } from "geojson"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Default map center and zoom for India
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5
const SELECTED_ZOOM = 14

const INDIA_GEOJSON_URL = "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson"

type MapViewMode = "heatmap" | "facilities"

interface FacilityMapProps {
  facilities: Facility[]
  selectedFacility: Facility | null
  onSelectFacility: (facility: Facility) => void
  onResetMap?: () => void
  initialCenter?: { lat: number; lng: number; zoom: number } | null
  stateData?: StateData[]
}

// State name mapping for matching GeoJSON names to our data
const STATE_NAME_MAP: Record<string, string> = {
  "Andhra Pradesh": "Andhra Pradesh",
  "Arunachal Pradesh": "Arunachal Pradesh",
  "Assam": "Assam",
  "Bihar": "Bihar",
  "Chhattisgarh": "Chhattisgarh",
  "Goa": "Goa",
  "Gujarat": "Gujarat",
  "Haryana": "Haryana",
  "Himachal Pradesh": "Himachal Pradesh",
  "Jharkhand": "Jharkhand",
  "Karnataka": "Karnataka",
  "Kerala": "Kerala",
  "Madhya Pradesh": "Madhya Pradesh",
  "Maharashtra": "Maharashtra",
  "Manipur": "Manipur",
  "Meghalaya": "Meghalaya",
  "Mizoram": "Mizoram",
  "Nagaland": "Nagaland",
  "Odisha": "Odisha",
  "Orissa": "Odisha",
  "Punjab": "Punjab",
  "Rajasthan": "Rajasthan",
  "Sikkim": "Sikkim",
  "Tamil Nadu": "Tamil Nadu",
  "Telangana": "Telangana",
  "Tripura": "Tripura",
  "Uttar Pradesh": "Uttar Pradesh",
  "Uttarakhand": "Uttarakhand",
  "Uttaranchal": "Uttarakhand",
  "West Bengal": "West Bengal",
  "Andaman and Nicobar Islands": "Andaman and Nicobar Islands",
  "Chandigarh": "Chandigarh",
  "Dadra and Nagar Haveli": "Dadra and Nagar Haveli",
  "Daman and Diu": "Daman and Diu",
  "Delhi": "Delhi",
  "NCT of Delhi": "Delhi",
  "Jammu and Kashmir": "Jammu and Kashmir",
  "Jammu & Kashmir": "Jammu and Kashmir",
  "Ladakh": "Ladakh",
  "Lakshadweep": "Lakshadweep",
  "Puducherry": "Puducherry",
  "Pondicherry": "Puducherry",
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
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null)
  const [geoJsonKey, setGeoJsonKey] = useState(0)

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data)
      })
      .catch((err) => {
        console.error("Failed to fetch India GeoJSON:", err)
      })
  }, [])

  // Update GeoJSON key when stateData changes to force re-render
  useEffect(() => {
    setGeoJsonKey((prev) => prev + 1)
  }, [stateData])

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

  // Create a lookup map for state data
  const stateDataMap = new Map<string, StateData>()
  stateData.forEach((s) => {
    stateDataMap.set(s.state.toLowerCase(), s)
  })

  // Style function for GeoJSON
  const getStateStyle = (feature: Feature<Geometry> | undefined) => {
    if (!feature || !feature.properties) {
      return {
        fillColor: "#cccccc",
        weight: 1,
        opacity: 0.8,
        color: "#666666",
        fillOpacity: 0.3,
      }
    }

    const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || ""
    const normalizedName = STATE_NAME_MAP[stateName] || stateName
    const state = stateDataMap.get(normalizedName.toLowerCase())

    if (!state) {
      return {
        fillColor: "#cccccc",
        weight: 1,
        opacity: 0.5,
        color: "#999999",
        fillOpacity: 0.2,
      }
    }

    const color = getHeatmapColor(state.gap_rate)
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: color,
      fillOpacity: 0.6,
    }
  }

  // Event handlers for GeoJSON features
  const onEachFeature = (feature: Feature<Geometry>, layer: L.Layer) => {
    if (!feature.properties) return

    const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || ""
    const normalizedName = STATE_NAME_MAP[stateName] || stateName
    const state = stateDataMap.get(normalizedName.toLowerCase())

    if (state) {
      layer.bindTooltip(
        `<div class="text-center">
          <p class="font-semibold text-sm">${state.state}</p>
          <p class="text-xs text-gray-600">Gap Rate: ${Math.round(state.gap_rate * 100)}%</p>
          <p class="text-xs text-gray-500">${state.total_facilities} facilities</p>
        </div>`,
        { direction: "top", offset: [0, -10], opacity: 1 }
      )
    }

    // Highlight on hover
    layer.on({
      mouseover: (e) => {
        const target = e.target
        target.setStyle({
          weight: 3,
          fillOpacity: 0.8,
        })
        target.bringToFront()
      },
      mouseout: (e) => {
        const target = e.target
        if (state) {
          const color = getHeatmapColor(state.gap_rate)
          target.setStyle({
            weight: 2,
            fillOpacity: 0.6,
            color: color,
          })
        }
      },
    })
  }

  return (
    <div className="relative w-full h-full">
      {/* Top controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
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
                  <span className="w-3 h-3 rounded-sm bg-[#dc2626]" />
                  <span className="text-[10px] text-gray-600">{">"}90%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#f97316]" />
                  <span className="text-[10px] text-gray-600">70-90%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#eab308]" />
                  <span className="text-[10px] text-gray-600">50-70%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#22c55e]" />
                  <span className="text-[10px] text-gray-600">{"<"}50%</span>
                </div>
              </div>
            </div>
          )}
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

        {/* Heatmap view - GeoJSON state polygons */}
        {mapViewMode === "heatmap" && geoJsonData && (
          <GeoJSON
            key={geoJsonKey}
            data={geoJsonData}
            style={getStateStyle}
            onEachFeature={onEachFeature}
          />
        )}

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
