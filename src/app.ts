import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { usersRoutes } from './routes/users.js'

const app = fastify()

app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: 'users',
})

export default app
