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
router.get('/exercises', [ExercisesController, 'index'])
router.post('/exercises', [ExercisesController, 'create'])
router.patch('/exercises/:id', [ExercisesController, 'update'])
router.delete('/exercises/:id', [ExercisesController, 'delete'])
