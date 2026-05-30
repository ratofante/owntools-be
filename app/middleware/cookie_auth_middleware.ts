import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CookieAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const cookieToken = ctx.request.cookie('access_token')
    if (cookieToken && !ctx.request.header('authorization')) {
      ctx.request.request.headers['authorization'] = `Bearer ${cookieToken}`
    }
    return next()
  }
}
