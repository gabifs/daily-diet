import type { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewwares/check-session-id-exists.js'
import z from 'zod'
import { knex } from '../database.js'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/metrics', async (request, reply) => {
    const sessionId = request.cookies.sessionId!
    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    const meals = await knex('meals').where({
      user_id: user.id,
    })

    const sequencia = meals.reduce(
      (acc, meal) => {
        if (!meal.is_in_diet) {
          return {
            streak: 0,
            bestStreak:
              acc.streak > acc.bestStreak ? acc.streak : acc.bestStreak,
          }
        } else {
          return {
            ...acc,
            streak: acc.streak + 1,
          }
        }
      },
      {
        streak: 0,
        bestStreak: 0,
      },
    )

    const mealsInDiet = await knex('meals')
      .where({
        user_id: user.id,
        is_in_diet: true,
      })
      .count('id', { as: 'total' })
      .first()

    const mealsOffDiet = await knex('meals')
      .where({
        user_id: user.id,
        is_in_diet: false,
      })
      .count('id', { as: 'total' })
      .first()

    return reply.status(201).send({
      mealsInDiet: mealsInDiet?.total,
      mealsOffDiet: mealsOffDiet?.total,
      totalMeals: meals?.length,
      bestStreak: sequencia.bestStreak,
    })
  })

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

  app.delete('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId!
    const getMealIdParam = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealIdParam.parse(request.params)
    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    await knex('meals').where('id', id).where('user_id', user.id).delete()

    return reply.status(204).send()
  })

  app.put('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId!

    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized!' })
    }

    const getMealIdParam = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealIdParam.parse(request.params)
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isInDiet: z.boolean(),
    })
    const { name, description, date, isInDiet } = updateMealBodySchema.parse(
      request.body,
    )

    await knex('meals').where('id', id).update({
      name,
      description,
      is_in_diet: isInDiet,
      date: date.toISOString(),
    })

    return reply.status(204).send()
  })
}
