import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import Wallet from '#models/wallet'
import { registerValidator } from '#validators/auth'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
}

export default class UsersController {
  index(_context: HttpContext) {
    return {
      message: 'Users controller.',
    }
  }

  async store({ request, auth, response }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(registerValidator)

    const newUser = await User.create({ fullName, email, password })

    const wallet = await Wallet.create({
      name: 'Gastos Personales',
      currency: 'ARS',
      walletType: 'personal',
    })

    wallet.related('users').attach({
      [newUser.id]: { role: 'owner', status: 'active' },
    })

    const token = await auth.use('api').createToken(newUser)
    response.cookie('access_token', token.value!.release(), COOKIE_OPTIONS)
    return { user: newUser }
  }

  async search({ request, response, auth }: HttpContext) {
    const { email } = request.qs()
    if (!email) {
      return response.status(400).json({ message: 'email query param is required' })
    }
    const users = await User.query()
      .where('email', 'like', `%${email}%`)
      .whereNot('id', auth.user!.id)
    return response.status(200).json({ users })
  }

  async destroy({ params, auth, response }: HttpContext) {
    if (auth.user?.id !== Number.parseInt(params.id)) {
      return response.abort('Unauthorized', 401)
    }
    const user = await User.findBy('id', params.id)
    if (!user) {
      return response.abort('User not found', 404)
    }
    await auth.use('api').invalidateToken()
    response.clearCookie('access_token', { path: '/' })
    await user.delete()
    return response.status(200).json({ message: 'User deleted successfully' })
  }
}
