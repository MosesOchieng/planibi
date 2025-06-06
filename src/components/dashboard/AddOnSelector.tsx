'use client'

import { useState } from 'react'
import { TravelContext, AIResponse } from '@/lib/ai'
import { getAIResponse } from '@/lib/ai'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface AddOn {
  id: string
  name: string
  price: number
  description: string
  icon: string
}

interface Props {
  addOns: AddOn[]
  onSelect: (addOns: { [key: string]: boolean }) => void
  onBack: () => void
  context: TravelContext
  onUpdate: (updates: Partial<TravelContext>) => void
  onComplete: () => void
  onAIResponse: (response: AIResponse) => void
}

export default function AddOnSelector({
  addOns,
  onSelect,
  onBack,
  context,
  onUpdate,
  onComplete,
  onAIResponse,
}: Props) {
  const [selectedAddOns, setSelectedAddOns] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: !prev[addOnId]
    }))
  }

  const handleConfirm = () => {
    onSelect(selectedAddOns)
  }

  const totalPrice = addOns
    .filter(addOn => selectedAddOns[addOn.id])
    .reduce((sum, addOn) => sum + addOn.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await getAIResponse(message, context)
      onAIResponse(response)

      if (response.recommendations.activities) {
        onUpdate({
          preferences: {
            ...context.preferences,
            activities: response.recommendations.activities.map(
              (activity) => activity.name
            ),
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
        <h2 className="text-xl font-semibold">Travel Add-ons</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src={addOn.icon}
                      alt={addOn.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{addOn.name}</h3>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ${addOn.price}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {addOn.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selectedAddOns[addOn.id] || false}
                        onChange={() => handleAddOnToggle(addOn.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total Add-ons</span>
          <span className="text-green-600 dark:text-green-400 font-semibold">
            ${totalPrice}
          </span>
        </div>
        <button
          onClick={handleConfirm}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Confirm Add-ons
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          What activities would you like to do?
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tell me about your interests and activities you'd like to try
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="I love outdoor activities and cultural experiences..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Finding activities...' : 'Find Activities'}
          </button>
        </form>
      </div>
    </div>
  )
} 