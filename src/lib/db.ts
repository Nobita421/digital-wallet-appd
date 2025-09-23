// Minimal in-memory DB shim to satisfy API routes and seed script during dev
// This implements a tiny subset of the Prisma-like interface used in the app.
import { v4 as uuidv4 } from 'uuid'

type Where = { [key: string]: any }

function applyWhere(items: any[], where?: Where) {
  if (!where) return items
  return items.filter(item => {
    return Object.keys(where).every(k => item[k] === where[k])
  })
}

function orderItems(items: any[], orderBy?: any) {
  if (!orderBy) return items
  const key = Object.keys(orderBy)[0]
  const dir = orderBy[key]
  return items.sort((a, b) => (a[key] < b[key] ? (dir === 'asc' ? -1 : 1) : (a[key] > b[key] ? (dir === 'asc' ? 1 : -1) : 0)))
}

function makeModel(store: any[], opts?: { idKey?: string }) {
  const idKey = opts?.idKey || 'id'
  return {
    findMany: async ({ where, orderBy, take, skip }: any = {}) => {
      let results = applyWhere(store, where)
      if (orderBy) results = orderItems(results, orderBy)
      if (typeof skip === 'number') results = results.slice(skip)
      if (typeof take === 'number') results = results.slice(0, take)
      return results
    },
    count: async ({ where }: any = {}) => {
      return applyWhere(store, where).length
    },
    create: async ({ data }: any) => {
      const item = { ...data }
      if (!item[idKey]) item[idKey] = uuidv4()
      store.push(item)
      return item
    },
    upsert: async ({ where, update, create }: any) => {
      const existing = store.find((it: any) => Object.keys(where).every(k => it[k] === where[k]))
      if (existing) {
        Object.assign(existing, update || {})
        return existing
      }
      const item = { ...(create || {} ) }
      if (!item[idKey]) item[idKey] = uuidv4()
      store.push(item)
      return item
    }
  }
}

// In-memory stores
const users: any[] = []
const wallets: any[] = []
const transactions: any[] = []
const accounts: any[] = []
const bills: any[] = []
const budgets: any[] = []

export const db = {
  user: makeModel(users),
  wallet: makeModel(wallets),
  transaction: makeModel(transactions),
  account: makeModel(accounts),
  bill: makeModel(bills),
  budget: makeModel(budgets),
  // Prisma client utility methods used in seed script
  $disconnect: async () => {},
}

export default db
