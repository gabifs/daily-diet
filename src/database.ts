import setupKnex, { type Knex } from 'knex'
import { env } from './env/index.js'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  useNullAsDefault: true,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
