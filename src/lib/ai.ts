import { Configuration, OpenAIApi } from 'openai'

export interface TravelContext {
  destination: string
  dates: {
    start: Date | null
    end: Date | null
  }
  budget: number
  preferences: {
    accommodation: string
    activities: string[]
    transportation: string
  }
  selectedAccommodation?: string
  selectedFlight?: string
  addOns?: string[]
}

export interface AIResponse {
  recommendations: {
    accommodation?: {
      name: string
      description: string
    }
    activities?: string[]
    transportation?: string
  }
  suggestions: string[]
  nextStep?: string
}

// Mock responses for development
const mockResponses: Record<string, AIResponse> = {
  'paris': {
    suggestions: [
      'Visit the Eiffel Tower at sunset for the best views',
      'Explore the Louvre Museum (book tickets in advance)',
      'Take a Seine River cruise',
      'Visit Notre-Dame Cathedral',
      'Walk through Montmartre'
    ],
    recommendations: {
      accommodations: [
        'Hotel in Le Marais district',
        'Boutique hotel near Champs-Élysées',
        'Apartment in Saint-Germain-des-Prés'
      ],
      activities: [
        'Wine tasting in Montmartre',
        'Cooking class in a local kitchen',
        'Photography tour of Paris'
      ],
      transportation: [
        'Metro pass for unlimited travel',
        'Bicycle rental for city exploration',
        'Airport transfer service'
      ]
    },
    nextStep: 'Select your preferred accommodation from the recommendations above.'
  },
  'tokyo': {
    suggestions: [
      'Visit Senso-ji Temple in Asakusa',
      'Explore Shibuya Crossing',
      'Shop in Ginza district',
      'Visit Tokyo Skytree',
      'Experience Tsukiji Outer Market'
    ],
    recommendations: {
      accommodations: [
        'Hotel in Shinjuku',
        'Ryokan in Asakusa',
        'Apartment in Shibuya'
      ],
      activities: [
        'Sushi making class',
        'Tea ceremony experience',
        'Robot Restaurant show'
      ],
      transportation: [
        'JR Pass for city travel',
        'PASMO card for public transport',
        'Airport limousine bus'
      ]
    },
    nextStep: 'Select your preferred accommodation from the recommendations above.'
  }
}

export async function getAIResponse(message: string, context: TravelContext): Promise<AIResponse> {
  // Check if we have a mock response for the destination
  const destination = context.destination?.toLowerCase()
  if (destination && mockResponses[destination]) {
    return mockResponses[destination]
  }

  // Default response if no specific destination is found
  return {
    suggestions: [
      'Research local customs and etiquette',
      'Check visa requirements',
      'Get travel insurance',
      'Download offline maps',
      'Learn basic local phrases'
    ],
    recommendations: {
      accommodations: [
        'Book accommodations in advance',
        'Consider location and accessibility',
        'Read recent reviews'
      ],
      activities: [
        'Plan major activities in advance',
        'Leave room for spontaneous exploration',
        'Check local events calendar'
      ],
      transportation: [
        'Research local transportation options',
        'Book airport transfers',
        'Consider getting a local SIM card'
      ]
    },
    nextStep: 'Please select a destination to get personalized recommendations.'
  }
}

function extractSuggestions(response: string): AIResponse['suggestions'] {
  // This is a placeholder - you would implement actual parsing logic here
  return undefined
}

function determineNextStep(context: TravelContext, message: string): AIResponse['nextStep'] {
  if (!context.destination) return 'destination'
  if (!context.selectedAccommodation) return 'accommodation'
  if (!context.selectedFlight) return 'flight'
  if (!context.addOns) return 'addons'
  return 'summary'
} 