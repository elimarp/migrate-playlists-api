import { config } from 'dotenv'

const env = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'

config({ path: env })

const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV
}

export const CONSTANTS = {
  ENVIRONMENT
}
