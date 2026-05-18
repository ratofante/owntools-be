import User from '#models/user'
import Wallet from '#models/wallet'
import Category from '#models/category'
import Expense from '#models/expense'
import ExpenseShare from '#models/expense_share'
import CategoryExpense from '#models/category_expense'
import Income from '#models/income'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randPersonalAmount(): number {
  const r = Math.random()
  if (r < 0.5) return randInt(100000, 1000000)
  if (r < 0.85) return randInt(1000000, 8000000)
  return randInt(8000000, 25000000)
}

function randSharedAmount(): number {
  const r = Math.random()
  if (r < 0.4) return randInt(500000, 3000000)
  if (r < 0.8) return randInt(3000000, 15000000)
  return randInt(15000000, 50000000)
}

const MONTHS = [
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
  { year: 2026, month: 5 },
]

const CATEGORY_NAMES = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Ropa',
  'Servicios',
  'Educación',
  'Otros',
]

const PERSONAL_EXPENSE_NAMES = [
  'Supermercado',
  'Verdulería',
  'Panadería',
  'Carnicería',
  'Almacén',
  'Rotisería',
  'Despensa',
  'Colectivo',
  'Uber',
  'InDrive',
  'Combustible',
  'Estacionamiento',
  'Taxi',
  'Peaje',
  'Netflix',
  'Spotify',
  'Cine',
  'Salida bar',
  'Juegos',
  'Disney+',
  'Farmacia',
  'Médico',
  'Odontólogo',
  'Medicamentos',
  'Kinesiólogo',
  'Psicólogo',
  'Vitaminas',
  'Zapatillas',
  'Ropa',
  'Campera',
  'Accesorios',
  'Electricidad',
  'Gas',
  'Internet',
  'Celular',
  'Seguro',
  'Expensas',
  'Libros',
  'Curso online',
  'Inglés',
  'Peluquería',
  'Barbería',
  'Regalo',
  'Ferretería',
  'Mascota',
  'Gomería',
  'Reparación',
]

const SHARED_EXPENSE_NAMES = [
  'Supermercado Carrefour',
  'Despensa barrio',
  'Verdulería',
  'Mercado',
  'Restaurante',
  'Parrilla',
  'Pizza',
  'Sushi',
  'Delivery',
  'Café',
  'Internet hogar',
  'Electricidad',
  'Gas hogar',
  'Agua',
  'Netflix compartido',
  'Expensas',
  'Limpieza',
  'Plomero',
  'Electricista',
  'Pintura',
  'Muebles',
  'Electrodoméstico',
  'Jardín',
  'Salida cena',
  'Viaje fin de semana',
]

