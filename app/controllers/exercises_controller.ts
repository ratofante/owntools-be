import type { HttpContext } from '@adonisjs/core/http'
import Exercise from '#models/exercise'
import { allExerciseValidator, exerciseValidator } from '#validators/exercise'

export default class ExercisesController {
  async all({ response }: HttpContext) {
    const exercises = await Exercise.query().orderBy('name', 'asc')
    return response.status(200).json(exercises)
  }

  async paginated({ request, response }: HttpContext) {
    /*
      We could validate this using the built-in defaults for http requests
      https://docs.adonisjs.com/guides/basics/validation#validating-different-data-sources
    */
    const {
      page = 1,
      limit = 10,
      searchName,
      createdAtSort = 'desc',
      createdBy,
      bodyZones,
      muscleGroups,
    } = await request.validateUsing(allExerciseValidator)

    const query = Exercise.query()
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

  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(exerciseValidator)

    const exercise = await Exercise.create({
      name: payload.name,
      description: payload.description,
      videoUrl: payload.videoUrl,
    })
    await exercise
      .related('bodyZones')
      .attach(
        Object.fromEntries(
          payload.bodyZones.map((bz) => [bz.id, { zone_importance: bz.zone_importance }])
        )
      )
    await exercise
      .related('muscleGroups')
      .attach(
        Object.fromEntries(
          payload.muscleGroups.map((mg) => [mg.id, { involvement_level: mg.involvement_level }])
        )
      )

    return response.status(201).json(exercise)
  }

  async update({ request, response, params }: HttpContext) {
    const exercise = await Exercise.findOrFail(params.id)
    const payload = await request.validateUsing(exerciseValidator)

    exercise.merge({
      name: payload.name,
      description: payload.description,
      videoUrl: payload.videoUrl,
    })
    await exercise.save()

    await exercise
      .related('bodyZones')
      .sync(
        Object.fromEntries(
          payload.bodyZones.map((bz) => [bz.id, { zone_importance: bz.zone_importance }])
        )
      )

    await exercise
      .related('muscleGroups')
      .sync(
        Object.fromEntries(
          payload.muscleGroups.map((mg) => [mg.id, { involvement_level: mg.involvement_level }])
        )
      )

    return response.status(200).json(exercise)
  }

  async delete({ request, response }: HttpContext) {
    const exercise = await Exercise.findOrFail(request.param('id'))
    await exercise.delete()
    response.status(200).json({ message: 'Exercise deleted successfully', data: exercise })
  }
}
