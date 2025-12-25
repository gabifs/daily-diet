import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database.js'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
    })

    const { username } = createUserBodySchema.parse(request.body)

    const existingUser = await knex('users').where('username', username).first()

    if (existingUser) {
      return reply.status(409).send({ message: 'Username already taken' })
    }

    const sessionId = randomUUID()
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: randomUUID(),
      username,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
