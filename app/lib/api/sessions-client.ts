// Sessions API Client
// 隧道会话管理相关的 API 请求

import { BaseApiClient } from './base-client'
import type {
  TunnelSession,
  CreateTunnelSessionData,
  UpdateTunnelSessionData,
  SessionStats
} from '../../types/api'

export class SessionsApiClient extends BaseApiClient {
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
}
