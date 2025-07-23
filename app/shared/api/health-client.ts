// Health API Client
// 健康检查相关的 API 请求

import { HealthStatus, SystemStats } from '../types/base'
import { BaseApiClient } from './base-client'

export class HealthApiClient extends BaseApiClient {
  async health(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health')
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/v1/system/stats')
  }
}
