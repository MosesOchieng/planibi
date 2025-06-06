import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const aiService = {
  // Chat with GPT-4
  chat: async (messages: ChatMessage[]) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant that provides personalized travel recommendations and planning assistance.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
      return response.choices[0].message
    } catch (error) {
      console.error('Error in AI chat:', error)
      throw error
    }
  },

  // Analyze sentiment of reviews
  analyzeSentiment: async (text: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following review and provide a score from -1 (very negative) to 1 (very positive).'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
      return response.choices[0].message
    } catch (error) {
      console.error('Error in sentiment analysis:', error)
      throw error
    }
  },

  // Generate personalized recommendations
  generateRecommendations: async (params: {
    destination: string
    preferences: string[]
    budget: number
    duration: number
  }) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate personalized travel recommendations based on the user\'s preferences and constraints.'
          },
          {
            role: 'user',
            content: JSON.stringify(params)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
      return response.choices[0].message
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }
} 