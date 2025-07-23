// Utilities API Client
// 批量操作、导入导出、用户偏好等工具相关的 API 请求

import { BulkOperationRequest, BulkOperationResponse, ExportData, ImportResult, UserPreferences, UpdateUserPreferencesData } from '../types/base'
import { BaseApiClient } from './base-client'

export class UtilitiesApiClient extends BaseApiClient {
  // 批量操作
  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    return this.request<BulkOperationResponse>('/api/v1/bulk', {
      method: 'POST',
      body: request,
    })
  }

  // 导入导出
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

  // 用户偏好设置
  async getUserPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/v1/preferences')
  }

  async updateUserPreferences(data: UpdateUserPreferencesData): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/v1/preferences', {
      method: 'PUT',
      body: data,
    })
  }
}
