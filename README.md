# AstroReflect API

AstroReflect is a personal astrology transit journal application that allows users to track astrological transits and record their reflections. This repository contains the backend API built with Node.js, Express, TypeScript, and PostgreSQL, with integration to the Swiss Ephemeris library for accurate astrological calculations.

## Features

- **Ephemeris Calculations**: Precise planetary positions and transit calculations using the Swiss Ephemeris
- **Transit Detection**: Identification of planetary aspects, retrograde periods, and sign ingresses
- **Journal Entries**: CRUD operations for tracking personal reflections on transits
- **Rich Transit Data**: Detailed information about transit types, timing, and interpretations

## Tech Stack

- **Node.js & Express**: RESTful API framework
- **TypeScript**: Type safety and better development experience
- **PostgreSQL**: Relational database for storing journal entries
- **Knex.js**: SQL query builder and migration tool
- **Swiss Ephemeris**: Industry-standard astronomical/astrological calculation library

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Ephemeris Endpoints

#### Get Transits

```
GET /ephemeris/transits
```

Retrieves astrological transits for a specified date range.

**Query Parameters:**

- `startDate` (optional): ISO date string. If omitted, uses current date.
- `endDate` (optional): ISO date string. If omitted, uses startDate + 7 days.
- `planets` (optional): Comma-separated list of planets to filter by.

**Response Example:**

```json
{
  "transits": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "planetA": "SUN",
      "planetB": "MARS",
      "aspect": "Square",
      "subtype": "Standard",
      "timing": "Applying",
      "intensity": 80,
      "exactDate": "2025-03-21T12:30:00.000Z",
      "startDate": "2025-03-20T00:00:00.000Z",
      "endDate": "2025-03-22T23:59:59.999Z",
      "description": "Sun creates tension with Mars, challenging you to overcome obstacles and grow through difficulty."
    }
  ]
}
```

#### Get Planet Position

```
GET /ephemeris/planet
```

Retrieves the position of a planet at a specific date.

**Query Parameters:**

- `planet`: Required. The planet name (SUN, MOON, MERCURY, etc.)
- `date` (optional): ISO date string. If omitted, uses current date.

**Response Example:**

```json
{
  "position": {
    "planet": "SUN",
    "longitude": 0.123,
    "latitude": 0.001,
    "distance": 0.987,
    "speed": 0.9826,
    "speedDetails": {
      "longitude": 0.9826,
      "latitude": -0.0002
    },
    "sign": {
      "name": "Aries",
      "ruler": "MARS",
      "element": "Fire",
      "degreeInSign": 0.123,
      "percentInSign": 0.41
    },
    "retrograde": {
      "isRetrograde": false,
      "status": "Direct",
      "speed": 0.9826
    },
    "interpretation": {
      "keyThemes": [
        "Personal growth",
        "Unique expression",
        "Transformative energy"
      ],
      "challenges": [
        "Potential for impulsive behavior",
        "Need for patience",
        "Balancing personal desires"
      ],
      "opportunities": [
        "Personal transformation",
        "Creative expression",
        "Emotional growth"
      ]
    }
  }
}
```

### Journal Endpoints

#### Create Journal Entry

```
POST /journal/entries
```

Creates a new journal entry for a transit.

**Request Body:**

```json
{
  "transitId": "550e8400-e29b-41d4-a716-446655440000",
  "transitTypeId": "SUN_Square_MARS",
  "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
  "mood": "Focused",
  "tags": ["work", "conflict", "productivity"]
}
```

**Response Example:**

```json
{
  "id": "a77e8400-e29b-41d4-a716-446655442222",
  "transitId": "550e8400-e29b-41d4-a716-446655440000",
  "transitTypeId": "SUN_Square_MARS",
  "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
  "mood": "Focused",
  "tags": ["work", "conflict", "productivity"],
  "createdAt": "2025-03-20T15:22:31.000Z",
  "updatedAt": "2025-03-20T15:22:31.000Z"
}
```

#### Get Journal Entries for Transit

```
GET /journal/entries/transit/:transitId
```

Retrieves all journal entries for a specific transit.

**Response Example:**

```json
{
  "entries": [
    {
      "id": "a77e8400-e29b-41d4-a716-446655442222",
      "transitId": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
      "mood": "Focused",
      "tags": ["work", "conflict", "productivity"],
      "createdAt": "2025-03-20T15:22:31.000Z",
      "updatedAt": "2025-03-20T15:22:31.000Z"
    }
  ]
}
```

#### Get Journal Entries for Transit Type

```
GET /journal/entries/transit-type/:transitTypeId
```

Retrieves all journal entries for a specific transit type, across different instances of the transit.

**Response Example:**

