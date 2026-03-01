import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  async store({ request, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await auth.use('api').createToken(user)

    return {
      user,
      token,
    }
  }

  async destroy({ auth }: HttpContext) {
    await auth.use('api').invalidateToken()
  }
}
