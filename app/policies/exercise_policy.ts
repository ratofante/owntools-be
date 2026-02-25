import User from '#models/user'
import Exercise from '#models/exercise'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ExercisePolicy extends BasePolicy {
  edit(user: User, exercise: Exercise): AuthorizerResponse {
    return user.id === exercise.createdBy
  }

  delete(user: User, exercise: Exercise): AuthorizerResponse {
    return user.id === exercise.createdBy
  }
}
