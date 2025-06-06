import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TravelState {
  currentTrip: {
    destination: string
    dates: {
      start: string
      end: string
    }
    budget: number
    preferences: string[]
  } | null
  savedTrips: any[]
  isLoading: boolean
  error: string | null
}

const initialState: TravelState = {
  currentTrip: null,
  savedTrips: [],
  isLoading: false,
  error: null,
}

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    setCurrentTrip: (state, action: PayloadAction<TravelState['currentTrip']>) => {
      state.currentTrip = action.payload
    },
    setSavedTrips: (state, action: PayloadAction<any[]>) => {
      state.savedTrips = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCurrentTrip, setSavedTrips, setLoading, setError } = travelSlice.actions
export default travelSlice.reducer 