import MuscleGroup from '#models/muscle_group'
import type { HttpContext } from '@adonisjs/core/http'

export default class MuscleGroupsController {
  async index({ response }: HttpContext) {
    const muscleGroups = await MuscleGroup.all()
    return response.status(200).json({ data: muscleGroups })
  }
}
