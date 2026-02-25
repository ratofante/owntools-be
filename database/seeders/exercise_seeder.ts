import Exercise from '#models/exercise'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static enviroment = ['development']

  async run() {
    await Exercise.createMany([
      {
        name: 'Bench Press',
        description: 'A fundamental compound exercise for the chest, shoulders, and triceps.',
      },
      {
        name: 'Deadlift',
        description:
          'A powerhouse movement targeting the posterior chain, including the back, glutes, and hamstrings.',
      },
      {
        name: 'Back Squat',
        description: 'The "king of exercises" for developing lower body strength and hypertrophy.',
      },
      {
        name: 'Overhead Press',
        description: 'A strict press from the shoulders to overhead to build upper body power.',
      },
      {
        name: 'Bicep Curls',
        description: 'An isolation movement focusing on the elbow flexors for arm development.',
      },
      {
        name: 'Lat Pulldowns',
        description: 'A vertical pulling movement to build width in the latissimus dorsi.',
      },
      {
        name: 'Dips',
        description: 'A bodyweight or weighted movement targeting the triceps and lower chest.',
      },
      {
        name: 'Burpees',
        description: 'A full-body exercise used for strength training and aerobic conditioning.',
      },
      {
        name: 'Muscle-ups',
        description: 'An advanced gymnastics move combining a pull-up and a dip.',
      },
      {
        name: 'Box Jumps',
        description: 'A plyometric exercise that builds explosive power and leg strength.',
      },
      {
        name: 'Wall Balls',
        description: 'A functional movement involving a squat and throwing a med ball to a target.',
      },
      {
        name: 'Double Unders',
        description: 'A jump rope technique where the rope passes under the feet twice per jump.',
      },
      {
        name: 'Handstand Push-ups',
        description: 'A vertical push focusing on shoulder strength and balance.',
      },
      {
        name: 'Toes-to-Bar',
        description:
          'A core-intensive movement where the athlete hangs from a bar and touches it with their toes.',
      },
      {
        name: 'Clean and Jerk',
        description:
          'A dynamic two-part Olympic lift that moves a barbell from the floor to overhead.',
      },
      {
        name: 'Snatch',
        description:
          'The fastest Olympic lift, moving the barbell from the floor to overhead in one fluid motion.',
      },
      {
        name: 'Power Clean',
        description:
          'An explosive lift pulling the bar from the floor to the shoulders without a deep squat.',
      },
      {
        name: 'Front Squat',
        description:
          'A squat variation with the barbell held in the front rack position, emphasizing the quads.',
      },
      {
        name: 'Thrusters',
        description: 'A hybrid movement combining a front squat and an overhead press.',
      },
      {
        name: 'Kettlebell Swings',
        description: 'A hinge-based movement for explosive power in the hips and glutes.',
      },
      {
        name: 'Lunges',
        description: 'A unilateral leg exercise that improves balance and lower body coordination.',
      },
      {
        name: 'Plank',
        description: 'An isometric core exercise that builds stability throughout the midsection.',
      },
      {
        name: 'Renegade Rows',
        description: 'A plank-position row that challenges both the back and core stability.',
      },
      {
        name: "Farmer's Carry",
        description:
          'A functional movement involving walking while holding heavy weights to build grip and core.',
      },
      {
        name: 'Turkish Get-up',
        description:
          'A complex, multi-stage movement that builds total-body stability and mobility.',
      },
    ])
  }
}
