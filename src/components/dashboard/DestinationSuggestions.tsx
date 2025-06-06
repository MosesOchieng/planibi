interface Destination {
  id: string
  name: string
  country: string
  flag: string
  description: string
  price: number
  image: string
}

interface DestinationSuggestionsProps {
  destinations: Destination[]
  onSelect: (destination: Destination) => void
}

export default function DestinationSuggestions({
  destinations,
  onSelect,
}: DestinationSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {destinations.map((destination) => (
        <button
          key={destination.id}
          onClick={() => onSelect(destination)}
          className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={destination.image}
              alt={destination.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {destination.name}
              </h3>
              <span className="text-2xl">{destination.flag}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {destination.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-500">
                ${destination.price}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {destination.country}
              </span>
            </div>
          </div>
          <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
        </button>
      ))}
    </div>
  )
} 