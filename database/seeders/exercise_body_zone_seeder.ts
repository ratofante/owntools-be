import Exercise from '#models/exercise'
import BodyZone from '#models/body_zone'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

type ZoneImportance = 'primary' | 'secondary'

const EXERCISE_BODY_ZONES: Record<
  string,
  Array<{ bodyZoneName: string; zone_importance: ZoneImportance }>
> = {
  'Bench Press': [{ bodyZoneName: 'Upper Body', zone_importance: 'primary' }],
  'Deadlift': [
    { bodyZoneName: 'Back', zone_importance: 'primary' },
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'secondary' },
  ],
  'Back Squat': [{ bodyZoneName: 'Lower Body', zone_importance: 'primary' }],
  'Overhead Press': [{ bodyZoneName: 'Upper Body', zone_importance: 'primary' }],
  'Bicep Curls': [{ bodyZoneName: 'Upper Body', zone_importance: 'primary' }],
  'Lat Pulldowns': [{ bodyZoneName: 'Back', zone_importance: 'primary' }],
  'Dips': [{ bodyZoneName: 'Upper Body', zone_importance: 'primary' }],
  'Burpees': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Aerobic', zone_importance: 'secondary' },
  ],
  'Muscle-ups': [
    { bodyZoneName: 'Upper Body', zone_importance: 'primary' },
    { bodyZoneName: 'Back', zone_importance: 'primary' },
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'secondary' },
  ],
  'Box Jumps': [{ bodyZoneName: 'Lower Body', zone_importance: 'primary' }],
  'Wall Balls': [
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Upper Body', zone_importance: 'primary' },
    { bodyZoneName: 'Core', zone_importance: 'secondary' },
  ],
  'Double Unders': [
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Aerobic', zone_importance: 'primary' },
  ],
  'Handstand Push-ups': [{ bodyZoneName: 'Upper Body', zone_importance: 'primary' }],
  'Toes-to-Bar': [{ bodyZoneName: 'Core', zone_importance: 'primary' }],
  'Clean and Jerk': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Upper Body', zone_importance: 'secondary' },
  ],
  'Snatch': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Upper Body', zone_importance: 'secondary' },
  ],
  'Power Clean': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Back', zone_importance: 'secondary' },
  ],
  'Front Squat': [
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Core', zone_importance: 'secondary' },
  ],
  'Thrusters': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Upper Body', zone_importance: 'primary' },
  ],
  'Kettlebell Swings': [
    { bodyZoneName: 'Lower Body', zone_importance: 'primary' },
    { bodyZoneName: 'Back', zone_importance: 'secondary' },
  ],
  'Lunges': [{ bodyZoneName: 'Lower Body', zone_importance: 'primary' }],
  'Plank': [{ bodyZoneName: 'Core', zone_importance: 'primary' }],
  'Renegade Rows': [
    { bodyZoneName: 'Back', zone_importance: 'primary' },
    { bodyZoneName: 'Core', zone_importance: 'primary' },
  ],
  "Farmer's Carry": [
    { bodyZoneName: 'Upper Body', zone_importance: 'primary' },
    { bodyZoneName: 'Core', zone_importance: 'secondary' },
  ],
  'Turkish Get-up': [
    { bodyZoneName: 'Full Body / Dynamic', zone_importance: 'primary' },
    { bodyZoneName: 'Upper Body', zone_importance: 'primary' },
    { bodyZoneName: 'Core', zone_importance: 'primary' },
  ],
}

export default class extends BaseSeeder {
  static enviroment = ['development']

  async run() {
    const bodyZones = await BodyZone.all()
    const bodyZoneByName = new Map(bodyZones.map((bz) => [bz.name, bz.id]))

    for (const [exerciseName, relations] of Object.entries(EXERCISE_BODY_ZONES)) {
      const exercise = await Exercise.findBy('name', exerciseName)
      if (!exercise) {
        console.warn(`[exercise_body_zone_seeder] Exercise not found: ${exerciseName}`)
        continue
      }

      const pivotPayload: Record<number, { zone_importance: ZoneImportance }> = {}
      for (const { bodyZoneName, zone_importance: importance } of relations) {
        const bodyZoneId = bodyZoneByName.get(bodyZoneName)
        if (bodyZoneId === undefined) {
          console.warn(
            `[exercise_body_zone_seeder] Body zone not found: ${bodyZoneName} (exercise: ${exerciseName})`
          )
          continue
        }
        pivotPayload[bodyZoneId] = { zone_importance: importance }
      }

      if (Object.keys(pivotPayload).length > 0) {
        await exercise.related('bodyZones').sync(pivotPayload)
      }
    }
  }
}
