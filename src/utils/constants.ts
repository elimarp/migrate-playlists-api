import { config } from 'dotenv'

const envPath = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
  ? `.env.${process.env.NODE_ENV}`
  : '.env'

config({ path: envPath })
// TODO?: is this code being executed twice?

const required = (input: Record<string, (string | undefined)>): string => {
  const [key, value] = Object.entries(input)[0]
  if (!value) throw new Error(`Missing environment variable '${key}'`)
  return value
}

const {
  NODE_ENV,
  CALLBACK_BASE_URL,
  SPOTIFY_API_BASE_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  JWT_SECRET
} = process.env

export const constants = {
  app: {
    NODE_ENV: NODE_ENV ?? 'development',
    jwt: {
      SECRET: required({ JWT_SECRET })
    },
    callback: {
      BASE_URL: required({ CALLBACK_BASE_URL })
    }
  },
  external: {
    spotify: {
      BASE_URL: required({ SPOTIFY_API_BASE_URL }),
      CLIENT_ID: required({ SPOTIFY_CLIENT_ID }),
      CLIENT_SECRET: required({ SPOTIFY_CLIENT_SECRET })
    }
  },
  database: {
    mongodb: {

    }
  }
}
