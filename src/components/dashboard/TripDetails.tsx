interface Accommodation {
  id: string
  name: string
  price: number
  rating: number
  image: string
}

interface Flight {
  id: string
  airline: string
  price: number
  stops: number
  duration: string
  departure: string
  arrival: string
}

interface TripDetailsProps {
  destination: string
  startDate: string
  endDate: string
  budget: number
  accommodations: Accommodation[]
  flights: Flight[]
  onBookAccommodation: (id: string) => void
  onBookFlight: (id: string) => void
}

export default function TripDetails({
  destination,
  startDate,
  endDate,
  budget,
  accommodations,
  flights,
  onBookAccommodation,
  onBookFlight,
}: TripDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Trip Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Trip to {destination}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dates</p>
            <p className="text-gray-900 dark:text-white">
              {startDate} - {endDate}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <p className="text-gray-900 dark:text-white">${budget}</p>
          </div>
        </div>
      </div>

      {/* Accommodations */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Where to Stay
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <img
                src={accommodation.image}
                alt={accommodation.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {accommodation.name}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-500 font-bold">
                    ${accommodation.price}/night
                  </span>
                  <span className="text-yellow-400">
                    {'★'.repeat(accommodation.rating)}
                  </span>
                </div>
                <button
                  onClick={() => onBookAccommodation(accommodation.id)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flights */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Flight Options
        </h3>
        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {flight.airline}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {flight.stops} {flight.stops === 1 ? 'stop' : 'stops'} •{' '}
                    {flight.duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-500">
                    ${flight.price}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {flight.departure} → {flight.arrival}
                  </p>
                </div>
                <button
                  onClick={() => onBookFlight(flight.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 