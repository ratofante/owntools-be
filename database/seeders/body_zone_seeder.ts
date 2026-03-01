import { BaseSeeder } from '@adonisjs/lucid/seeders'
import BodyZone from '#models/body_zone'
export default class extends BaseSeeder {
  static enviroment = ['development']
  async run() {
    await BodyZone.createMany([
      {
        name: 'Upper Body',
        description:
          'Muscles of the chest, shoulders, and arms. Primarily responsible for pushing and overhead movements.',
        hexColor: '#E74C3C', // Soft Red
      },
      {
        name: 'Back',
        description:
          'The posterior chain of the upper body, including lats, traps, and rhomboids. Focuses on pulling and posture.',
        hexColor: '#3498DB', // Sky Blue
      },
      {
        name: 'Core',
        description:
          'The central pillar of the body. Includes abdominals, obliques, and stabilizing muscles of the trunk.',
        hexColor: '#F1C40F', // Sunflower Yellow
      },
      {
        name: 'Lower Body',
        description:
          'The high-power muscles of the legs and hips, including quads, hamstrings, glutes, and calves.',
        hexColor: '#27AE60', // Nephrite Green
      },
      {
        name: 'Full Body / Dynamic',
        description:
          'Compound movements that engage multiple zones simultaneously for power, coordination, or high intensity.',
        hexColor: '#8E44AD', // Wisteria Purple
      },
      {
        name: 'Aerobic',
        description:
          'Activities focused on cardiovascular endurance and heart health, often involving rhythmic, sustained movement.',
        hexColor: '#E67E22', // Carrot Orange
      },
    ])
  }
}
