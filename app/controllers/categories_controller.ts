import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'

export default class CategoriesController {
  private async findOwnedCategory(userId: number, categoryId: number) {
    return Category.query().where('id', categoryId).where('userId', userId).first()
  }

  async index({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const { from, to } = request.qs()

    if (!from || !to) {
      return response.unprocessableEntity({
        message: 'from and to query params are required',
      })
    }

    const categories = await Category.query()
      .where('userId', userId)
      .preload('incomes', (query) => {
        query
          .where('user_id', userId)
          .where('date', '>=', from)
          .where('date', '<=', to)
      })
      .preload('categoryExpenses', (query) => {
        query
          .where('user_id', userId)
          .whereHas('expense', (expenseQuery) => {
            expenseQuery.where('date', '>=', from).where('date', '<=', to)
          })
          .preload('expense')
      })
      .orderBy('name', 'asc')

    return response.status(200).json({
      categories: categories.map((category) => {
        const expenseTotalCents = category.categoryExpenses.reduce(
          (sum, categoryExpense) => sum + categoryExpense.expense.amountCents,
          0
        )
        const incomeTotalCents = category.incomes.reduce(
          (sum, income) => sum + income.amountCents,
          0
        )

        return {
          ...category.serialize(),
          expenseCount: category.categoryExpenses.length,
          expenseTotalCents,
          incomeCount: category.incomes.length,
          incomeTotalCents,
        }
      }),
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
