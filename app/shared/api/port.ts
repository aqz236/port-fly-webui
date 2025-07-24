// Port API Client
// 端口管理相关的 API 请求

import { 
  Port, 
  CreatePortData, 
  UpdatePortData, 
  PortControlRequest, 
  PortResponse 
} from '~/shared/types/port';
import { BaseApiClient } from './base-client';

export class PortApiClient extends BaseApiClient {
  // 创建端口
  async createPort(data: CreatePortData): Promise<PortResponse> {
    return this.request('/api/v1/ports', {
      method: 'POST',
      body: data,
    });
  }

  // 获取端口列表
  async getPorts(params?: {
    group_id?: number;
    host_id?: number;
  }): Promise<PortResponse[]> {
    return this.request('/api/v1/ports', {
      method: 'GET',
      params,
    });
  }

  // 获取单个端口
  async getPort(id: number): Promise<PortResponse> {
    return this.request(`/api/v1/ports/${id}`, {
      method: 'GET',
    });
  }

  // 更新端口
  async updatePort(id: number, data: UpdatePortData): Promise<PortResponse> {
    return this.request(`/api/v1/ports/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  // 删除端口
  async deletePort(id: number): Promise<void> {
    return this.request(`/api/v1/ports/${id}`, {
      method: 'DELETE',
    });
  }

  // 控制端口（启动/停止/重启）
  async controlPort(id: number, action: PortControlRequest): Promise<PortResponse> {
    return this.request(`/api/v1/ports/${id}/control`, {
      method: 'POST',
      body: action,
    });
  }

  // 启动端口
  async startPort(id: number): Promise<PortResponse> {
    return this.controlPort(id, { action: 'start' });
  }

  // 停止端口
  async stopPort(id: number): Promise<PortResponse> {
    return this.controlPort(id, { action: 'stop' });
  }

  // 重启端口
  async restartPort(id: number): Promise<PortResponse> {
    return this.controlPort(id, { action: 'restart' });
  }
}

// 创建 Port API 客户端实例
export const portApiClient = new PortApiClient();
