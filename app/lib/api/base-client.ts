// PortFly Base API Client
// 基础 HTTP 客户端，提供通用的请求功能

export interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 默认配置
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: typeof window !== 'undefined' 
    ? window.location.protocol + '//' + window.location.hostname + ':8080'
    : 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

export class BaseApiClient {
  protected config: ApiConfig

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  protected async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = new URL(endpoint, this.config.baseURL)
    
    // 添加查询参数
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const requestInit: RequestInit = {
      method: config.method || 'GET',
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
    }

    // 添加请求体
    if (config.body && config.method !== 'GET') {
      requestInit.body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body)
    }

    // 设置超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
    requestInit.signal = controller.signal

    try {
      const response = await fetch(url.toString(), requestInit)
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
      }

      // 检查响应是否为空
      const text = await response.text()
      if (!text) {
        return {} as T
      }

      const result = JSON.parse(text) as { success: boolean; data: T; error?: string }
      
      // 检查API响应是否成功
      if (!result.success) {
        throw new ApiError(result.error || 'API request failed')
      }
      
      // 返回实际数据
      return result.data as T
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408)
        }
        throw new ApiError(error.message)
      }
      
      throw new ApiError('Unknown error occurred')
    }
  }

  // WebSocket 连接
  createWebSocket(protocols?: string[]): WebSocket {
    const wsUrl = this.config.baseURL.replace(/^http/, 'ws') + '/ws'
    return new WebSocket(wsUrl, protocols)
  }
}
