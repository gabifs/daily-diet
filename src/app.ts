import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { usersRoutes } from './routes/users.js'
import { mealsRoutes } from './routes/meals.js'

const app = fastify()

app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: 'users',
})
app.register(mealsRoutes, {
  prefix: 'meals',
})

export default app
