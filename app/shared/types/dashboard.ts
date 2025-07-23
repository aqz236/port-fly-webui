// 通用类型
export type StatusType = 'connected' | 'disconnected' | 'active' | 'inactive';

// 主机类型
export interface Host {
  id: number;
  name: string;
  hostname: string;
  port?: number;
  username?: string;
  auth_method?: string;
  status: 'connected' | 'disconnected';
  connection_count?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 端口转发类型
export interface PortForward {
  id: number;
  name: string;
  type: 'local' | 'remote' | 'dynamic';
  local_port: number;
  remote_host?: string;
  remote_port: number;
  auto_start?: boolean;
  status: 'active' | 'inactive';
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 组类型
export interface Group {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  hosts: Host[];
  port_forwards: PortForward[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 项目类型
export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  groups: Group[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 隧道会话类型
export interface TunnelSession {
  id: number;
  status: 'active' | 'inactive' | 'error';
  start_time?: string;
  end_time?: string;
  error_message?: string;
  host_id: number;
  port_forward_id: number;
  data_transferred?: number;
  pid?: number;
  created_at?: string;
  updated_at?: string;
}

// 视图相关类型
export type ViewType = 'overview' | 'project' | 'group';

export interface SelectedItem {
  type: ViewType;
  projectId?: number;
  groupId?: number;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 统计数据类型
export interface ProjectStats {
  total_groups: number;
  total_hosts: number;
  total_port_forwards: number;
  active_connections: number;
  active_sessions: number;
}

export interface GroupStats {
  total_hosts: number;
  total_port_forwards: number;
  connected_hosts: number;
  active_port_forwards: number;
  active_sessions: number;
}
