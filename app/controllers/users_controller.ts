import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  index(context: HttpContext) {
    console.log(context)
    return {
      message: 'Users controller.',
    }
  }
}
