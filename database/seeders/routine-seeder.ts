import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Routine from '#models/routine'
import WorkoutBlock from '#models/workout_block'
import Set from '#models/set'

export default class extends BaseSeeder {
  static enviroment = ['development']
  async run() {
    // --- Sets ---
    // Standard block: heavy compound lifts (Bench Press + Back Squat)
    const standardSets = await Set.createMany([
      {
        exerciseId: 1,
        description: 'Bench Press - heavy',
        series: 4,
        repetitions: 5,
        rest: 180,
        targetWeightUnit: 'kg',
        targetWeightManMax: 100,
        targetWeightManMin: 80,
      },
      {
        exerciseId: 3,
        description: 'Back Squat - heavy',
        series: 4,
        repetitions: 5,
        rest: 180,
        targetWeightUnit: 'kg',
        targetWeightManMax: 120,
        targetWeightManMin: 100,
      },
    ])

    // Superset block: Bicep Curls + Dips back-to-back
    const supersetSets = await Set.createMany([
      {
        exerciseId: 5,
        description: 'Bicep Curls',
        series: 3,
        repetitions: 12,
        rest: 0,
        targetWeightUnit: 'kg',
        targetWeightManMax: 20,
        targetWeightManMin: 15,
      },
      {
        exerciseId: 7,
        description: 'Dips',
        series: 3,
        repetitions: 12,
        rest: 90,
      },
    ])

    // Circuit block: Burpees → Box Jumps → Wall Balls
    const circuitSets = await Set.createMany([
      {
        exerciseId: 8,
        description: 'Burpees',
        series: 1,
        repetitions: 15,
        rest: 0,
      },
      {
        exerciseId: 10,
        description: 'Box Jumps',
        series: 1,
        repetitions: 15,
        rest: 0,
      },
      {
        exerciseId: 11,
        description: 'Wall Balls',
        series: 1,
        repetitions: 20,
        rest: 30,
        targetWeightUnit: 'kg',
        targetWeightManMax: 9,
        targetWeightManMin: 6,
      },
    ])

    // AMRAP block: Thrusters + Lat Pulldowns
    const amrapSets = await Set.createMany([
      {
        exerciseId: 19,
        description: 'Thrusters',
        series: 1,
        repetitions: 5,
        targetWeightUnit: 'kg',
        targetWeightManMax: 43,
        targetWeightManMin: 35,
      },
      {
        exerciseId: 6,
        description: 'Lat Pulldowns',
        series: 1,
        repetitions: 7,
      },
    ])

    // EMOM block: alternating Power Clean / Front Squat each minute
    const emomSets = await Set.createMany([
      {
        exerciseId: 17,
        description: 'Power Clean - odd minutes',
        series: 1,
        repetitions: 3,
        targetWeightUnit: 'kg',
        targetWeightManMax: 70,
        targetWeightManMin: 60,
      },
      {
        exerciseId: 18,
        description: 'Front Squat - even minutes',
        series: 1,
        repetitions: 3,
        targetWeightUnit: 'kg',
        targetWeightManMax: 80,
        targetWeightManMin: 70,
      },
    ])

    // HIIT block: Kettlebell Swings + Double Unders, 30s work / 30s rest
    const hiitSets = await Set.createMany([
      {
        exerciseId: 20,
        description: 'Kettlebell Swings - 30s all out',
        series: 1,
        timePerSeries: 30,
        rest: 30,
        targetWeightUnit: 'kg',
        targetWeightManMax: 24,
        targetWeightManMin: 16,
      },
      {
        exerciseId: 12,
        description: 'Double Unders - 30s all out',
        series: 1,
        timePerSeries: 30,
        rest: 30,
      },
    ])

    // --- Workout Blocks ---
    const standardBlock = await WorkoutBlock.create({
      type: 'standard',
      name: 'Heavy Strength Block',
      description: 'Low rep, high weight compound lifts',
      roundsPerWorkout: 1,
      restAfterWorkout: 120,
    })
    await standardBlock.related('sets').attach({
      [standardSets[0].id]: { position: 1 },
      [standardSets[1].id]: { position: 2 },
    })

    const supersetBlock = await WorkoutBlock.create({
      type: 'superset',
      name: 'Arms Superset',
      description: 'Biceps and triceps superset with minimal rest between exercises',
      roundsPerWorkout: 3,
      restAfterRound: 90,
      restAfterWorkout: 120,
    })
    await supersetBlock.related('sets').attach({
      [supersetSets[0].id]: { position: 1 },
      [supersetSets[1].id]: { position: 2 },
    })

    const circuitBlock = await WorkoutBlock.create({
      type: 'circuit',
      name: 'Conditioning Circuit',
      description: 'Full-body conditioning circuit, minimal rest between stations',
      roundsPerWorkout: 4,
      restAfterRound: 60,
      restAfterWorkout: 180,
    })
    await circuitBlock.related('sets').attach({
      [circuitSets[0].id]: { position: 1 },
      [circuitSets[1].id]: { position: 2 },
      [circuitSets[2].id]: { position: 3 },
    })

    const amrapBlock = await WorkoutBlock.create({
      type: 'amrap',
      name: '12-Min AMRAP',
      description: 'As many rounds as possible in 12 minutes',
      workoutDuration: 12,
      restAfterWorkout: 300,
    })
    await amrapBlock.related('sets').attach({
      [amrapSets[0].id]: { position: 1 },
      [amrapSets[1].id]: { position: 2 },
    })

    const emomBlock = await WorkoutBlock.create({
      type: 'emom',
      name: '10-Min EMOM',
      description: 'Every minute on the minute for 10 minutes, alternating between two movements',
      workoutDuration: 10,
      restAfterWorkout: 180,
    })
    await emomBlock.related('sets').attach({
      [emomSets[0].id]: { position: 1 },
      [emomSets[1].id]: { position: 2 },
    })

    const hiitBlock = await WorkoutBlock.create({
      type: 'hiit',
      name: 'Metabolic HIIT',
      description: '30s work / 30s rest intervals for 20 minutes',
      workoutDuration: 20,
      timeToComplete: 30,
      restAfterRound: 30,
      restAfterWorkout: 180,
    })
    await hiitBlock.related('sets').attach({
      [hiitSets[0].id]: { position: 1 },
      [hiitSets[1].id]: { position: 2 },
    })

    // --- Routine ---
    const routine = await Routine.create({
      name: 'Full Test Routine',
      createdBy: 1,
    })
    await routine.related('workoutBlocks').attach({
      [standardBlock.id]: { position: 1 },
      [supersetBlock.id]: { position: 2 },
      [circuitBlock.id]: { position: 3 },
      [amrapBlock.id]: { position: 4 },
      [emomBlock.id]: { position: 5 },
      [hiitBlock.id]: { position: 6 },
    })
  }
}
