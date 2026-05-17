import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static enviroment = ['development', 'test']

  async run() {
    await User.createMany([
      {
        email: 'sumo.silvetti@example.com',
        password: 'sumo1234',
        fullName: 'Sumo Silvetti',
      },
      {
        email: 'cumbia.gonzalez@example.com',
        password: 'cumbia1234',
        fullName: 'Cumbia Gonzalez',
      },
      {
        email: 'empty.user@example.com',
        password: 'empty1234',
        fullName: 'Empty User',
      },
    ])
  }
}
