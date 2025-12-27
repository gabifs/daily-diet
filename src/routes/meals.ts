import type { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewwares/check-session-id-exists.js'
import z from 'zod'
import { knex } from '../database.js'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId!
    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    const meals = await knex('meals')
      .where('user_id', user.id)
      .select('id', 'name', 'date', 'description', 'is_in_diet as isInDiet')
      .orderBy('date', 'desc')

    return reply.status(201).send({
      meals,
    })
  })

  app.get('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId!
    const getMealIdParam = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealIdParam.parse(request.params)
    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    const meal = await knex('meals')
      .where('id', id)
      .where('user_id', user.id)
      .select('id', 'name', 'date', 'description', 'is_in_diet as isInDiet')
      .first()

    return reply.status(201).send({
      meal,
    })
  })

  app.post('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId!
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isInDiet: z.boolean(),
    })

    const { name, description, date, isInDiet } = createMealBodySchema.parse(
      request.body,
    )

    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    await knex('meals').insert({
      id: randomUUID(),
      user_id: user.id,
      name,
      description,
      date: date.toISOString(),
      is_in_diet: isInDiet,
    })

    return reply.status(201).send()
  })
}
