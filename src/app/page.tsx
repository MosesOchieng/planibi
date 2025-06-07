'use client'

import { useState } from 'react'
import WelcomeScreen from '@/components/WelcomeScreen'
import DestinationSelector from '@/components/dashboard/DestinationSelector'
import { TravelContext } from '@/lib/ai'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [travelContext, setTravelContext] = useState<TravelContext>({
    destination: '',
    dates: { start: null, end: null },
    preferences: [],
    budget: { amount: 0, currency: 'USD' }
  })

  const handleGetStarted = () => {
    setShowWelcome(false)
  }

  const handleUpdate = (updates: Partial<TravelContext>) => {
    setTravelContext(prev => ({ ...prev, ...updates }))
  }

  const handleComplete = () => {
    // Handle completion
    console.log('Travel planning completed:', travelContext)
  }

  const handleAIResponse = (response: any) => {
    // Handle AI responses
    console.log('AI Response:', response)
    }

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DestinationSelector
        context={travelContext}
        onUpdate={handleUpdate}
        onComplete={handleComplete}
        onAIResponse={handleAIResponse}
      />
    </main>
  )
} 