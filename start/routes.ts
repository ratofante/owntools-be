/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const SessionController = () => import('#controllers/session_controller')
const UsersController = () => import('#controllers/users_controller')
const ExercisesController = () => import('#controllers/exercises_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.get('/test', [UsersController, 'index'])

router.post('/session', [SessionController, 'store'])
router.delete('/session', [SessionController, 'destroy']).use(middleware.auth({ guards: ['api'] }))

/* ************************** Users Routes ************************** */
router
  .group(() => {
    router.post('register', [UsersController, 'store'])
    router
      .delete('delete/:id', [UsersController, 'destroy'])
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/users')

/* ************************** Exercises Routes ************************** */
router
  .group(() => {
    router.get('/', [ExercisesController, 'index'])
    router
      .group(() => {
        router.post('/', [ExercisesController, 'create'])
        router.patch('/:id', [ExercisesController, 'update'])
        router.delete(':id', [ExercisesController, 'delete'])
      })
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/exercises')
