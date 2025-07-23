// Groups API Client
// 组管理相关的 API 请求

import { BaseApiClient } from './base-client'
import type {
  Group,
  CreateGroupData,
  UpdateGroupData,
  GroupStats
} from '../../types/api'

export class GroupsApiClient extends BaseApiClient {
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
}
