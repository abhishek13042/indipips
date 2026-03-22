import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

export default defineConfig({
  datasource: {
    url: connectionString,
  }
})
