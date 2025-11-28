import { apiConfig, endpoints } from './api-config'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = apiConfig.baseURL
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken) {
        this.token = storedToken
      }
    }
  }

  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      ...apiConfig.headers,
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
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
        // Try to get error details from response body
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const text = await response.text()
          console.error('API Error Response:', text)
          // Try parsing as JSON first
          try {
            const errorData = JSON.parse(text)
            if (typeof errorData === 'string') {
              errorMessage = errorData
            } else if (errorData.message) {
              errorMessage = errorData.message
            } else if (typeof errorData === 'object') {
              // Validation errors come as field: message pairs
              errorMessage = Object.entries(errorData)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(', ')
            }
          } catch (e) {
            // Not JSON, use as plain text
            if (text) {
              errorMessage = text
            }
          }
        } catch (e) {
          // Couldn't read response
        }
        throw new Error(errorMessage)
      }

      // Handle empty responses (like 200 OK with no body)
      const text = await response.text()
      if (!text) {
        return {} as T
      }
      // Try to parse as JSON, if fails return as message object
      try {
        return JSON.parse(text)
      } catch (e) {
        // Response is plain text (like "User registered successfully!")
        return { message: text, success: true } as T
      }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth API
  async login(credentials: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // User API
  async searchUsers(query: string) {
    return this.request(`/users/search?query=${encodeURIComponent(query)}`)
  }

  // Wallet API
  async getWallet() {
    return this.request(`${endpoints.wallet}`)
  }

  // Transactions API
  async getTransactions(page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.transactions}?page=${page}&limit=${limit}`)
  }

  // Transfers API
  async createTransfer(transferData: {
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
  async getBills(page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.bills}?page=${page}&limit=${limit}`)
  }

  async createBill(billData: {
    name: string
    amount: number
    currency?: string
    dueDate: string
    category?: string
    description?: string
    isRecurring?: boolean
    recurringPeriod?: string
  }) {
    return this.request(`${endpoints.bills}`, {
      method: 'POST',
      body: JSON.stringify(billData),
    })
  }

  async payBill(billId: string) {
    return this.request(`${endpoints.bills}/pay?billId=${billId}`, {
      method: 'POST',
    })
  }

  // Budgets API
  async getBudgets(page: number = 0, limit: number = 10) {
    return this.request(`${endpoints.budgets}?page=${page}&limit=${limit}`)
  }

  async createBudget(budgetData: {
    name: string
    amount: number
    currency?: string
    category?: string
    period?: string
    startDate: string
    endDate?: string
  }) {
    return this.request(`${endpoints.budgets}`, {
      method: 'POST',
      body: JSON.stringify(budgetData),
    })
  }

  async updateBudget(budgetId: string, budgetData: any) {
    return this.request(`${endpoints.budgets}/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    })
  }

  async deleteBudget(budgetId: string) {
    return this.request(`${endpoints.budgets}/${budgetId}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()