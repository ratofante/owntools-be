import type { HttpContext } from '@adonisjs/core/http'
import Exercise from '#models/exercise'

export default class ExercisesController {
  async index({ response }: HttpContext) {
    const exercises = await Exercise.all()
    return response.status(200).json(exercises)
  }

  async create({ request, response }: HttpContext) {
    const { name, description, videoUrl } = request.body()
    const exercise = await Exercise.create({
      name,
      description,
      videoUrl,
    })
    return response.status(201).json(exercise)
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const exercise = await Exercise.findOrFail(id)
    exercise.merge(request.body()).save()
    return response.status(200).json(exercise)
  }

  async delete({ params, response }: HttpContext) {
    const { id } = params
    const exercise = await Exercise.findOrFail(id)
    await exercise.delete()
    return response.status(204)
  }
}
