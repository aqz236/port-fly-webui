// 新架构：Project -> Group -> (Host + Port)

import { Group } from "../group";
import { Host } from "../host";
import { Project } from "../project";
import { WebSocketMessage } from "../websocket";

// ===== 基础类型 =====

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 错误类型
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 基础实体类型
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// 资源类型枚举
export type ResourceType = 'host' | 'port';

// ===== WebSocket 消息类型 =====


export interface StatsUpdateMessage extends WebSocketMessage {
  type: 'stats_updated';
  data: {
    total_hosts: number;
    connected_hosts: number;
    total_sessions: number;
    active_sessions: number;
    total_data_transferred: number;
  };
}

// ===== 搜索和分页 =====

export interface SearchParams {
  q?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

// ===== 系统和健康状态 =====

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: {
    status: 'connected' | 'disconnected';
    type: string;
    migration_version?: string;
  };
  ssh_connections?: {
    total: number;
    active: number;
    failed: number;
  };
}

export interface SystemStats {
  uptime: number;
  version: string;
  total_projects: number;
  total_groups: number;
  total_hosts: number;
  total_port_forwards: number;
  total_sessions: number;
  active_sessions: number;
  memory_usage?: number;
  cpu_usage?: number;
}

// ===== 批量操作 =====

export interface BulkOperationRequest {
  operation: 'start' | 'stop' | 'delete' | 'update';
  resource_type: 'host' | 'port_forward' | 'session';
  resource_ids: number[];
  data?: Record<string, any>;
}

export interface BulkOperationResponse {
  success_count: number;
  error_count: number;
  errors?: Array<{
    resource_id: number;
    error_message: string;
  }>;
}

// ===== 导入导出 =====

export interface ExportData {
  version: string;
  timestamp: string;
  projects: Project[];
  groups: Group[];
  hosts: Host[];
}

export interface ImportResult {
  imported_projects: number;
  imported_groups: number;
  imported_hosts: number;
  imported_port_forwards: number;
  errors?: string[];
  warnings?: string[];
}

// ===== 用户偏好设置 =====

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  default_project_id?: number;
  auto_start_tunnels: boolean;
  notification_settings: {
    session_status: boolean;
    host_status: boolean;
    system_alerts: boolean;
  };
  ui_settings: {
    sidebar_collapsed: boolean;
    grid_view: boolean;
    items_per_page: number;
  };
}

export interface UpdateUserPreferencesData extends Partial<UserPreferences> {}

