import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Category from '#models/category'
import CategoryExpense from '#models/category_expense'

@inject()
export default class CategoryService {
  async validateOwnership(
    userId: number,
    categoryId: number | null | undefined
  ): Promise<string | null> {
    if (categoryId === undefined || categoryId === null) {
      return null
    }

    const category = await Category.query().where('id', categoryId).where('userId', userId).first()

    if (!category) {
      return 'Category does not belong to this user'
    }

    return null
  }

  async applyChange(
    trx: TransactionClientContract,
    expenseId: number,
    userId: number,
    categoryId: number | null | undefined
  ): Promise<void> {
    if (categoryId === null) {
      await CategoryExpense.query({ client: trx })
        .where('expense_id', expenseId)
        .where('user_id', userId)
        .delete()
    } else if (categoryId !== undefined) {
      await CategoryExpense.updateOrCreate({ expenseId, userId }, { categoryId }, { client: trx })
    }
  }
}
