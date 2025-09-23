import { db } from './db'

async function main() {
  console.log('Seeding database...')

  // Create a sample user
  const user = await db.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      isVerified: true,
    },
  })

  // Create wallet for the user
  const wallet = await db.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      balance: 2540.50,
      currency: 'USD',
    },
  })

  // Create sample transactions
  const transactions = [
    {
      userId: user.id,
      type: 'DEPOSIT' as const,
      amount: 1000.00,
      currency: 'USD',
      description: 'Bank Transfer',
      status: 'COMPLETED' as const,
      reference: 'TXN_001',
    },
    {
      userId: user.id,
      type: 'BILL_PAYMENT' as const,
      amount: 85.00,
      currency: 'USD',
      description: 'Electricity Bill',
      status: 'COMPLETED' as const,
      reference: 'TXN_002',
    },
    {
      userId: user.id,
      type: 'WITHDRAWAL' as const,
      amount: 120.50,
      currency: 'USD',
      description: 'Coffee Shop',
      status: 'COMPLETED' as const,
      reference: 'TXN_003',
    },
    {
      userId: user.id,
      type: 'DEPOSIT' as const,
      amount: 500.00,
      currency: 'USD',
      description: 'Payment from Jane Smith',
      status: 'COMPLETED' as const,
      reference: 'TXN_004',
    },
  ]

  for (const transaction of transactions) {
    await db.transaction.create({
      data: transaction,
    })
  }

  // Create sample accounts
  const accounts = [
    {
      userId: user.id,
      name: 'Chase Bank Account',
      accountType: 'bank',
      accountNumber: '****1234',
      bankName: 'Chase',
      isDefault: true,
      isActive: true,
    },
    {
      userId: user.id,
      name: 'Visa Card',
      accountType: 'card',
      cardType: 'visa',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: false,
      isActive: true,
    },
  ]

  for (const account of accounts) {
    await db.account.create({
      data: account,
    })
  }

  // Create sample bills
  const bills = [
    {
      userId: user.id,
      name: 'Electricity Bill',
      amount: 85.00,
      currency: 'USD',
      dueDate: new Date('2024-02-01'),
      category: 'UTILITIES' as const,
      status: 'PAID' as const,
      description: 'Monthly electricity bill',
    },
    {
      userId: user.id,
      name: 'Internet Bill',
      amount: 59.99,
      currency: 'USD',
      dueDate: new Date('2024-02-05'),
      category: 'UTILITIES' as const,
      status: 'PENDING' as const,
      description: 'Monthly internet bill',
    },
  ]

  for (const bill of bills) {
    await db.bill.create({
      data: bill,
    })
  }

  // Create sample budgets
  const budgets = [
    {
      userId: user.id,
      name: 'Food & Dining',
      amount: 500.00,
      currency: 'USD',
      category: 'Food',
      period: 'MONTHLY' as const,
      spent: 234.50,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      isActive: true,
    },
    {
      userId: user.id,
      name: 'Transportation',
      amount: 200.00,
      currency: 'USD',
      category: 'Transport',
      period: 'MONTHLY' as const,
      spent: 87.25,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      isActive: true,
    },
  ]

  for (const budget of budgets) {
    await db.budget.create({
      data: budget,
    })
  }

  console.log('Database seeded successfully!')
  console.log('User ID:', user.id)
  console.log('Wallet Balance:', wallet.balance)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })