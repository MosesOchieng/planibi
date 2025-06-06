'use client'

import { useState } from 'react'
import { TravelContext, AIResponse } from '@/lib/ai'
import { getAIResponse } from '@/lib/ai'
import { ArrowLeftIcon, PlaneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Flight {
  id: string
  airline: string
  price: number
  stops: number
  duration: string
  departure: string
  arrival: string
  class: string
}

interface Props {
  flights: Flight[]
  onSelect: (flight: Flight) => void
  onBack: () => void
  context: TravelContext
  onUpdate: (updates: Partial<TravelContext>) => void
  onComplete: () => void
  onAIResponse: (response: AIResponse) => void
}

export default function FlightSelector({
  flights,
  onSelect,
  onBack,
  context,
  onUpdate,
  onComplete,
  onAIResponse,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await getAIResponse(message, context)
      onAIResponse(response)

      if (response.recommendations.flights?.[0]) {
        onUpdate({
          preferences: {
            ...context.preferences,
            transportation: response.recommendations.flights[0].airline,
          },
        })
        onComplete()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Select Your Flight</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-6">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200"
              onClick={() => onSelect(flight)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Image
                      src={`/airlines/${flight.airline.toLowerCase()}.png`}
                      alt={flight.airline}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <span className="ml-3 text-lg font-semibold">{flight.airline}</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-xl font-semibold">
                    ${flight.price}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {flight.departure}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Departure</div>
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="flex items-center">
                      <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600" />
                      <PlaneIcon className="h-6 w-6 mx-3 text-gray-400" />
                      <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600" />
                    </div>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {flight.duration}
                      {flight.stops > 0 && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {flight.arrival}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Arrival</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="mr-2">Flight {flight.id}</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {flight.class}
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Select Flight
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          How would you like to get there?
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tell me about your flight preferences
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="I prefer direct flights and would like to depart in the morning..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Finding flights...' : 'Find Flights'}
          </button>
        </form>
      </div>
    </div>
  )
} 