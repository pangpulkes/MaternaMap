"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  selectedStates: string[]
  onComplete: () => void
}

export function LoadingScreen({ selectedStates, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0)

  const stages = [
    "Analyzing 1,180 facilities across your selected states...",
    `Calculating coverage gaps in ${selectedStates.slice(0, 3).join(", ")}${selectedStates.length > 3 ? "..." : ""}`,
    "Identifying investment priorities...",
    "Generating intervention recommendations...",
  ]

  useEffect(() => {
    const duration = 3000
    const interval = 50
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 200)
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length)
    }, 800)

    return () => clearInterval(stageInterval)
  }, [stages.length])

  return (
    <div className="min-h-screen bg-[#1a2e1a] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#639922] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-semibold text-center mb-2">
          Resource Planning Agent
        </h2>
        <p className="text-white/70 text-sm text-center mb-8">
          {stages[stage]}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#639922] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-white/50 text-xs text-center">
          {Math.round(progress)}% complete
        </p>

        {/* Selected States */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {selectedStates.map((state) => (
            <span
              key={state}
              className="px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs"
            >
              {state}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
