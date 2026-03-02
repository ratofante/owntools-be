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
        hexColor: '#e74c3cba', // Soft Red
      },
      {
        name: 'Back',
        description:
          'The posterior chain of the upper body, including lats, traps, and rhomboids. Focuses on pulling and posture.',
        hexColor: '#3498DB80', // Sky Blue
      },
      {
        name: 'Core',
        description:
          'The central pillar of the body. Includes abdominals, obliques, and stabilizing muscles of the trunk.',
        hexColor: '#f1c40f80', // Sunflower Yellow
      },
      {
        name: 'Lower Body',
        description:
          'The high-power muscles of the legs and hips, including quads, hamstrings, glutes, and calves.',
        hexColor: '#27ae6080', // Nephrite Green
      },
      {
        name: 'Full Body / Dynamic',
        description:
          'Compound movements that engage multiple zones simultaneously for power, coordination, or high intensity.',
        hexColor: '#8e44ad80', // Purple
      },
      {
        name: 'Aerobic',
        description:
          'Activities focused on cardiovascular endurance and heart health, often involving rhythmic, sustained movement.',
        hexColor: '#E67E2280', // Carrot Orange
      },
    ])
  }
}
