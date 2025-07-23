// Hosts API Client
// 主机管理相关的 API 请求

import { SearchParams } from '../types/base'
import { Host, CreateHostData, UpdateHostData, HostStats } from '../types/host'
import { BaseApiClient } from './base-client'


export class HostsApiClient extends BaseApiClient {
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
}
