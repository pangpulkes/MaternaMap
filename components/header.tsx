"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import type { Facility } from "@/lib/types"

interface HeaderProps {
  facilities: Facility[]
  selectedState: string
  onStateChange: (state: string) => void
}

export function Header({ facilities, selectedState, onStateChange }: HeaderProps) {
  const states = Array.from(new Set(facilities.map((f) => f.state))).sort()
  const [searchInput, setSearchInput] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(searchInput.toLowerCase())
  )

  const verified = facilities.filter((f) => f.trust_score > 0.7).length
  const uncertain = facilities.filter((f) => f.trust_score >= 0.4 && f.trust_score <= 0.7).length
  const gaps = facilities.filter((f) => f.trust_score < 0.4).length

  const handleStateSelect = (state: string) => {
    onStateChange(state)
    setSearchInput("")
    setShowDropdown(false)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    onStateChange("")
    setShowDropdown(false)
  }

  return (
    <header className="bg-[#1a2e1a] text-white px-4 py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold leading-tight">Maternal Emergency Desert Map</h1>
          <p className="text-xs text-white/70">India · {facilities.length} facilities audited</p>
        </div>
        <div className="relative w-40">
          <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="bg-transparent flex-1 text-sm focus:outline-none placeholder-white/40"
            />
            {(searchInput || selectedState) && (
              <button
                onClick={handleClearSearch}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f1f0f] border border-white/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              <button
                onClick={() => handleStateSelect("")}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${
                  !selectedState ? "bg-white/20 text-[#639922]" : "text-white"
                }`}
              >
                All States
              </button>
              {filteredStates.map((state) => (
                <button
                  key={state}
                  onClick={() => handleStateSelect(state)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${
                    selectedState === state ? "bg-white/20 text-[#639922]" : "text-white"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#639922] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-white" />
          {verified} Verified
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-white" />
          {uncertain} Uncertain
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-white" />
          {gaps} Gaps
        </span>
      </div>
    </header>
  )
}
