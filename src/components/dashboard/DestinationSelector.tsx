'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobeAltIcon, SunIcon, CalendarIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { TravelContext, AIResponse } from '@/lib/ai'

interface Destination {
  name: string
  country: string
  description: string
  image: string
  climate: string
  bestTimeToVisit: string
  currency: string
  language: string
  timeZone: string
  highlights: string[]
  averageCost: {
    accommodation: string
    food: string
    activities: string
  }
  weather: {
    summer: string
    winter: string
  }
  visaInfo: string
  safety: string
  localTips: string[]
  type: string[]
}

interface SearchResult {
  destinations: Destination[]
  totalResults: number
  searchQuery: string
}

// Add new interfaces for scraped data
interface ScrapedDestination {
  name: string
  country: string
  description: string
  image: string
  type: string[]
  rating: number
  reviews: number
  priceRange: string
  bestTimeToVisit: string
  weather: {
    summer: string
    winter: string
  }
  highlights: string[]
  source: string
  url: string
}

interface ScrapingResult {
  destinations: ScrapedDestination[]
  totalResults: number
  sources: string[]
}

const destinationCategories = {
  beach: ['beach', 'coastal', 'island', 'tropical', 'seaside', 'ocean'],
  mountain: ['mountain', 'alpine', 'hiking', 'skiing', 'snow', 'peak'],
  cultural: ['cultural', 'historic', 'museum', 'temple', 'heritage', 'ancient'],
  urban: ['city', 'urban', 'metropolitan', 'downtown', 'nightlife'],
  nature: ['nature', 'wildlife', 'forest', 'park', 'garden', 'eco']
}

const mockDestinations: Destination[] = [
  {
    name: 'Paris',
    country: 'France',
    description: 'The City of Light, known for its iconic Eiffel Tower, world-class museums, and romantic atmosphere.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    climate: 'Temperate',
    bestTimeToVisit: 'April to June, September to October',
    currency: 'Euro (€)',
    language: 'French',
    timeZone: 'CET (UTC+1)',
    highlights: [
      'Eiffel Tower',
      'Louvre Museum',
      'Notre-Dame Cathedral',
      'Champs-Élysées',
      'Montmartre'
    ],
    averageCost: {
      accommodation: '€150-300/night',
      food: '€30-50/day',
      activities: '€50-100/day'
    },
    weather: {
      summer: 'Warm (20-25°C)',
      winter: 'Cold (5-10°C)'
    },
    visaInfo: 'Schengen visa required for non-EU citizens',
    safety: 'Generally safe, but beware of pickpockets in tourist areas',
    localTips: [
      'Learn basic French phrases',
      'Book museum tickets in advance',
      'Use the Metro for transportation',
      'Visit cafes for authentic experience',
      'Avoid restaurants near major attractions'
    ],
    type: ['urban', 'cultural']
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    description: 'A vibrant metropolis where traditional culture meets cutting-edge technology.',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    climate: 'Humid subtropical',
    bestTimeToVisit: 'March to May, September to November',
    currency: 'Japanese Yen (¥)',
    language: 'Japanese',
    timeZone: 'JST (UTC+9)',
    highlights: [
      'Senso-ji Temple',
      'Shibuya Crossing',
      'Tokyo Skytree',
      'Tsukiji Outer Market',
      'Meiji Shrine'
    ],
    averageCost: {
      accommodation: '¥15,000-30,000/night',
      food: '¥3,000-5,000/day',
      activities: '¥5,000-10,000/day'
    },
    weather: {
      summer: 'Hot and humid (25-35°C)',
      winter: 'Cool (5-15°C)'
    },
    visaInfo: 'Visa-free for many countries, check requirements',
    safety: 'Very safe, one of the safest cities in the world',
    localTips: [
      'Get a PASMO/Suica card',
      'Learn basic Japanese etiquette',
      'Try local convenience stores',
      'Use Google Maps for navigation',
      'Visit during cherry blossom season'
    ],
    type: ['urban', 'cultural']
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    description: 'A tropical paradise known for its lush landscapes, vibrant culture, and stunning beaches.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    climate: 'Tropical',
    bestTimeToVisit: 'April to October',
    currency: 'Indonesian Rupiah (IDR)',
    language: 'Indonesian, Balinese',
    timeZone: 'WITA (UTC+8)',
    highlights: [
      'Ubud Monkey Forest',
      'Tegallalang Rice Terraces',
      'Uluwatu Temple',
      'Seminyak Beach',
      'Sacred Monkey Forest'
    ],
    averageCost: {
      accommodation: 'IDR 500,000-1,500,000/night',
      food: 'IDR 100,000-200,000/day',
      activities: 'IDR 200,000-500,000/day'
    },
    weather: {
      summer: 'Warm and dry (25-30°C)',
      winter: 'Warm and wet (23-28°C)'
    },
    visaInfo: 'Visa on arrival for many countries',
    safety: 'Generally safe, but be cautious of petty theft',
    localTips: [
      'Respect temple dress codes',
      'Learn basic Indonesian phrases',
      'Use Grab/Gojek for transportation',
      'Try local warungs for authentic food',
      'Visit during dry season'
    ],
    type: ['beach', 'cultural', 'nature']
  }
]

