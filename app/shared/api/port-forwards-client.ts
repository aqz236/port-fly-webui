// Port Forwards API Client
// 端口转发管理相关的 API 请求

import { SearchParams } from '../types/base'
import { PortForward, CreatePortForwardData, UpdatePortForwardData, PortForwardStats } from '../types/port-forward'
import { BaseApiClient } from './base-client'


export class PortForwardsApiClient extends BaseApiClient {
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
}
