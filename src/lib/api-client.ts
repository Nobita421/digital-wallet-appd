import { apiConfig, endpoints } from './api-config'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = apiConfig.baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...apiConfig.headers,
        ...options.headers,
      },
    }

    // Remove Content-Type header for GET requests
    if (config.method === 'GET' || (!config.method && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'PATCH')) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete (config.headers as any)['Content-Type']
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Wallet API
  async getWallet(userId: string) {
    return this.request(`${endpoints.wallet}?userId=${userId}`)
  }

  // Transactions API
  async getTransactions(userId: string, page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.transactions}?userId=${userId}&page=${page}&limit=${limit}`)
  }

  // Transfers API
  async createTransfer(transferData: {
    senderId: string
    receiverId: string
    amount: number
    currency?: string
    description?: string
  }) {
    return this.request(endpoints.transfers, {
      method: 'POST',
      body: JSON.stringify(transferData),
    })
  }

  // Bills API
  async getBills(userId: string, page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.bills}?userId=${userId}&page=${page}&limit=${limit}`)
  }

  async createBill(userId: string, billData: {
    name: string
    amount: number
    currency?: string
    dueDate: string
    category?: string
    description?: string
    isRecurring?: boolean
    recurringPeriod?: string
  }) {
    return this.request(`${endpoints.bills}?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(billData),
    })
  }

  async payBill(billId: string, userId: string) {
    return this.request(`${endpoints.bills}/pay?billId=${billId}&userId=${userId}`, {
      method: 'POST',
    })
  }

  // Budgets API
  async getBudgets(userId: string, page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.budgets}?userId=${userId}&page=${page}&limit=${limit}`)
  }

  async createBudget(userId: string, budgetData: {
    name: string
    amount: number
    currency?: string
    category?: string
    period?: string
    startDate: string
    endDate?: string
  }) {
    return this.request(`${endpoints.budgets}?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(budgetData),
    })
  }

  async updateBudget(budgetId: string, userId: string, budgetData: any) {
    return this.request(`${endpoints.budgets}/${budgetId}?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    })
  }

  async deleteBudget(budgetId: string, userId: string) {
    return this.request(`${endpoints.budgets}/${budgetId}?userId=${userId}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()