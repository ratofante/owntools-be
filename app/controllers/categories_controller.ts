import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'

export default class CategoriesController {
  async index({ auth, response }: HttpContext) {
    const categories = await Category.query()
      .where('userId', auth.user!.id)
      .withCount('categoryExpenses', (q) => q.where('user_id', auth.user!.id))
      .orderBy('name', 'asc')

    return response.status(200).json({
      categories: categories.map((category) => ({
        ...category.serialize(),
        expenseCount: Number(category.$extras.categoryExpenses_count),
      })),
    })
  }
}
