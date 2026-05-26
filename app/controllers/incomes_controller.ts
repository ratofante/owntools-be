import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Income from '#models/income'
import CategoryService from '#services/category_service'
import { createIncomeValidator, patchIncomeValidator } from '#validators/income'

@inject()
export default class IncomesController {
  constructor(private categoryService: CategoryService) {}

  /**
   * GET /incomes?from=&to=
   * Returns incomes for the authenticated user within the date range.
   */
  async index({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const { from, to } = request.qs()

    if (!from || !to) {
      return response.unprocessableEntity({
        message: 'from and to query params are required',
      })
    }

    const incomes = await Income.query()
      .where('user_id', user.id)
      .where('date', '>=', from)
      .where('date', '<=', to)
      .preload('category')
      .orderBy('created_at', 'desc')

    return response.ok({
      incomes: incomes.map((income) => this.serializeIncome(income)),
    })
  }

  /**
   * POST /incomes
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createIncomeValidator)

    const categoryError = await this.categoryService.validateOwnership(
      user.id,
      data.categoryId
    )
    if (categoryError) {
      return response.unprocessableEntity({ message: categoryError })
    }

    const income = await Income.create({
      userId: user.id,
      name: data.name,
      description: data.description ?? null,
      amountCents: data.amount_cents,
      date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
      categoryId: data.categoryId ?? null,
    })

    await income.load('category')

    return response.created(this.serializeIncome(income))
  }

  /**
   * PATCH /incomes/:id
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const income = await Income.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!income) {
      return response.notFound({ message: 'Income not found' })
    }

    const data = await request.validateUsing(patchIncomeValidator)

    const categoryError = await this.categoryService.validateOwnership(
      user.id,
      data.categoryId
    )
    if (categoryError) {
      return response.unprocessableEntity({ message: categoryError })
    }

    if (data.description !== undefined) {
      income.description = data.description || null
    }
    if (data.date !== undefined) {
      income.date = DateTime.fromISO(data.date)
    }
    if (data.name !== undefined) {
      income.name = data.name
    }
    if (data.amount_cents !== undefined) {
      income.amountCents = data.amount_cents
    }
    if (data.categoryId !== undefined) {
      income.categoryId = data.categoryId
    }

    await income.save()
    await income.load('category')

    return response.ok(this.serializeIncome(income))
  }

  /**
   * DELETE /incomes/:id
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const income = await Income.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!income) {
      return response.notFound({ message: 'Income not found' })
    }

    await income.load('category')
    const serialized = this.serializeIncome(income)
    await income.delete()

    return response.ok({ message: 'Income deleted successfully', data: serialized })
  }

  private serializeIncome(income: Income) {
    return {
      ...income.serialize(),
      category: income.category ?? null,
    }
  }
}
