import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

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

    return auth.use('api').createToken(newUser)
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
