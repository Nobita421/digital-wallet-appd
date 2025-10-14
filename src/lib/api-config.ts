
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081/api'

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

export const endpoints = {
  wallet: '/wallet',
  transactions: '/transactions',
  transfers: '/transfers',
  bills: '/bills',
  budgets: '/budgets'
}
