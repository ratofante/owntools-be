import type { HttpContext } from '@adonisjs/core/http'
import BodyZone from '#models/body_zone'

export default class BodyZonesController {
  async index({ response }: HttpContext) {
    const bodyZones = await BodyZone.all()
    return response.status(200).json({ data: bodyZones })
  }
}
