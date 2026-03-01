import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MuscleGroup from '#models/muscle_group'

export default class extends BaseSeeder {
  static enviroment = ['development']
  async run() {
    await MuscleGroup.createMany([
      {
        name: 'Pectorals',
        description:
          'The chest muscles, responsible for pushing movements and bringing the arms across the body.',
      },
      {
        name: 'Lats',
        description:
          "Latissimus dorsi; the large muscles of the back that create a 'V' shape and handle pulling.",
      },
      {
        name: 'Traps',
        description:
          'Trapezius; muscles spanning the upper back and neck, responsible for shrugging and shoulder stability.',
      },
      {
        name: 'Rhomboids',
        description:
          'Smaller muscles between the shoulder blades essential for posture and pulling the shoulders back.',
      },
      {
        name: 'Deltoids',
        description:
          'The shoulder muscles, divided into anterior (front), lateral (side), and posterior (rear) heads.',
      },
      {
        name: 'Triceps',
        description:
          'The muscles on the back of the upper arm, responsible for straightening the elbow.',
      },
      {
        name: 'Biceps',
        description:
          'The muscles on the front of the upper arm, responsible for flexing the elbow.',
      },
      {
        name: 'Forearms',
        description:
          'The muscles between the elbow and wrist, crucial for grip strength and wrist stability.',
      },
      {
        name: 'Abs',
        description:
          "Rectus abdominis; the 'six-pack' muscles used for trunk flexion and core stability.",
      },
      {
        name: 'Obliques',
        description: 'Muscles on the sides of the abdomen used for twisting and lateral stability.',
      },
      {
        name: 'Lower Back',
        description:
          'Erector spinae; muscles that support the spine and allow for trunk extension.',
      },
      {
        name: 'Quads',
        description:
          'Quadriceps; the large muscles on the front of the thigh used for extending the knee.',
      },
      {
        name: 'Hamstrings',
        description:
          'The muscles on the back of the thigh used for knee flexion and hip extension.',
      },
      {
        name: 'Glutes',
        description:
          'The muscles of the buttocks, the primary drivers for hip extension and power.',
      },
      {
        name: 'Calves',
        description:
          'The muscles on the lower leg (gastrocnemius and soleus) used for ankle movement.',
      },
      {
        name: 'Adductors',
        description: 'The inner thigh muscles that pull the legs toward the midline of the body.',
      },
      {
        name: 'Abductors',
        description:
          'The outer hip muscles (like the glute medius) that move the legs away from the midline.',
      },
    ])
  }
}
