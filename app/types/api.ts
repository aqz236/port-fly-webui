// API响应类型
export interface ApiResponse<T> {
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

// 主机分组
export interface HostGroup extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  tags: string;
  metadata: string;
  hosts?: Host[];
}

export interface CreateHostGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tags?: string;
  metadata?: string;
}

export interface UpdateHostGroupData extends Partial<CreateHostGroupData> {}

export interface HostGroupStats {
  total_hosts: number;
  connected_hosts: number;
  disconnected_hosts: number;
  last_used?: string;
}

// 主机
export interface Host extends BaseEntity {
  name: string;
  description: string;
  hostname: string;
  port: number;
  username: string;
  auth_method: string;
  host_group_id?: number;
  host_group?: HostGroup;
  last_used?: string;
  use_count: number;
}

export interface CreateHostData {
  name: string;
  description?: string;
  hostname: string;
  port?: number;
  username: string;
  auth_method: string;
  host_group_id?: number;
}

export interface UpdateHostData extends Partial<CreateHostData> {}

// 端口分组
export interface PortGroup extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  auto_start: boolean;
  max_concurrent: number;
  tags: string;
  metadata: string;
  total_use: number;
  last_used?: string;
  port_forwards?: PortForward[];
}

export interface CreatePortGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  auto_start?: boolean;
  max_concurrent?: number;
  tags?: string;
  metadata?: string;
}

export interface UpdatePortGroupData extends Partial<CreatePortGroupData> {}

export interface PortGroupStats {
  total_ports: number;
  active_ports: number;
  inactive_ports: number;
  total_sessions: number;
  active_sessions: number;
}

// 端口转发
export interface PortForward extends BaseEntity {
  name: string;
  type: 'local' | 'remote' | 'dynamic'; // -L, -R, -D
  local_port: number;
  remote_host: string;
  remote_port: number;
  host_id: number;
  port_group_id?: number;
  host?: Host;
  port_group?: PortGroup;
}

export interface CreatePortForwardData {
  name: string;
  type: 'local' | 'remote' | 'dynamic';
  local_port: number;
  remote_host: string;
  remote_port: number;
  host_id: number;
  port_group_id?: number;
}

export interface UpdatePortForwardData extends Partial<CreatePortForwardData> {}

// 隧道会话
export interface TunnelSession extends BaseEntity {
  status: 'pending' | 'active' | 'stopped' | 'error';
  start_time?: string;
  end_time?: string;
  error_message?: string;
  host_id: number;
  port_forward_id: number;
  host?: Host;
  port_forward?: PortForward;
}

export interface CreateTunnelSessionData {
  host_id: number;
  port_forward_id: number;
}

export interface UpdateTunnelSessionData {
  status?: TunnelSession['status'];
  error_message?: string;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'session_status_changed' | 'host_stats_updated' | 'connection_stats_updated';
  data: any;
  timestamp: string;
}

export interface SessionStatusMessage extends WebSocketMessage {
  type: 'session_status_changed';
  data: {
    session_id: number;
    status: TunnelSession['status'];
    error_message?: string;
  };
}

export interface HostStatsMessage extends WebSocketMessage {
  type: 'host_stats_updated';
  data: {
    host_id: number;
    stats: {
      last_connected?: string;
      connection_count: number;
      is_online: boolean;
    };
  };
}

export interface ConnectionStatsMessage extends WebSocketMessage {
  type: 'connection_stats_updated';
  data: {
    total_hosts: number;
    connected_hosts: number;
    total_sessions: number;
    active_sessions: number;
  };
}

// 搜索和分页
export interface SearchParams {
  q?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// 系统健康状态
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: {
    status: 'connected' | 'disconnected';
    type: string;
  };
}
