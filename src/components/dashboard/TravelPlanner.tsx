'use client'

import { useState, useEffect } from 'react'
import { TravelContext, AIResponse } from '@/lib/ai'
import DestinationSelector from './DestinationSelector'
import AccommodationSelector from './AccommodationSelector'
import FlightSelector from './FlightSelector'
import AddOnSelector from './AddOnSelector'
import TripSummary from './TripSummary'
import { motion, AnimatePresence } from 'framer-motion'

const slidingTexts = [
  "Plan Your Trip",
  "Book a Flight",
  "Find Hotels",
  "Explore Destinations",
  "Book Activities",
  "Get Travel Tips"
]

export default function TravelPlanner() {
  const [context, setContext] = useState<TravelContext>({
    destination: '',
    dates: { start: null, end: null },
    budget: 0,
    preferences: {
      accommodation: '',
      activities: [],
      transportation: '',
    },
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [budget, setBudget] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedGuide, setDisplayedGuide] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % slidingTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleContextUpdate = (updates: Partial<TravelContext>) => {
    setContext((prev) => ({ ...prev, ...updates }))
  }

  const handleStepComplete = (step: number) => {
    setCurrentStep(step + 1)
  }

  const handleAIResponse = (response: AIResponse) => {
    setAIResponse(response)
  }

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericBudget = parseFloat(budget.replace(/[^0-9.]/g, ''))
    if (!isNaN(numericBudget)) {
      handleContextUpdate({ budget: numericBudget })
      setIsTyping(true)
      setDisplayedGuide('')
      
      // Simulate AI typing effect
      const guide = `Great! I'll help you plan your trip to ${context.destination} with a budget of $${numericBudget}.\n\n` +
        `Let me search for the best accommodations and activities within your budget...\n\n` +
        `I'll check:\n` +
        `• Hotels and accommodations\n` +
        `• Local activities and attractions\n` +
        `• Transportation options\n` +
        `• Dining recommendations\n\n` +
        `Would you like to proceed with finding accommodations?`
      
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        if (currentIndex < guide.length) {
          setDisplayedGuide(prev => prev + guide[currentIndex])
          currentIndex++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 30)
    }
  }

  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto w-full">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentTextIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"
              >
                {slidingTexts[currentTextIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <div className="flex items-center space-x-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-500 scale-110'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {currentStep === 1 && (
            <DestinationSelector
              context={context}
              onUpdate={handleContextUpdate}
              onComplete={() => handleStepComplete(1)}
              onAIResponse={handleAIResponse}
            />
          )}

          {currentStep === 2 && !context.budget && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                What's your budget for this trip?
              </h2>
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      I'll help you find the best options within your budget. Please enter your total budget for this trip.
                    </p>
                    <form onSubmit={handleBudgetSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Budget
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="text"
                            id="budget"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="0.00"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">USD</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Set Budget
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && context.budget > 0 && (
            <div className="p-6">
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans">
                      {displayedGuide}
                      {isTyping && <span className="animate-pulse">▋</span>}
                    </pre>
                    {!isTyping && (
                      <button
                        onClick={() => handleStepComplete(2)}
                        className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Find Accommodations
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <AccommodationSelector
              context={context}
              onUpdate={handleContextUpdate}
              onComplete={() => handleStepComplete(3)}
              onAIResponse={handleAIResponse}
            />
          )}

          {currentStep === 4 && (
            <FlightSelector
              context={context}
              onUpdate={handleContextUpdate}
              onComplete={() => handleStepComplete(4)}
              onAIResponse={handleAIResponse}
            />
          )}

          {currentStep === 5 && (
            <AddOnSelector
              context={context}
              onUpdate={handleContextUpdate}
              onComplete={() => handleStepComplete(5)}
              onAIResponse={handleAIResponse}
            />
          )}
        </div>

        {/* Trip Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Trip Summary
            </h3>
            <TripSummary context={context} aiResponse={aiResponse} />
          </div>
        </div>
      </div>
    </div>
  )
} 