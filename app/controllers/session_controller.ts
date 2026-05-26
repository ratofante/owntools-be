import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/auth'
import User from '#models/user'

export default class SessionController {
  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await auth.use('api').createToken(user)

      return {
        user,
        token,
      }
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }
      throw error
    }
  }

  async destroy({ auth }: HttpContext) {
    await auth.use('api').invalidateToken()
  }
}
