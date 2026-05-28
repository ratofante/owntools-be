import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const users = Array.from({ length: 10 }, (_, index) => {
      const n = index + 1
      return {
        email: `test_user_${n}@test.com`,
        password: 'test1234',
        fullName: `Test User ${n}`,
      }
    })

    await User.createMany(users)
  }
}
