import { config } from 'dotenv'

const envPath = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
  ? `.env.${process.env.NODE_ENV}`
  : '.env'

console.log({ envPath })

config({ path: envPath })
// TODO?: is this code being executed twice?

const required = (input: Record<string, (string | undefined)>): string => {
  const [key, value] = Object.entries(input)[0]
  if (!value) throw new Error(`Missing environment variable '${key}'`)
  return value
}

const { NODE_ENV, SPOTIFY_API_BASE_URL } = process.env

export const constants = {
  app: {
    NODE_ENV: NODE_ENV ?? 'development'
  },
  http: {
    spotify: {
      BASE_URL: required({ SPOTIFY_API_BASE_URL })
    }
  },
  database: {
    mongodb: {

    }
  }
}
