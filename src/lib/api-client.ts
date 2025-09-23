
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
  async getBills(userId: string) {
    return this.request(`${endpoints.bills}?userId=${userId}`)
  }

  async payBill(billId: string, userId: string) {
    return this.request(`${endpoints.bills}/pay`, {
      method: 'POST',
      body: JSON.stringify({ billId, userId }),
    })
  }
}

export const apiClient = new ApiClient()