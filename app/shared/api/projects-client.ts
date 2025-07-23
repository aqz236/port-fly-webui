// Projects API Client
// 项目管理相关的 API 请求

import { BaseApiClient } from './base-client'
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectStats,
  ProjectTreeNode,
  MoveProjectParams
} from '../types/api'

export class ProjectsApiClient extends BaseApiClient {
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
}
