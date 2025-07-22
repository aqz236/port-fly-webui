// PortFly API Client v2
// 支持新架构：Project -> Group -> (Host + Port)
// TODO 用Tanstack Query优化请求

import type {
  ApiResponse,
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectStats,
  ProjectTreeNode,
  MoveProjectParams,
  Group,
  CreateGroupData,
  UpdateGroupData,
  GroupStats,
  Host,
  CreateHostData,
  UpdateHostData,
  HostStats,
  PortForward,
  CreatePortForwardData,
  UpdatePortForwardData,
  PortForwardStats,
  TunnelSession,
  CreateTunnelSessionData,
  UpdateTunnelSessionData,
  SessionStats,
  SearchParams,
  PaginatedResponse,
  HealthStatus,
  SystemStats,
  BulkOperationRequest,
  BulkOperationResponse,
  ExportData,
  ImportResult,
  UserPreferences,
  UpdateUserPreferencesData
} from '../../types/api'

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

// API错误类
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

      const result = JSON.parse(text) as ApiResponse<T>
      
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

  // ===== 健康检查 =====
  
  async health(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health')
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/v1/system/stats')
  }

  // ===== 项目管理 =====
  
  async getProjects(params?: {
    parent_id?: number;
    include_children?: boolean;
    as_tree?: boolean;
  }): Promise<Project[] | ProjectTreeNode[]> {
    const searchParams = new URLSearchParams()
    if (params?.parent_id !== undefined) {
      searchParams.set('parent_id', params.parent_id.toString())
    }
    if (params?.include_children) {
      searchParams.set('include_children', 'true')
    }
    if (params?.as_tree) {
      searchParams.set('as_tree', 'true')
    }
    
    const url = searchParams.toString() 
      ? `/api/v1/projects?${searchParams.toString()}`
      : '/api/v1/projects'
    
    return this.request<Project[] | ProjectTreeNode[]>(url)
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}`)
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    return this.request<Project>('/api/v1/projects', {
      method: 'POST',
      body: data,
    })
  }

  async updateProject(id: number, data: UpdateProjectData): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteProject(id: number): Promise<void> {
    return this.request<void>(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getProjectStats(id: number): Promise<ProjectStats> {
    return this.request<ProjectStats>(`/api/v1/projects/${id}/stats`)
  }

  async getProjectChildren(id: number): Promise<Project[]> {
    return this.request<Project[]>(`/api/v1/projects/${id}/children`)
  }

  async moveProject(params: MoveProjectParams): Promise<void> {
    return this.request<void>('/api/v1/projects/move', {
      method: 'POST',
      body: params,
    })
  }

  // ===== 组管理 =====
  
  async getGroups(projectId?: number): Promise<Group[]> {
    const params = projectId ? { project_id: projectId } : undefined
    return this.request<Group[]>('/api/v1/groups', { params })
  }

  async getGroup(id: number): Promise<Group> {
    return this.request<Group>(`/api/v1/groups/${id}`)
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    return this.request<Group>('/api/v1/groups', {
      method: 'POST',
      body: data,
    })
  }

  async updateGroup(id: number, data: UpdateGroupData): Promise<Group> {
    return this.request<Group>(`/api/v1/groups/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteGroup(id: number): Promise<void> {
    return this.request<void>(`/api/v1/groups/${id}`, {
      method: 'DELETE',
    })
  }

  async getGroupStats(id: number): Promise<GroupStats> {
    return this.request<GroupStats>(`/api/v1/groups/${id}/stats`)
  }

  // ===== 主机管理 =====
  
  async getHosts(groupId?: number): Promise<Host[]> {
    const params = groupId ? { group_id: groupId } : undefined
    return this.request<Host[]>('/api/v1/hosts', { params })
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

  async getHostStats(id: number): Promise<HostStats> {
    return this.request<HostStats>(`/api/v1/hosts/${id}/stats`)
  }

  async testHostConnection(id: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/v1/hosts/${id}/test`, {
      method: 'POST',
    })
  }

  async searchHosts(params: SearchParams): Promise<Host[]> {
    return this.request<Host[]>('/api/v1/hosts/search', { params })
  }

  // ===== 端口转发管理 =====
  
  async getPortForwards(groupId?: number): Promise<PortForward[]> {
    const params = groupId ? { group_id: groupId } : undefined
    return this.request<PortForward[]>('/api/v1/port-forwards', { params })
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

  async getPortForwardStats(id: number): Promise<PortForwardStats> {
    return this.request<PortForwardStats>(`/api/v1/port-forwards/${id}/stats`)
  }

  async searchPortForwards(params: SearchParams): Promise<PortForward[]> {
    return this.request<PortForward[]>('/api/v1/port-forwards/search', { params })
  }

  // ===== 隧道会话管理 =====
  
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

  async startTunnel(id: number): Promise<TunnelSession> {
    return this.request<TunnelSession>(`/api/v1/sessions/${id}/start`, {
      method: 'POST',
    })
  }

  async stopTunnel(id: number): Promise<TunnelSession> {
    return this.request<TunnelSession>(`/api/v1/sessions/${id}/stop`, {
      method: 'POST',
    })
  }

  async getSessionStats(): Promise<SessionStats> {
    return this.request<SessionStats>('/api/v1/sessions/stats')
  }

  // ===== 批量操作 =====
  
  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    return this.request<BulkOperationResponse>('/api/v1/bulk', {
      method: 'POST',
      body: request,
    })
  }

  // ===== 导入导出 =====
  
  async exportData(projectIds?: number[]): Promise<ExportData> {
    const params = projectIds ? { project_ids: projectIds.join(',') } : undefined
    return this.request<ExportData>('/api/v1/export', { params })
  }

  async importData(data: ExportData): Promise<ImportResult> {
    return this.request<ImportResult>('/api/v1/import', {
      method: 'POST',
      body: data,
    })
  }

  // ===== 用户偏好设置 =====
  
  async getUserPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/v1/preferences')
  }

  async updateUserPreferences(data: UpdateUserPreferencesData): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/v1/preferences', {
      method: 'PUT',
      body: data,
    })
  }

  // ===== WebSocket 连接 =====
  
  createWebSocket(protocols?: string[]): WebSocket {
    const wsUrl = this.config.baseURL.replace(/^http/, 'ws') + '/ws'
    return new WebSocket(wsUrl, protocols)
  }

  // ===== 兼容性方法（废弃但保留） =====
  
  /**
   * @deprecated 使用 getGroups() 替代
   */
  async getHostGroups(): Promise<any[]> {
    console.warn('getHostGroups() is deprecated, use getGroups() instead')
    return this.getGroups()
  }

  /**
   * @deprecated 使用 getGroups() 替代
   */
  async getPortGroups(): Promise<any[]> {
    console.warn('getPortGroups() is deprecated, use getGroups() instead')
    return this.getGroups()
  }
}

// 创建默认客户端实例
export const apiClient = new ApiClient()
