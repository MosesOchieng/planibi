'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TravelContext, AIResponse } from '@/lib/ai'

interface BookingAccommodation {
  hotel_id: string
  name: string
  type: string
  location: {
    city: string
    address: string
  }
  price: {
    amount: number
    currency: string
  }
  rating: number
  images: string[]
  amenities: string[]
  description: string
  booking_url: string
}

interface Accommodation {
  id: string
  name: string
  type: string
  location: string
  price: string
  rating: number
  image: string
  amenities: string[]
  description: string
  bookingUrl: string
}

interface AccommodationSelectorProps {
  context: TravelContext
  onUpdate: (updates: Partial<TravelContext>) => void
  onComplete: () => void
  onAIResponse: (response: AIResponse) => void
}

interface BudgetRange {
  min: number
  max: number
  label: string
  description: string
}

interface DestinationInfo {
  name: string
  budgetRanges: BudgetRange[]
  popularActivities: string[]
  bestTimeToVisit: string
  averageRating: number
}

const destinationData: Record<string, DestinationInfo> = {
  'Bali': {
    name: 'Bali',
    budgetRanges: [
      { min: 0, max: 50, label: 'Budget', description: 'Hostels and local guesthouses' },
      { min: 50, max: 150, label: 'Mid-range', description: 'Boutique hotels and villas' },
      { min: 150, max: 500, label: 'Luxury', description: '5-star resorts and private villas' }
    ],
    popularActivities: ['Beach hopping', 'Temple visits', 'Rice terrace trekking', 'Surfing'],
    bestTimeToVisit: 'April to October',
    averageRating: 4.7
  },
  'Paris': {
    name: 'Paris',
    budgetRanges: [
      { min: 0, max: 100, label: 'Budget', description: 'Hostels and budget hotels' },
      { min: 100, max: 300, label: 'Mid-range', description: 'Boutique hotels' },
      { min: 300, max: 1000, label: 'Luxury', description: '5-star hotels and luxury apartments' }
    ],
    popularActivities: ['Museum visits', 'Eiffel Tower', 'Seine River cruise', 'Shopping'],
    bestTimeToVisit: 'April to June, September to October',
    averageRating: 4.8
  }
}

const emojis = ['😊', '🌴', '🏖️', '🏔️', '🌆', '🏛️', '🎡', '🍽️', '🛍️', '🎭', '🏨', '✈️']

