import type { HttpContext } from '@adonisjs/core/http'
import Exercise from '#models/exercise'
import ExercisePolicy from '#policies/exercise_policy'
import { createExerciseValidator, updateExerciseValidator } from '#validators/exercise'

export default class ExercisesController {
  async index({ response }: HttpContext) {
    const exercises = await Exercise.all()
    return response.status(200).json(exercises)
  }

  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createExerciseValidator)
    const exercise = await Exercise.create({
      ...payload,
      createdBy: auth.user?.id,
    })
    return response.status(201).json(exercise)
  }

  async update({ request, response, bouncer }: HttpContext) {
    const exercise = await Exercise.findOrFail(request.param('id'))
    if (await bouncer.with(ExercisePolicy).denies('edit', exercise)) {
      return response.forbidden('You are not allowed to edit this exercise')
    }
    const payload = await request.validateUsing(updateExerciseValidator)
    exercise.merge(payload).save()
    return response.status(200).json(exercise)
  }

  async delete({ request, response, bouncer }: HttpContext) {
    const exercise = await Exercise.findOrFail(request.param('id'))
    if (await bouncer.with(ExercisePolicy).denies('delete', exercise)) {
      return response.forbidden('You are not allowed to delete this exercise')
    }
    await exercise.delete()
    return response.status(204)
  }
}
