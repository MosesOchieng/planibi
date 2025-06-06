'use client'

import { ArrowLeftIcon, CalendarIcon, DownloadIcon, ShareIcon } from '@heroicons/react/24/outline'
import { TravelContext, AIResponse } from '@/lib/ai'

interface Props {
  context: TravelContext
  aiResponse: AIResponse | null
  onBack: () => void
}

export default function TripSummary({ context, aiResponse, onBack }: Props) {
  if (!aiResponse) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Trip Summary</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Trip Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start planning your trip to see recommendations here.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const {
    destination,
    dates,
    selectedAccommodation,
    selectedFlight,
    addOns,
    budget
  } = context

  const calculateTotal = () => {
    let total = 0
    if (selectedAccommodation) {
      total += selectedAccommodation.price * selectedAccommodation.nights
    }
    if (selectedFlight) {
      total += selectedFlight.price
    }
    if (addOns) {
      // Add the price of selected add-ons
      Object.entries(addOns).forEach(([key, selected]) => {
        if (selected) {
          // You would need to map the add-on keys to their prices
          // This is a simplified version
          total += 10 // Example price for each add-on
        }
      })
    }
    return total
  }

  const total = calculateTotal()
  const remaining = (budget || 0) - total

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Trip Summary</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* Trip Overview */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Trip to {destination}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mt-2">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>
                      {dates?.start} - {dates?.end}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Download
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedFlight && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Flight</h4>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      ${selectedFlight.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedFlight.airline}
                  </p>
                </div>
              )}

              {selectedAccommodation && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Accommodation</h4>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      ${selectedAccommodation.price * selectedAccommodation.nights}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedAccommodation.name}
                  </p>
                </div>
              )}

              {addOns && Object.entries(addOns).map(([key, selected]) => (
                selected && (
                  <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        $10
                      </span>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Budget Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Total Cost</h4>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${total}
                </span>
              </div>
              {budget && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Remaining Budget</span>
                  <span className={`font-semibold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${remaining}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 