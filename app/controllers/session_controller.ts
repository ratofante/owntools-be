import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/auth'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import { checkLoginRateLimit, resetLoginRateLimit } from '#services/rate_limiter'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
}

export default class SessionController {
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const rateLimit = checkLoginRateLimit(request.ip())
    if (!rateLimit.allowed) {
      return response.tooManyRequests({
        message: 'Too many login attempts. Please try again later.',
        retryAfter: rateLimit.retryAfter,
      })
    }

    try {
      const user = await User.verifyCredentials(payload.email, payload.password)
      resetLoginRateLimit(request.ip())
      const token = await auth.use('api').createToken(user)
      response.cookie('access_token', token.value!.release(), COOKIE_OPTIONS)
      return { user }
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }
      throw error
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    response.clearCookie('access_token', { path: '/' })
  }

  async show({ auth }: HttpContext) {
    return { user: auth.user! }
  }

  async refresh({ auth, response }: HttpContext) {
    const user = auth.user!
    await auth.use('api').invalidateToken()
    const token = await auth.use('api').createToken(user)
    response.cookie('access_token', token.value!.release(), COOKIE_OPTIONS)
    return { user }
  }
}
