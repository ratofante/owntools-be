import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import Wallet from '#models/wallet'
import Category from '#models/category'

export default class UsersController {
  index(context: HttpContext) {
    console.log(context)
    return {
      message: 'Users controller.',
    }
  }

  async store({ request, auth }: HttpContext) {
    const { fullName, email, password } = request.only(['fullName', 'email', 'password'])

    const newUser = await User.create({
      fullName,
      email,
      password,
    })

    const wallet = await Wallet.create({
      name: 'Gastos Personales',
      currency: 'ARS',
      walletType: 'personal',
    })

    wallet.related('users').attach({
      [newUser.id]: { role: 'owner', status: 'active' },
    })

    const token = await auth.use('api').createToken(newUser)
    return {
      user: newUser,
      token,
    }
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

  async categories({ auth, response }: HttpContext) {
    const categories = await Category.query().where('userId', auth.user!.id)
    return response.status(200).json({ categories })
  }

  async createCategory({ request, auth, response }: HttpContext) {
    const { name, description } = request.only(['name', 'description'])
    const category = await Category.create({
      name,
      description: description ?? null,
      userId: auth.user!.id,
    })
    return response.status(201).json({ category })
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
    await user.delete()
    return response.status(200).json({ message: 'User deleted successfully' })
  }
}
