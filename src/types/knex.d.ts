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
  }
}