const INCOME_NAMES = [
  'Sueldo',
  'Freelance',
  'Bono',
  'Cobro factura',
  'Consultoría',
  'Venta artículo',
  'Extra',
  'Premio',
  'Alquiler cobrado',
]

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const sumo = await User.findByOrFail('email', 'sumo.silvetti@example.com')
    const cumbia = await User.findByOrFail('email', 'cumbia.gonzalez@example.com')

    const sumoWallet = await Wallet.create({
      name: 'Gastos Personales',
      currency: 'ARS',
      walletType: 'personal',
    })
    await sumoWallet.related('users').attach({ [sumo.id]: { role: 'owner', status: 'active' } })

    const cumbiaWallet = await Wallet.create({
      name: 'Gastos Personales',
      currency: 'ARS',
      walletType: 'personal',
    })
    await cumbiaWallet.related('users').attach({ [cumbia.id]: { role: 'owner', status: 'active' } })

    const sharedWallet = await Wallet.create({
      name: 'Gastos Compartidos',
      currency: 'ARS',
      walletType: 'shared',
    })
    await sharedWallet.related('users').attach({
      [sumo.id]: { role: 'owner', status: 'active' },
      [cumbia.id]: { role: 'member', status: 'active' },
    })

    const sumoCategories = await Category.createMany(
      CATEGORY_NAMES.map((name) => ({ userId: sumo.id, name }))
    )
    const cumbiaCategories = await Category.createMany(
      CATEGORY_NAMES.map((name) => ({ userId: cumbia.id, name }))
    )

    for (const { year, month } of MONTHS) {
      await this.createPersonalExpenses(sumo.id, sumoWallet.id, sumoCategories, year, month)
      await this.createPersonalExpenses(cumbia.id, cumbiaWallet.id, cumbiaCategories, year, month)

      await Income.createMany(this.buildIncomes(sumo.id, sumoCategories, year, month))
      await Income.createMany(this.buildIncomes(cumbia.id, cumbiaCategories, year, month))

      await this.createSharedExpenses(
        sharedWallet.id,
        sumo.id,
        cumbia.id,
        sumoCategories,
        cumbiaCategories,
        year,
        month
      )
    }
  }

  private async createPersonalExpenses(
    userId: number,
    walletId: number,
    categories: Category[],
    year: number,
    month: number
  ) {
    const count = randInt(30, 40)
    const rows = Array.from({ length: count }, () => {
      const category = Math.random() > 0.15 ? pick(categories) : null
      return {
        expense: {
          walletId,
          paidByUserId: userId,
          name: pick(PERSONAL_EXPENSE_NAMES),
          amountCents: randPersonalAmount(),
          isShared: false,
          splitType: null,
          date: DateTime.fromObject({ year, month, day: randInt(1, 28) }),
        },
        categoryId: category?.id ?? null,
      }
    })

    const expenses = await Expense.createMany(rows.map((r) => r.expense))

    const categoryExpenses = rows
      .map((r, i) =>
        r.categoryId !== null
          ? { expenseId: expenses[i].id, categoryId: r.categoryId, userId }
          : null
      )
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (categoryExpenses.length > 0) {
      await CategoryExpense.createMany(categoryExpenses)
    }
  }

  private buildIncomes(userId: number, categories: Category[], year: number, month: number) {
    return Array.from({ length: randInt(1, 5) }, () => ({
      userId,
      categoryId: Math.random() > 0.5 ? pick(categories).id : null,
      name: pick(INCOME_NAMES),
      amountCents: randInt(30000000, 120000000),
      date: DateTime.fromObject({ year, month, day: randInt(1, 28) }),
    }))
  }

  private async createSharedExpenses(
    walletId: number,
    sumoId: number,
    cumbiaId: number,
    sumoCategories: Category[],
    cumbiaCategories: Category[],
    year: number,
    month: number
  ) {
    const count = randInt(15, 30)

    for (let i = 0; i < count; i++) {
      const payerId = Math.random() > 0.5 ? sumoId : cumbiaId
      const otherId = payerId === sumoId ? cumbiaId : sumoId
      const amountCents = randSharedAmount()
      const isCustom = Math.random() < 0.2
      const splitType = isCustom ? ('custom' as const) : ('equal' as const)

      let payerShare: number
      let otherShare: number

      if (isCustom) {
        const payerPct = pick([60, 65, 70])
        payerShare = Math.floor((amountCents * payerPct) / 100)
        otherShare = amountCents - payerShare
      } else {
        payerShare = Math.floor(amountCents / 2)
        otherShare = amountCents - payerShare
      }

      const expense = await Expense.create({
        walletId,
        paidByUserId: payerId,
        name: pick(SHARED_EXPENSE_NAMES),
        amountCents,
        isShared: true,
        splitType,
        date: DateTime.fromObject({ year, month, day: randInt(1, 28) }),
      })

      await ExpenseShare.createMany([
        {
          expenseId: expense.id,
          userId: payerId,
          shareAmountCents: payerShare,
          paidAmountCents: amountCents,
          status: 'settled' as const,
        },
        {
          expenseId: expense.id,
          userId: otherId,
          shareAmountCents: otherShare,
          paidAmountCents: 0,
          status: 'pending' as const,
        },
      ])

      // Each user independently assigns their own category to the shared expense
      const payerCategories = payerId === sumoId ? sumoCategories : cumbiaCategories
      const otherCategories = otherId === sumoId ? sumoCategories : cumbiaCategories

      const categoryEntries = [
        Math.random() > 0.2
          ? { expenseId: expense.id, categoryId: pick(payerCategories).id, userId: payerId }
          : null,
        Math.random() > 0.2
          ? { expenseId: expense.id, categoryId: pick(otherCategories).id, userId: otherId }
          : null,
      ].filter((r): r is NonNullable<typeof r> => r !== null)

      if (categoryEntries.length > 0) {
        await CategoryExpense.createMany(categoryEntries)
      }
    }
  }
}