```json
{
  "transitType": {
    "id": "SUN_Square_MARS",
    "planetA": "SUN",
    "planetB": "MARS",
    "aspect": "Square",
    "subtype": "Standard",
    "name": "Sun Square Mars",
    "description": "Sun creates tension with Mars, challenging you to overcome obstacles and grow through difficulty."
  },
  "entries": [
    {
      "id": "a77e8400-e29b-41d4-a716-446655442222",
      "transitId": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
      "mood": "Focused",
      "tags": ["work", "conflict", "productivity"],
      "createdAt": "2025-03-20T15:22:31.000Z",
      "updatedAt": "2025-03-20T15:22:31.000Z"
    }
  ]
}
```

#### Get Recent Journal Entries

```
GET /journal/entries/recent
```

Retrieves the most recent journal entries.

**Query Parameters:**

- `limit` (optional): Number of entries to return. Default: 5.

**Response Example:**

```json
{
  "entries": [
    {
      "id": "a77e8400-e29b-41d4-a716-446655442222",
      "transitId": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
      "mood": "Focused",
      "tags": ["work", "conflict", "productivity"],
      "createdAt": "2025-03-20T15:22:31.000Z",
      "updatedAt": "2025-03-20T15:22:31.000Z"
    }
  ]
}
```

#### Get Journal Entry by ID

```
GET /journal/entries/:entryId
```

Retrieves a specific journal entry by ID.

**Response Example:**

```json
{
  "id": "a77e8400-e29b-41d4-a716-446655442222",
  "transitId": "550e8400-e29b-41d4-a716-446655440000",
  "transitTypeId": "SUN_Square_MARS",
  "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
  "mood": "Focused",
  "tags": ["work", "conflict", "productivity"],
  "createdAt": "2025-03-20T15:22:31.000Z",
  "updatedAt": "2025-03-20T15:22:31.000Z"
}
```

#### Update Journal Entry

```
PUT /journal/entries/:entryId
```

Updates an existing journal entry.

**Request Body:**

```json
{
  "content": "Updated content about how I handled the situation.",
  "mood": "Reflective",
  "tags": ["work", "conflict", "growth"]
}
```

**Response Example:**

```json
{
  "id": "a77e8400-e29b-41d4-a716-446655442222",
  "transitId": "550e8400-e29b-41d4-a716-446655440000",
  "transitTypeId": "SUN_Square_MARS",
  "content": "Updated content about how I handled the situation.",
  "mood": "Reflective",
  "tags": ["work", "conflict", "growth"],
  "createdAt": "2025-03-20T15:22:31.000Z",
  "updatedAt": "2025-03-20T16:45:12.000Z"
}
```

#### Delete Journal Entry

```
DELETE /journal/entries/:entryId
```

Deletes a journal entry.

**Response:**

- Status 204 No Content on success

#### Get Journal Entries by Tag

```
GET /journal/entries/tag/:tag
```

Retrieves journal entries that contain a specific tag.

**Query Parameters:**

- `limit` (optional): Number of entries to return. Default: 20.

**Response Example:**

```json
{
  "entries": [
    {
      "id": "a77e8400-e29b-41d4-a716-446655442222",
      "transitId": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
      "mood": "Focused",
      "tags": ["work", "conflict", "productivity"],
      "createdAt": "2025-03-20T15:22:31.000Z",
      "updatedAt": "2025-03-20T15:22:31.000Z"
    }
  ]
}
```

#### Search Journal Entries

```
GET /journal/entries/search
```

Searches journal entries by content, mood, or tags.

**Query Parameters:**

- `query`: Required. The search term.
- `limit` (optional): Number of entries to return. Default: 20.

**Response Example:**

```json
{
  "entries": [
    {
      "id": "a77e8400-e29b-41d4-a716-446655442222",
      "transitId": "550e8400-e29b-41d4-a716-446655440000",
      "transitTypeId": "SUN_Square_MARS",
      "content": "Today I experienced conflict at work, but channeled the energy into productivity.",
      "mood": "Focused",
      "tags": ["work", "conflict", "productivity"],
      "createdAt": "2025-03-20T15:22:31.000Z",
      "updatedAt": "2025-03-20T15:22:31.000Z"
    }
  ]
}
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Swiss Ephemeris data files

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/astroreflect
CORS_ORIGIN=http://localhost:5173
```

### Installation Steps

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/astroreflect-api.git
   cd astroreflect-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up Swiss Ephemeris data files:

   - Create a directory `ephemeris-data` in the root of the project
   - Download Swiss Ephemeris files from https://www.astro.com/ftp/swisseph/
   - Place the files in the `ephemeris-data` directory

4. Set up the database:

   ```
   npm run migrate
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Running Tests

```
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## Project Structure

```
astroreflect-api/
├── ephemeris-data/    # Swiss Ephemeris data files
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── db/            # Database migrations and seeds
│   ├── middleware/    # Express middleware
│   ├── models/        # Data models and types
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   │   ├── ephemeris/ # Astrological calculation services
│   │   └── journal/   # Journal entry services
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for the astronomical calculation library
- [Node.js Swiss Ephemeris bindings](https://github.com/hatijs/sweph) for the Node.js integration
  git config pull.rebase true # rebase