interface DestinationSelectorProps {
  context: TravelContext
  onUpdate: (updates: Partial<TravelContext>) => void
  onComplete: () => void
  onAIResponse: (response: AIResponse) => void
}

// Add scraping functions
const scrapeTripAdvisor = async (query: string): Promise<ScrapedDestination[]> => {
  try {
    // In a real implementation, this would be a server-side API call
    // For now, we'll simulate the response
    const response = await fetch(`/api/scrape/tripadvisor?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to fetch from TripAdvisor')
    return await response.json()
  } catch (error) {
    console.error('Error scraping TripAdvisor:', error)
    return []
  }
}

const scrapeLonelyPlanet = async (query: string): Promise<ScrapedDestination[]> => {
  try {
    const response = await fetch(`/api/scrape/lonelyplanet?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to fetch from Lonely Planet')
    return await response.json()
  } catch (error) {
    console.error('Error scraping Lonely Planet:', error)
    return []
  }
}

const scrapeBookingCom = async (query: string): Promise<ScrapedDestination[]> => {
  try {
    const response = await fetch(`/api/scrape/booking?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to fetch from Booking.com')
    return await response.json()
  } catch (error) {
    console.error('Error scraping Booking.com:', error)
    return []
  }
}

export default function DestinationSelector({ context, onUpdate, onComplete, onAIResponse }: DestinationSelectorProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedGuide, setDisplayedGuide] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', message: string }>>([
    {
      type: 'assistant',
      message: "I can help you find the perfect destination based on your preferences. Just let me know what you're looking for! 🌍"
    }
  ])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isInitialTyping, setIsInitialTyping] = useState(true)
  const [displayedWelcomeMessage, setDisplayedWelcomeMessage] = useState('')
  const [showInteractiveElements, setShowInteractiveElements] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [conversationState, setConversationState] = useState<{
    isSearching: boolean;
    lastSearchQuery: string | null;
    selectedDestination: Destination | null;
  }>({
    isSearching: false,
    lastSearchQuery: null,
    selectedDestination: null
  })
  const [scrapingProgress, setScrapingProgress] = useState<{
    tripAdvisor: boolean;
    lonelyPlanet: boolean;
    booking: boolean;
  }>({
    tripAdvisor: false,
    lonelyPlanet: false,
    booking: false
  })

  // Add touch gesture handling
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    setIsScrolling(true)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.offsetWidth * 0.8 // Scroll 80% of container width
      
      if (isLeftSwipe) {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      } else if (isRightSwipe) {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
    
    setIsScrolling(false)
  }

  const destinationPrompts = [
    { text: "🌴 Beach destinations", query: "I'm looking for beach destinations" },
    { text: "🏔️ Mountain getaways", query: "I'm interested in mountain destinations" },
    { text: "🏛️ Cultural cities", query: "I want to explore cultural cities" },
    { text: "🌆 Urban adventures", query: "I'm looking for urban destinations" },
    { text: "🏖️ Island escapes", query: "I want to visit islands" }
  ]

  const emojis = ['😊', '🌴', '🏖️', '🏔️', '🌆', '🏛️', '🎡', '🍽️', '🛍️', '🎭', '🏨', '✈️']

  const handleEmojiSelect = (emoji: string) => {
    setUserMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const isConversationalResponse = (message: string): boolean => {
    const conversationalPhrases = [
      'ok', 'okay', 'yes', 'yeah', 'sure', 'go on', 'continue', 'tell me more',
      'thanks', 'thank you', 'cool', 'great', 'awesome', 'nice', 'perfect'
    ]
    return conversationalPhrases.some(phrase => 
      message.toLowerCase().trim().startsWith(phrase)
    )
  }

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    const userInput = userMessage.trim()
    setUserMessage('')

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message: userInput }])

    // Check if it's a conversational response
    if (isConversationalResponse(userInput)) {
      if (conversationState.isSearching && searchResults?.destinations.length) {
        // If we were searching and have results, show more details
        setIsTyping(true)
        setTimeout(() => {
          const currentDest = searchResults.destinations[0]
          const response = `Here are more details about ${currentDest.name}:\n\n` +
            `🌤️ Climate: ${currentDest.climate}\n` +
            `⏰ Time Zone: ${currentDest.timeZone}\n` +
            `💬 Language: ${currentDest.language}\n` +
            `💰 Currency: ${currentDest.currency}\n\n` +
            `Local Tips:\n${currentDest.localTips.map(tip => `• ${tip}`).join('\n')}\n\n` +
            `Would you like to know more about any specific aspect of ${currentDest.name}?`
          setChatHistory(prev => [...prev, { type: 'assistant', message: response }])
          setIsTyping(false)
        }, 1000)
      } else {
        // If we weren't searching, prompt for more specific information
        setIsTyping(true)
        setTimeout(() => {
          const response = "Could you tell me more specifically what kind of destination you're looking for? For example:\n" +
            "• Beach destinations\n" +
            "• Mountain getaways\n" +
            "• Cultural cities\n" +
            "• Urban adventures\n" +
            "• Nature retreats"
          setChatHistory(prev => [...prev, { type: 'assistant', message: response }])
          setIsTyping(false)
        }, 1000)
      }
      return
    }

    // If not a conversational response, treat as a search query
    setIsSearching(true)
    setConversationState(prev => ({ ...prev, isSearching: true, lastSearchQuery: userInput }))

    // Show scraping progress
    setScrapingProgress({
      tripAdvisor: true,
      lonelyPlanet: true,
      booking: true
    })

    // Add initial response
    setChatHistory(prev => [...prev, {
      type: 'assistant',
      message: `Searching for destinations matching "${userInput}"...\n\n` +
        `🔍 Checking TripAdvisor...\n` +
        `🔍 Checking Lonely Planet...\n` +
        `🔍 Checking Booking.com...`
    }])

    // Fetch destinations based on the query
    const results = await fetchDestinations(userInput)
    setSearchResults(results)

    // Reset scraping progress
    setScrapingProgress({
      tripAdvisor: false,
      lonelyPlanet: false,
      booking: false
    })

    // Generate AI response based on search results
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      if (results.destinations.length > 0) {
        response = `I found ${results.totalResults} destinations matching your search for "${results.searchQuery}":\n\n` +
          results.destinations.map(dest => 
            `🌍 ${dest.name}, ${dest.country}\n` +
            `📝 ${dest.description}\n` +
            `⭐ Highlights: ${dest.highlights.slice(0, 3).join(', ')}\n` +
            `💰 Average cost: ${dest.averageCost.accommodation}\n` +
            `🌤️ Best time to visit: ${dest.bestTimeToVisit}\n\n`
          ).join('') +
          `Would you like to know more about any of these destinations?`
      } else {
        response = `I couldn't find any destinations matching "${results.searchQuery}". Could you try a different search term? For example:\n` +
          "• Beach destinations\n" +
          "• Mountain getaways\n" +
          "• Cultural cities\n" +
          "• Urban adventures\n" +
          "• Nature retreats"
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

  const handlePromptClick = (query: string) => {
    setUserMessage(query)
    handleSendMessage()
  }

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination)
    setIsTyping(true)
    setDisplayedGuide('')
    onUpdate({ destination: destination.name })
    
    // Simulate AI typing effect
    const guide = `I've found some great information about ${destination.name}!\n\n` +
      `🌍 ${destination.name}, ${destination.country}\n` +
      `💬 Language: ${destination.language}\n` +
      `💰 Currency: ${destination.currency}\n` +
      `🌤️ Climate: ${destination.climate}\n` +
      `⏰ Time Zone: ${destination.timeZone}\n\n` +
      `Best time to visit: ${destination.bestTimeToVisit}\n\n` +
      `Must-visit places:\n${destination.highlights.map(h => `• ${h}`).join('\n')}\n\n` +
      `Local tips:\n${destination.localTips.map(t => `• ${t}`).join('\n')}`
    
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
    if (selectedDestination) {
      onComplete()
    }
  }

  // Move fetchDestinations inside the component
  const fetchDestinations = async (query: string): Promise<SearchResult> => {
    try {
      setIsSearching(true)
      
      // Fetch from multiple sources in parallel
      const [tripAdvisorResults, lonelyPlanetResults, bookingResults] = await Promise.all([
        scrapeTripAdvisor(query),
        scrapeLonelyPlanet(query),
        scrapeBookingCom(query)
      ])

      // Combine and deduplicate results
      const allDestinations = [...tripAdvisorResults, ...lonelyPlanetResults, ...bookingResults]
      const uniqueDestinations = Array.from(new Map(
        allDestinations.map(dest => [dest.name + dest.country, dest])
      ).values())

      // Transform scraped data to our Destination format
      const transformedDestinations: Destination[] = uniqueDestinations.map(dest => ({
        name: dest.name,
        country: dest.country,
        description: dest.description,
        image: dest.image,
        type: dest.type,
        climate: dest.weather.summer.split('(')[0].trim(),
        bestTimeToVisit: dest.bestTimeToVisit,
        currency: 'Varies by country', // Would need additional API call to get this
        language: 'Varies by country', // Would need additional API call to get this
        timeZone: 'Varies by country', // Would need additional API call to get this
        highlights: dest.highlights,
        averageCost: {
          accommodation: dest.priceRange,
          food: 'Varies',
          activities: 'Varies'
        },
        weather: dest.weather,
        visaInfo: 'Check local embassy website',
        safety: 'Check travel advisories',
        localTips: ['Check local tourism website for tips']
      }))

      return {
        destinations: transformedDestinations,
        totalResults: transformedDestinations.length,
        searchQuery: query
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
      // Fallback to mock data if scraping fails
      return {
        destinations: mockDestinations,
        totalResults: mockDestinations.length,
        searchQuery: query
      }
    } finally {
      setIsSearching(false)
    }
  }

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isMomentumScrolling, setIsMomentumScrolling] = useState(false)
  const refreshThreshold = 100 // pixels to pull before triggering refresh
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef<number>(0)
  const scrollVelocity = useRef<number>(0)

  // Haptic feedback function
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const duration = {
        light: 5,
        medium: 10,
        heavy: 20
      }[intensity]
      navigator.vibrate(duration)
    }
  }

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setPullDistance(0)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      const touch = e.touches[0]
      const pull = touch.clientY - e.touches[0].clientY
      if (pull > 0) {
        setPullDistance(pull)
        if (pull > refreshThreshold) {
          triggerHapticFeedback('light')
        }
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > refreshThreshold) {
      setIsRefreshing(true)
      triggerHapticFeedback('medium')
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Refresh data
      if (conversationState.lastSearchQuery) {
        const results = await fetchDestinations(conversationState.lastSearchQuery)
        setSearchResults(results)
      }
      setIsRefreshing(false)
    }
    setPullDistance(0)
  }

  // Momentum scrolling handlers
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now()
    const timeDiff = now - lastScrollTime.current
    if (timeDiff > 0) {
      const container = e.currentTarget
      const velocity = (container.scrollLeft - lastScrollTime.current) / timeDiff
      scrollVelocity.current = velocity
      
      if (Math.abs(velocity) > 0.5) {
        setIsMomentumScrolling(true)
        triggerHapticFeedback('light')
      }
    }
    lastScrollTime.current = now
  }

  const handleScrollEnd = () => {
    setIsMomentumScrolling(false)
    if (Math.abs(scrollVelocity.current) > 1) {
      triggerHapticFeedback('medium')
    }
  }

  // Enhanced touch gesture handlers
  const handleCardTouchStart = (e: React.TouchEvent, destination: Destination) => {
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      
      // Detect swipe gestures
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Right swipe - show more details
          triggerHapticFeedback('light')
          handleDestinationSelect(destination)
        } else {
          // Left swipe - show next destination
          triggerHapticFeedback('light')
          const currentIndex = (searchResults?.destinations || mockDestinations).findIndex(d => d.name === destination.name)
          const nextDestination = (searchResults?.destinations || mockDestinations)[currentIndex + 1]
          if (nextDestination) {
            handleDestinationSelect(nextDestination)
          }
        }
      }
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
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
                      style={{
                        WebkitAppearance: 'none',
                        touchAction: 'manipulation',
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      style={{ touchAction: 'manipulation' }}
                    >
                      😊
                    </motion.button>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                        style={{ touchAction: 'manipulation' }}
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {emojis.map((emoji, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                              style={{ touchAction: 'manipulation' }}
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
                    style={{ touchAction: 'manipulation' }}
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

      {/* Horizontal scrolling container for destination cards */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* Pull to refresh indicator */}
        <div 
          className="flex items-center justify-center h-16 transition-transform duration-200"
          style={{
            transform: `translateY(${Math.min(pullDistance, refreshThreshold)}px)`,
            opacity: pullDistance / refreshThreshold
          }}
        >
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"
            />
          ) : (
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </div>

        {/* Destination cards container */}
        <div 
          className="flex space-x-6 pb-4 overflow-x-auto snap-x snap-mandatory touch-pan-x"
          onScroll={handleScroll}
          onScrollEnd={handleScrollEnd}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-x',
            transition: isMomentumScrolling ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {(searchResults?.destinations || mockDestinations).map((destination) => (
            <motion.div
              key={destination.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onTouchStart={(e) => handleCardTouchStart(e, destination)}
              onClick={() => {
                triggerHapticFeedback('light')
                handleDestinationSelect(destination)
              }}
              className={`flex-shrink-0 w-80 snap-center bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 ${
                selectedDestination?.name === destination.name ? 'ring-2 ring-indigo-500' : ''
              }`}
              style={{
                touchAction: 'pan-y pinch-zoom',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <div className="relative h-48">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{destination.name}</h3>
                  <p className="text-sm opacity-90">{destination.country}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <GlobeAltIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">Best time: {destination.bestTimeToVisit}</span>
                  </div>
                  <div className="flex space-x-1">
                    {destination.type.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {(searchResults?.destinations || mockDestinations).map((_, index) => (
            <div
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
              style={{ touchAction: 'manipulation' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 