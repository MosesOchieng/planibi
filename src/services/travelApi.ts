import axios from 'axios'

const SKYSCANNER_API_KEY = process.env.NEXT_PUBLIC_SKYSCANNER_API_KEY
const BOOKING_API_KEY = process.env.NEXT_PUBLIC_BOOKING_API_KEY

interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  cabinClass: string
}

interface HotelSearchParams {
  location: string
  checkIn: string
  checkOut: string
  adults: number
  rooms: number
}

export const travelApi = {
  // Flight Search
  searchFlights: async (params: FlightSearchParams) => {
    try {
      const response = await axios.get('https://skyscanner-api.p.rapidapi.com/v3/flights/search', {
        headers: {
          'X-RapidAPI-Key': SKYSCANNER_API_KEY,
          'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
        },
        params: {
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          cabinClass: params.cabinClass
        }
      })
      return response.data
    } catch (error) {
      console.error('Error searching flights:', error)
      throw error
    }
  },

  // Hotel Search
  searchHotels: async (params: HotelSearchParams) => {
    try {
      const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
        headers: {
          'X-RapidAPI-Key': BOOKING_API_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        params: {
          units: 'metric',
          room_number: params.rooms,
          checkout_date: params.checkOut,
          checkin_date: params.checkIn,
          adults_number: params.adults,
          order_by: 'popularity',
          filter_by_currency: 'USD',
          locale: 'en-us',
          dest_type: 'city',
          dest_id: params.location,
          page_number: '0',
          categories_filter_ids: 'class::2,class::4,free_cancellation::1'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error searching hotels:', error)
      throw error
    }
  },

  // Price Alerts
  createPriceAlert: async (params: {
    type: 'flight' | 'hotel'
    origin?: string
    destination: string
    dates: {
      start: string
      end?: string
    }
    price: number
    email: string
  }) => {
    // TODO: Implement price alert creation
    return { success: true, alertId: Date.now().toString() }
  }
} 