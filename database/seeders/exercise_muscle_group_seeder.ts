import Exercise from '#models/exercise'
import MuscleGroup from '#models/muscle_group'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

type InvolvementLevel = 'primary' | 'secondary'

const EXERCISE_MUSCLE_GROUPS: Record<
  string,
  Array<{ muscleGroupName: string; involvement_level: InvolvementLevel }>
> = {
  'Bench Press': [
    { muscleGroupName: 'Pectorals', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'primary' },
  ],
  'Deadlift': [
    { muscleGroupName: 'Hamstrings', involvement_level: 'primary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'secondary' },
  ],
  'Back Squat': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Hamstrings', involvement_level: 'secondary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'secondary' },
  ],
  'Overhead Press': [
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'primary' },
  ],
  'Bicep Curls': [{ muscleGroupName: 'Biceps', involvement_level: 'primary' }],
  'Lat Pulldowns': [
    { muscleGroupName: 'Lats', involvement_level: 'primary' },
    { muscleGroupName: 'Biceps', involvement_level: 'secondary' },
  ],
  'Dips': [
    { muscleGroupName: 'Triceps', involvement_level: 'primary' },
    { muscleGroupName: 'Pectorals', involvement_level: 'primary' },
  ],
  'Burpees': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Pectorals', involvement_level: 'primary' },
    { muscleGroupName: 'Deltoids', involvement_level: 'secondary' },
    { muscleGroupName: 'Abs', involvement_level: 'secondary' },
  ],
  'Muscle-ups': [
    { muscleGroupName: 'Lats', involvement_level: 'primary' },
    { muscleGroupName: 'Pectorals', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'primary' },
    { muscleGroupName: 'Biceps', involvement_level: 'secondary' },
  ],
  'Box Jumps': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Calves', involvement_level: 'secondary' },
  ],
  'Wall Balls': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Abs', involvement_level: 'secondary' },
  ],
  'Double Unders': [{ muscleGroupName: 'Calves', involvement_level: 'primary' }],
  'Handstand Push-ups': [
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'primary' },
  ],
  'Toes-to-Bar': [
    { muscleGroupName: 'Abs', involvement_level: 'primary' },
    { muscleGroupName: 'Obliques', involvement_level: 'secondary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'secondary' },
  ],
  'Clean and Jerk': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Hamstrings', involvement_level: 'primary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'primary' },
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Traps', involvement_level: 'secondary' },
  ],
  'Snatch': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Hamstrings', involvement_level: 'primary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'primary' },
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Traps', involvement_level: 'secondary' },
  ],
  'Power Clean': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Hamstrings', involvement_level: 'secondary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'secondary' },
    { muscleGroupName: 'Traps', involvement_level: 'primary' },
  ],
  'Front Squat': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Abs', involvement_level: 'secondary' },
  ],
  'Thrusters': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'secondary' },
  ],
  'Kettlebell Swings': [
    { muscleGroupName: 'Hamstrings', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Lower Back', involvement_level: 'secondary' },
  ],
  'Lunges': [
    { muscleGroupName: 'Quads', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Hamstrings', involvement_level: 'secondary' },
  ],
  'Plank': [
    { muscleGroupName: 'Abs', involvement_level: 'primary' },
    { muscleGroupName: 'Obliques', involvement_level: 'primary' },
  ],
  'Renegade Rows': [
    { muscleGroupName: 'Lats', involvement_level: 'primary' },
    { muscleGroupName: 'Abs', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'secondary' },
  ],
  "Farmer's Carry": [
    { muscleGroupName: 'Forearms', involvement_level: 'primary' },
    { muscleGroupName: 'Traps', involvement_level: 'primary' },
    { muscleGroupName: 'Abs', involvement_level: 'secondary' },
  ],
  'Turkish Get-up': [
    { muscleGroupName: 'Deltoids', involvement_level: 'primary' },
    { muscleGroupName: 'Glutes', involvement_level: 'primary' },
    { muscleGroupName: 'Abs', involvement_level: 'primary' },
    { muscleGroupName: 'Triceps', involvement_level: 'secondary' },
  ],
}

export default class extends BaseSeeder {
  static enviroment = ['development']

  async run() {
    const muscleGroups = await MuscleGroup.all()
    const muscleGroupByName = new Map(muscleGroups.map((mg) => [mg.name, mg.id]))

    for (const [exerciseName, relations] of Object.entries(EXERCISE_MUSCLE_GROUPS)) {
      const exercise = await Exercise.findBy('name', exerciseName)
      if (!exercise) {
        console.warn(`[exercise_muscle_group_seeder] Exercise not found: ${exerciseName}`)
        continue
      }

      const pivotPayload: Record<number, { involvement_level: InvolvementLevel }> = {}
      for (const { muscleGroupName, involvement_level: level } of relations) {
        const muscleGroupId = muscleGroupByName.get(muscleGroupName)
        if (muscleGroupId === undefined) {
          console.warn(
            `[exercise_muscle_group_seeder] Muscle group not found: ${muscleGroupName} (exercise: ${exerciseName})`
          )
          continue
        }
        pivotPayload[muscleGroupId] = { involvement_level: level }
      }

      if (Object.keys(pivotPayload).length > 0) {
        await exercise.related('muscleGroups').sync(pivotPayload)
      }
    }
  }
}
