import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'

export default class CategoriesController {
  private async findOwnedCategory(userId: number, categoryId: number) {
    return Category.query().where('id', categoryId).where('userId', userId).first()
  }
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

  async store({ auth, request, response }: HttpContext) {
    const { name, description } = await request.validateUsing(createCategoryValidator)

    const category = await Category.create({
      name,
      description: description ?? null,
      userId: auth.user!.id,
    })

    return response.status(201).json({ category })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const category = await this.findOwnedCategory(auth.user!.id, Number(params.id))

    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    const { name, description } = await request.validateUsing(updateCategoryValidator)

    if (name !== undefined) {
      category.name = name
    }
    if (description !== undefined) {
      category.description = description
    }

    await category.save()

    return response.status(200).json({ category })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const category = await this.findOwnedCategory(auth.user!.id, Number(params.id))

    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    await category.delete()

    return response.noContent()
  }
}
