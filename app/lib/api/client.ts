import type {
  ApiResponse,
  HostGroup,
  CreateHostGroupData,
  UpdateHostGroupData,
  HostGroupStats,
  Host,
  CreateHostData,
  UpdateHostData,
  PortGroup,
  CreatePortGroupData,
  UpdatePortGroupData,
  PortGroupStats,
  PortForward,
  CreatePortForwardData,
  UpdatePortForwardData,
  TunnelSession,
  CreateTunnelSessionData,
  UpdateTunnelSessionData,
  SearchParams,
  PaginatedResponse,
  HealthStatus
} from '~/types/api'

// API配置
export interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

// 请求配置
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
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

export class ApiClient {
  private config: ApiConfig

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
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

      return JSON.parse(text)
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

  // 健康检查
  async health(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health')
  }

  // ===== 主机分组 API =====
  
  async getHostGroups(): Promise<HostGroup[]> {
    return this.request<HostGroup[]>('/api/v1/host-groups')
  }

  async getHostGroup(id: number): Promise<HostGroup> {
    return this.request<HostGroup>(`/api/v1/host-groups/${id}`)
  }

  async createHostGroup(data: CreateHostGroupData): Promise<HostGroup> {
    return this.request<HostGroup>('/api/v1/host-groups', {
      method: 'POST',
      body: data,
    })
  }

  async updateHostGroup(id: number, data: UpdateHostGroupData): Promise<HostGroup> {
    return this.request<HostGroup>(`/api/v1/host-groups/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteHostGroup(id: number): Promise<void> {
    return this.request<void>(`/api/v1/host-groups/${id}`, {
      method: 'DELETE',
    })
  }

  async getHostGroupStats(id: number): Promise<HostGroupStats> {
    return this.request<HostGroupStats>(`/api/v1/host-groups/${id}/stats`)
  }

  // ===== 主机 API =====
  
  async getHosts(): Promise<Host[]> {
    return this.request<Host[]>('/api/v1/hosts')
  }

  async getHost(id: number): Promise<Host> {
    return this.request<Host>(`/api/v1/hosts/${id}`)
  }

  async createHost(data: CreateHostData): Promise<Host> {
    return this.request<Host>('/api/v1/hosts', {
      method: 'POST',
      body: data,
    })
  }

  async updateHost(id: number, data: UpdateHostData): Promise<Host> {
    return this.request<Host>(`/api/v1/hosts/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteHost(id: number): Promise<void> {
    return this.request<void>(`/api/v1/hosts/${id}`, {
      method: 'DELETE',
    })
  }

  async searchHosts(params: SearchParams): Promise<Host[]> {
    return this.request<Host[]>('/api/v1/hosts/search', {
      params,
    })
  }

  // ===== 端口分组 API =====
  
  async getPortGroups(): Promise<PortGroup[]> {
    return this.request<PortGroup[]>('/api/v1/port-groups')
  }

  async getPortGroup(id: number): Promise<PortGroup> {
    return this.request<PortGroup>(`/api/v1/port-groups/${id}`)
  }

  async createPortGroup(data: CreatePortGroupData): Promise<PortGroup> {
    return this.request<PortGroup>('/api/v1/port-groups', {
      method: 'POST',
      body: data,
    })
  }

  async updatePortGroup(id: number, data: UpdatePortGroupData): Promise<PortGroup> {
    return this.request<PortGroup>(`/api/v1/port-groups/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deletePortGroup(id: number): Promise<void> {
    return this.request<void>(`/api/v1/port-groups/${id}`, {
      method: 'DELETE',
    })
  }

  async getPortGroupStats(id: number): Promise<PortGroupStats> {
    return this.request<PortGroupStats>(`/api/v1/port-groups/${id}/stats`)
  }

  // ===== 端口转发 API =====
  
  async getPortForwards(): Promise<PortForward[]> {
    return this.request<PortForward[]>('/api/v1/port-forwards')
  }

  async getPortForward(id: number): Promise<PortForward> {
    return this.request<PortForward>(`/api/v1/port-forwards/${id}`)
  }

  async createPortForward(data: CreatePortForwardData): Promise<PortForward> {
    return this.request<PortForward>('/api/v1/port-forwards', {
      method: 'POST',
      body: data,
    })
  }

  async updatePortForward(id: number, data: UpdatePortForwardData): Promise<PortForward> {
    return this.request<PortForward>(`/api/v1/port-forwards/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deletePortForward(id: number): Promise<void> {
    return this.request<void>(`/api/v1/port-forwards/${id}`, {
      method: 'DELETE',
    })
  }

  async searchPortForwards(params: SearchParams): Promise<PortForward[]> {
    return this.request<PortForward[]>('/api/v1/port-forwards/search', {
      params,
    })
  }

  // ===== 隧道会话 API =====
  
  async getTunnelSessions(): Promise<TunnelSession[]> {
    return this.request<TunnelSession[]>('/api/v1/sessions')
  }

  async getActiveTunnelSessions(): Promise<TunnelSession[]> {
    return this.request<TunnelSession[]>('/api/v1/sessions/active')
  }

  async getTunnelSession(id: number): Promise<TunnelSession> {
    return this.request<TunnelSession>(`/api/v1/sessions/${id}`)
  }

  async createTunnelSession(data: CreateTunnelSessionData): Promise<TunnelSession> {
    return this.request<TunnelSession>('/api/v1/sessions', {
      method: 'POST',
      body: data,
    })
  }

  async updateTunnelSession(id: number, data: UpdateTunnelSessionData): Promise<TunnelSession> {
    return this.request<TunnelSession>(`/api/v1/sessions/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteTunnelSession(id: number): Promise<void> {
    return this.request<void>(`/api/v1/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  async startTunnel(sessionId: number): Promise<void> {
    return this.request<void>(`/api/v1/sessions/${sessionId}/start`, {
      method: 'POST',
    })
  }

  async stopTunnel(sessionId: number): Promise<void> {
    return this.request<void>(`/api/v1/sessions/${sessionId}/stop`, {
      method: 'POST',
    })
  }
}

// TODO 自定义错误类 后续移到types/api.ts
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

// 导出默认实例
export const apiClient = new ApiClient()