export default function AccommodationSelector({ context, onUpdate, onComplete, onAIResponse }: AccommodationSelectorProps) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedGuide, setDisplayedGuide] = useState('')
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', message: string }>>([
    {
      type: 'assistant',
      message: "I can help you find the perfect destination based on your preferences. Just let me know what you're looking for!"
    }
  ])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isInitialTyping, setIsInitialTyping] = useState(true)
  const [displayedWelcomeMessage, setDisplayedWelcomeMessage] = useState('')
  const [showInteractiveElements, setShowInteractiveElements] = useState(false)

  const destinationPrompts = [
    { text: "🌴 Beach destinations", query: "I'm looking for beach destinations" },
    { text: "🏔️ Mountain getaways", query: "I'm interested in mountain destinations" },
    { text: "🏛️ Cultural cities", query: "I want to explore cultural cities" },
    { text: "🌆 Urban adventures", query: "I'm looking for urban destinations" },
    { text: "🏖️ Island escapes", query: "I want to visit islands" }
  ]

  const handleEmojiSelect = (emoji: string) => {
    setUserMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
    
    // Add file message to chat
    const fileMessage = files.map(file => `📎 ${file.name}`).join('\n')
    setChatHistory(prev => [...prev, { type: 'user', message: fileMessage }])
  }

  const handleSendMessage = () => {
    if (!userMessage.trim()) return

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }])
    setUserMessage('')

    // Generate AI response based on message content
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      const destination = context.destination
      const budget = context.budget

      if (destination && destinationData[destination]) {
        const info = destinationData[destination]
        const budgetRange = info.budgetRanges.find(range => 
          budget >= range.min && budget <= range.max
        )

        response = `Based on your budget of $${budget}, I can suggest some great options in ${destination}:\n\n` +
          `💰 Budget Range: ${budgetRange?.label || 'Custom'}\n` +
          `📝 ${budgetRange?.description || 'Custom accommodations'}\n\n` +
          `🎯 Popular Activities:\n${info.popularActivities.map(activity => `• ${activity}`).join('\n')}\n\n` +
          `📅 Best Time to Visit: ${info.bestTimeToVisit}\n` +
          `⭐ Average Rating: ${info.averageRating}/5\n\n` +
          `Would you like me to show you some specific accommodations in this range?`
      } else {
        response = `I understand you're interested in ${userMessage}. Let me search for the perfect accommodations for you...`
      }

      setChatHistory(prev => [...prev, { type: 'assistant', message: response }])
      setIsTyping(false)
    }, 1000)
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  // Welcome message typing effect
  useEffect(() => {
    const welcomeMessage = "I can help you find the perfect destination based on your preferences. Just let me know what you're looking for! 🌍"
    let currentIndex = 0

    const typingInterval = setInterval(() => {
      if (currentIndex < welcomeMessage.length) {
        setDisplayedWelcomeMessage(prev => prev + welcomeMessage[currentIndex])
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setIsInitialTyping(false)
        setShowInteractiveElements(true)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [])

  // Helper function to generate mock data as fallback
  const generateMockAccommodations = (budget: number): Accommodation[] => {
    const nightlyBudget = budget / 7
    const luxuryPrice = Math.min(nightlyBudget * 0.6, 500)
    const midRangePrice = Math.min(nightlyBudget * 0.4, 300)
    const budgetPrice = Math.min(nightlyBudget * 0.25, 150)

    return [
      {
        id: '1',
        name: 'Grand Hotel',
        type: 'Luxury Hotel',
        location: 'City Center',
        price: `$${Math.round(luxuryPrice)}/night`,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Gym', 'Concierge', 'Valet Parking'],
        description: 'Luxurious hotel in the heart of the city with stunning views and premium amenities.',
        bookingUrl: 'https://booking.com'
      },
      {
        id: '2',
        name: 'Cozy Boutique Hotel',
        type: 'Boutique Hotel',
        location: 'Historic District',
        price: `$${Math.round(midRangePrice)}/night`,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        amenities: ['Free WiFi', 'Breakfast', 'Bar', 'Room Service', 'Business Center'],
        description: 'Charming boutique hotel with unique design and personalized service.',
        bookingUrl: 'https://booking.com'
      },
      {
        id: '3',
        name: 'Seaside Resort',
        type: 'Resort',
        location: 'Beachfront',
        price: `$${Math.round(luxuryPrice * 0.9)}/night`,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        amenities: ['Private Beach', 'Multiple Pools', 'Spa', 'Water Sports', 'Multiple Restaurants', 'Kids Club'],
        description: 'Exclusive beachfront resort with private beach access and luxury amenities.',
        bookingUrl: 'https://booking.com'
      },
      {
        id: '4',
        name: 'Mountain View Lodge',
        type: 'Lodge',
        location: 'Mountain Area',
        price: `$${Math.round(budgetPrice)}/night`,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        amenities: ['Scenic Views', 'Hiking Trails', 'Restaurant', 'Fireplace', 'Free Parking'],
        description: 'Rustic lodge with breathtaking mountain views and outdoor activities.',
        bookingUrl: 'https://booking.com'
      }
    ]
  }

  useEffect(() => {
    const fetchAccommodations = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Calculate check-in and check-out dates (7 days stay)
        const checkIn = new Date()
        const checkOut = new Date()
        checkOut.setDate(checkOut.getDate() + 7)

        // Format dates for API
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0]
        }

        // Booking.com API endpoint
        const apiUrl = `https://booking-com.p.rapidapi.com/v1/hotels/search?units=metric&room_number=1&checkout_date=${formatDate(checkOut)}&checkin_date=${formatDate(checkIn)}&adults_number=2&order_by=popularity&filter_by_currency=USD&locale=en-us&dest_type=city&dest_id=${context.destination}&page_number=0&categories_filter_ids=class%3A%3A2%2Cclass%3A%3A4%2Cfree_cancellation%3A%3A1&include_adjacency=true`

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch accommodations')
        }

        const data = await response.json()
        
        // Transform Booking.com data to our format
        const transformedAccommodations: Accommodation[] = data.result.map((hotel: BookingAccommodation) => ({
          id: hotel.hotel_id,
          name: hotel.name,
          type: hotel.type || 'Hotel',
          location: `${hotel.location.city}, ${hotel.location.address}`,
          price: `$${Math.round(hotel.price.amount)}/night`,
          rating: hotel.rating || 0,
          image: hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          amenities: hotel.amenities || [],
          description: hotel.description || 'No description available',
          bookingUrl: hotel.booking_url
        }))

        // Filter accommodations based on budget
        const nightlyBudget = context.budget / 7
        const filteredAccommodations = transformedAccommodations.filter(acc => {
          const price = parseFloat(acc.price.replace(/[^0-9.]/g, ''))
          return price <= nightlyBudget
        })

        setAccommodations(filteredAccommodations)
      } catch (error) {
        console.error('Error fetching accommodations:', error)
        setError('Failed to fetch accommodations. Please try again later.')
        
        // Fallback to mock data if API fails
        const mockData = generateMockAccommodations(context.budget)
        setAccommodations(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    if (context.destination && context.budget > 0) {
      fetchAccommodations()
    }
  }, [context.destination, context.budget])

  const handleAccommodationSelect = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    setIsTyping(true)
    setDisplayedGuide('')
    onUpdate({ preferences: { ...context.preferences, accommodation: accommodation.name } })
    
    // Enhanced AI typing effect with better formatting
    const guide = `I've found a perfect place for your stay in ${context.destination}! 🎉\n\n` +
      `🏨 ${accommodation.name}\n` +
      `📍 Location: ${accommodation.location}\n` +
      `💰 Price: ${accommodation.price}\n` +
      `⭐ Rating: ${accommodation.rating}/5\n\n` +
      `✨ Top Amenities:\n${accommodation.amenities.slice(0, 5).map(a => `• ${a}`).join('\n')}\n\n` +
      `📝 About:\n${accommodation.description}\n\n` +
      `Would you like to book this accommodation? I can help you with the reservation process!`
    
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

  const handleConfirm = () => {
    if (selectedAccommodation) {
      onComplete()
    }
  }

  const handlePromptClick = (query: string) => {
    setUserMessage(query)
    handleSendMessage()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Where would you like to go?
        </motion.h2>
        
        {/* Enhanced Chat Section */}
        <div className="mb-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="space-y-4 mb-4 max-h-[300px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            <AnimatePresence>
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100
                  }}
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      chat.type === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md'
                    }`}
                  >
                    {chat.type === 'assistant' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center mb-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-2">
                          <span className="text-white text-xs">AI</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Travel Assistant</span>
                      </motion.div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{chat.message}</p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs">AI</span>
                    </div>
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{
                          y: [0, -4, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                      <motion.div
                        animate={{
                          y: [0, -4, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.2
                        }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                      <motion.div
                        animate={{
                          y: [0, -4, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.4
                        }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Interactive Elements */}
          <AnimatePresence>
            {showInteractiveElements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  {destinationPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: 0.1 * index }
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePromptClick(prompt.query)}
                      className="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {prompt.text}
                    </motion.button>
                  ))}
                </div>

                {/* Message Input */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex space-x-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      😊
                    </motion.button>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {emojis.map((emoji, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!userMessage.trim()}
                    className="px-4 py-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Horizontal scrolling container for accommodation cards */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex space-x-6 pb-4 overflow-x-auto snap-x snap-mandatory">
              {accommodations.map((accommodation) => (
                <motion.div
                  key={accommodation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAccommodationSelect(accommodation)}
                  className={`flex-shrink-0 w-80 snap-center bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 ${
                    selectedAccommodation?.id === accommodation.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="relative h-48">
                    <img
                      src={accommodation.image}
                      alt={accommodation.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold">{accommodation.name}</h3>
                      <p className="text-sm opacity-90">{accommodation.type}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {accommodation.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {accommodation.price}
                      </span>
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(accommodation.rating))}
                        {'☆'.repeat(5 - Math.floor(accommodation.rating))}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {accommodations.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 