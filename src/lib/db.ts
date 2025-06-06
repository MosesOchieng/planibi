import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const db = new Database(path.join(process.cwd(), 'travel.db'))

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    destination TEXT,
    start_date TEXT,
    end_date TEXT,
    budget REAL,
    status TEXT DEFAULT 'planned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS accommodations (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    name TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    rating REAL,
    image TEXT,
    amenities TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    airline TEXT,
    flight_number TEXT,
    departure TEXT,
    arrival TEXT,
    price REAL,
    duration TEXT,
    stops INTEGER,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS add_ons (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    name TEXT,
    description TEXT,
    price REAL,
    type TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  );
`)

// User operations
export const userDb = {
  create: (user: { id: string; name: string; email: string; password: string }) => {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (@id, @name, @email, @password)
    `)
    return stmt.run(user)
  },

  findByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email)
  },

  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id)
  }
}

// Trip operations
export const tripDb = {
  create: (trip: {
    id: string
    userId: string
    destination: string
    startDate: string
    endDate: string
    budget: number
  }) => {
    const stmt = db.prepare(`
      INSERT INTO trips (id, user_id, destination, start_date, end_date, budget)
      VALUES (@id, @userId, @destination, @startDate, @endDate, @budget)
    `)
    return stmt.run(trip)
  },

  findByUserId: (userId: string) => {
    const stmt = db.prepare('SELECT * FROM trips WHERE user_id = ?')
    return stmt.all(userId)
  },

  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM trips WHERE id = ?')
    return stmt.get(id)
  },

  updateStatus: (id: string, status: string) => {
    const stmt = db.prepare('UPDATE trips SET status = ? WHERE id = ?')
    return stmt.run(status, id)
  }
}

// Accommodation operations
export const accommodationDb = {
  create: (accommodation: {
    id: string
    tripId: string
    name: string
    description: string
    price: number
    location: string
    rating: number
    image: string
    amenities: string
  }) => {
    const stmt = db.prepare(`
      INSERT INTO accommodations (id, trip_id, name, description, price, location, rating, image, amenities)
      VALUES (@id, @tripId, @name, @description, @price, @location, @rating, @image, @amenities)
    `)
    return stmt.run(accommodation)
  },

  findByTripId: (tripId: string) => {
    const stmt = db.prepare('SELECT * FROM accommodations WHERE trip_id = ?')
    return stmt.get(tripId)
  }
}

// Flight operations
export const flightDb = {
  create: (flight: {
    id: string
    tripId: string
    airline: string
    flightNumber: string
    departure: string
    arrival: string
    price: number
    duration: string
    stops: number
  }) => {
    const stmt = db.prepare(`
      INSERT INTO flights (id, trip_id, airline, flight_number, departure, arrival, price, duration, stops)
      VALUES (@id, @tripId, @airline, @flightNumber, @departure, @arrival, @price, @duration, @stops)
    `)
    return stmt.run(flight)
  },

  findByTripId: (tripId: string) => {
    const stmt = db.prepare('SELECT * FROM flights WHERE trip_id = ?')
    return stmt.get(tripId)
  }
}

// Add-on operations
export const addOnDb = {
  create: (addOn: {
    id: string
    tripId: string
    name: string
    description: string
    price: number
    type: string
  }) => {
    const stmt = db.prepare(`
      INSERT INTO add_ons (id, trip_id, name, description, price, type)
      VALUES (@id, @tripId, @name, @description, @price, @type)
    `)
    return stmt.run(addOn)
  },

  findByTripId: (tripId: string) => {
    const stmt = db.prepare('SELECT * FROM add_ons WHERE trip_id = ?')
    return stmt.all(tripId)
  }
}

export default db 