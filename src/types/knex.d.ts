// eslint-disable-next-line
import type { Knex } from 'knex'

declare module 'knex/types/tables.js' {
  interface Tables {
    users: {
      id: string
      username: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      date: string
      is_in_diet: boolean
    }
  }
}
