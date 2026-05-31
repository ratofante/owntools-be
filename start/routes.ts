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
const WalletsController = () => import('#controllers/wallets_controller')
const ExpensesController = () => import('#controllers/expenses_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const IncomesController = () => import('#controllers/incomes_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.get('/test', [UsersController, 'index'])

router.post('/session', [SessionController, 'store'])
router.delete('/session', [SessionController, 'destroy']).use(middleware.auth({ guards: ['api'] }))
router.get('/session', [SessionController, 'show']).use(middleware.auth({ guards: ['api'] }))
router.patch('/session', [SessionController, 'refresh']).use(middleware.auth({ guards: ['api'] }))

/* ************************** Users Routes ************************** */
router
  .group(() => {
    router.post('register', [UsersController, 'store'])
    router
      .group(() => {
        router.get('search', [UsersController, 'search'])
        router.delete('delete/:id', [UsersController, 'destroy'])
      })
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/users')

/* ************************** Wallets Routes ************************** */
router
  .group(() => {
    router.get('/', [WalletsController, 'index'])
    router.post('/create', [WalletsController, 'create'])
    router.get('/personal-expenses', [WalletsController, 'personalExpenses'])
    router.patch('/:walletId/invitation', [WalletsController, 'respondToInvitation'])

    router.get('/:id', [WalletsController, 'find'])
    router
      .group(() => {
        router.get('/:walletId/balances', [WalletsController, 'balances'])
      })
      .use(middleware.walletAccess())

    /* ── Categories ── */
    router
      .group(() => {
        router.get('/:walletId/categories', [WalletsController, 'categories'])
        router.post('/:walletId/categories', [WalletsController, 'createCategory'])
      })
      .use(middleware.walletAccess())

    /* ── Expenses ── */
    router
      .group(() => {
        router.get('/:walletId/expenses', [ExpensesController, 'index'])
        router.post('/:walletId/expenses', [ExpensesController, 'store'])
        router.patch('/:walletId/expenses/:id', [ExpensesController, 'patchPersonal'])
        router.patch('/:walletId/expenses/:id/category', [ExpensesController, 'patchCategory'])
        router.put('/:walletId/expenses/:id', [ExpensesController, 'updateShared'])
        router.delete('/:walletId/expenses/:id', [ExpensesController, 'destroy'])
      })
      .use(middleware.walletAccess())
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('/wallets')

/* ************************** Incomes Routes ************************** */
router
  .group(() => {
    router.get('/', [IncomesController, 'index'])
    router.post('/', [IncomesController, 'store'])
    router.patch('/:id', [IncomesController, 'update'])
    router.delete('/:id', [IncomesController, 'destroy'])
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('/incomes')

/* ************************** Categories Routes ************************** */
router
  .group(() => {
    router.get('/', [CategoriesController, 'index'])
    router.post('/', [CategoriesController, 'store'])
    router.patch('/:id', [CategoriesController, 'update'])
    router.delete('/:id', [CategoriesController, 'destroy'])
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('/categories')
