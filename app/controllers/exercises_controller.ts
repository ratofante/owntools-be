import type { HttpContext } from '@adonisjs/core/http'
import Exercise from '#models/exercise'
import ExercisePolicy from '#policies/exercise_policy'
import {
  allExerciseValidator,
  createExerciseValidator,
  updateExerciseValidator,
} from '#validators/exercise'

export default class ExercisesController {
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 10,
      searchName,
      createdAtSort = 'desc',
      createdBy,
      bodyZones,
      muscleGroups,
    } = await request.validateUsing(allExerciseValidator)

    console.log(bodyZones, muscleGroups)

    const query = Exercise.query()
      .preload('user', (userQuery) => {
        userQuery.select('id', 'full_name', 'email')
      })
      .preload('bodyZones', (bodyZoneQuery) => {
        bodyZoneQuery
          .select('id', 'name', 'description', 'hex_color')
          .pivotColumns(['zone_importance'])
          .orderBy('zone_importance', 'asc')
      })
      .preload('muscleGroups', (muscleGroupQuery) => {
        muscleGroupQuery
          .select('id', 'name', 'description')
          .pivotColumns(['involvement_level'])
          .orderBy('involvement_level', 'asc')
      })

    /*****
     * Filters
     */
    if (searchName) {
      query.whereILike('name', `%${searchName}%`)
    }
    if (createdBy) {
      query.where('createdBy', createdBy)
    }
    if (bodyZones?.length) {
      query.whereHas('bodyZones', (bodyZoneQuery) => {
        bodyZoneQuery.whereIn('body_zones.id', bodyZones)
      })
    }
    if (muscleGroups?.length) {
      query.whereHas('muscleGroups', (muscleGroupQuery) => {
        muscleGroupQuery.whereIn('muscle_groups.id', muscleGroups)
      })
    }

    /*****
     * Sorting
     */
    query.orderBy('createdAt', createdAtSort)

    const exercises = await query.paginate(page, limit)

    const data = exercises.all().map((exercise) => {
      const json = exercise.serialize()
      json.bodyZones = exercise.bodyZones.map((bz) => ({
        ...bz.serialize(),
        zone_importance: bz.$extras?.pivot_zone_importance ?? null,
      }))
      json.muscleGroups = exercise.muscleGroups.map((mg) => ({
        ...mg.serialize(),
        involvement_level: mg.$extras?.pivot_involvement_level ?? null,
      }))
      return json
    })

    return response.status(200).json({ data, meta: exercises.getMeta() })
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
