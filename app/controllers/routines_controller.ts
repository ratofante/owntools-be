import type { HttpContext } from '@adonisjs/core/http'
import Routine from '#models/routine'

export default class RoutinesController {
  public async find({ request, response }: HttpContext) {
    const { id } = request.params()

    const routine = await Routine.query()
      .preload('workoutBlocks', (workoutBlockQuery) => {
        workoutBlockQuery
          .pivotColumns(['position'])
          .orderBy('routine_workout_blocks.position', 'asc')
          .preload('sets', (workoutSetQuery) => {
            workoutSetQuery
              .pivotColumns(['position'])
              .orderBy('workout_block_sets.position', 'asc')
              .preload('exercise', (exerciseQuery) => {
                exerciseQuery
                  .preload('muscleGroups', (muscleGroupQuery) => {
                    muscleGroupQuery
                      .select('id', 'name', 'description')
                      .pivotColumns(['involvement_level'])
                      .orderBy('exercise_muscle_groups.involvement_level', 'asc')
                  })
                  .preload('bodyZones', (bodyZoneQuery) => {
                    bodyZoneQuery
                      .select('id', 'name', 'description', 'hex_color')
                      .pivotColumns(['zone_importance'])
                      .orderBy('exercise_body_zones.zone_importance', 'asc')
                  })
              })
          })
      })
      .where('id', id)
      .first()

    if (!routine) {
      return response.status(404).json({ message: 'Routine not found' })
    }

    return response.status(200).json({
      ...routine.serialize(),
      workoutBlocks: routine.workoutBlocks.map((block) => ({
        ...block.serialize(),
        position: block.$extras.pivot_position,
        sets: block.sets.map((set) => ({
          ...set.serialize(),
          position: set.$extras.pivot_position,
          exercise: {
            ...set.exercise.serialize(),
            muscleGroups: set.exercise.muscleGroups.map((mg) => ({
              ...mg.serialize(),
              involvementLevel: mg.$extras.pivot_involvement_level,
            })),
            bodyZones: set.exercise.bodyZones.map((bz) => ({
              ...bz.serialize(),
              zoneImportance: bz.$extras.pivot_zone_importance,
            })),
          },
        })),
      })),
    })
  }
}
