// PortFly API Types v2
// 新架构：Project -> Group -> (Host + Port)

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

// ===== 核心实体类型 =====

// 项目/工作空间 - 支持树状结构的容器
export interface Project extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  groups?: Group[];
  metadata?: Record<string, any>;
  
  // 树状结构支持
  parent_id?: number;
  level: number;
  path?: string;
  sort: number;
  
  // 关联关系
  parent?: Project;
  children?: Project[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_default?: boolean;
  metadata?: Record<string, any>;
  parent_id?: number;
  sort?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

// 项目树节点，用于前端展示
export interface ProjectTreeNode {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  groups?: Group[];
  metadata?: Record<string, any>;
  parent_id?: number;
  level: number;
  path?: string;
  sort: number;
  parent?: Project;
  children?: ProjectTreeNode[];
  has_children: boolean;
  is_expanded?: boolean;
}

// 项目移动参数
export interface MoveProjectParams {
  project_id: number;
  parent_id?: number;
  position: number;
}

export interface ProjectStats {
  total_groups: number;
  total_hosts: number;
  total_ports: number;
  active_tunnels: number;
  last_used?: string;
}

// 混合资源组 - 可以包含主机和端口
export interface Group extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  project_id: number;
  project?: Project;
  hosts?: Host[];
  port_forwards?: PortForward[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  project_id: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateGroupData extends Partial<Omit<CreateGroupData, 'project_id'>> {}

export interface GroupStats {
  total_hosts: number;
  total_ports: number;
  connected_hosts: number;
  active_tunnels: number;
  last_used?: string;
}

// 主机
export interface Host extends BaseEntity {
  name: string;
  hostname: string;
  port: number;
  username: string;
  description: string;
  group_id: number;
  group?: Group;
  auth_method: 'password' | 'key' | 'agent';
  private_key?: string;
  password?: string; // 加密存储
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'unknown';
  last_connected?: string;
  connection_count: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface CreateHostData {
  name: string;
  hostname: string;
  port?: number;
  username: string;
  description?: string;
  group_id: number;
  auth_method: 'password' | 'key' | 'agent';
  private_key?: string;
  password?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHostData extends Partial<Omit<CreateHostData, 'group_id'>> {}

export interface HostStats {
  total_connections: number;
  active_tunnels: number;
  last_connected?: string;
  uptime_percentage: number;
}

// 端口转发
export interface PortForward extends BaseEntity {
  name: string;
  type: 'local' | 'remote' | 'dynamic'; // -L, -R, -D
  local_port: number;
  remote_host: string;
  remote_port: number;
  description: string;
  group_id: number;
  group?: Group;
  host_id: number;
  host?: Host;
  status: 'active' | 'inactive' | 'error';
  auto_start: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface CreatePortForwardData {
  name: string;
  type: 'local' | 'remote' | 'dynamic';
  local_port: number;
  remote_host: string;
  remote_port: number;
  description?: string;
  group_id: number;
  host_id: number;
  auto_start?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePortForwardData extends Partial<Omit<CreatePortForwardData, 'group_id' | 'host_id'>> {}

export interface PortForwardStats {
  total_sessions: number;
  active_sessions: number;
  total_data_transferred: number;
  last_used?: string;
}

// 隧道会话
export interface TunnelSession extends BaseEntity {
  status: 'pending' | 'active' | 'stopped' | 'error';
  start_time?: string;
  end_time?: string;
  error_message?: string;
  data_transferred: number;
  host_id: number;
  port_forward_id: number;
  host?: Host;
  port_forward?: PortForward;
  pid?: number; // 进程ID
  local_address?: string;
  remote_address?: string;
}

export interface CreateTunnelSessionData {
  host_id: number;
  port_forward_id: number;
}

export interface UpdateTunnelSessionData {
  status?: TunnelSession['status'];
  error_message?: string;
  data_transferred?: number;
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  failed_sessions: number;
  total_data_transferred: number;
  average_session_duration: number;
}

// ===== WebSocket 消息类型 =====

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface SessionStatusMessage extends WebSocketMessage {
  type: 'session_status_changed';
  data: {
    session_id: number;
    status: TunnelSession['status'];
    error_message?: string;
    data_transferred?: number;
  };
}

export interface HostStatusMessage extends WebSocketMessage {
  type: 'host_status_changed';
  data: {
    host_id: number;
    status: Host['status'];
    last_connected?: string;
  };
}

export interface PortStatusMessage extends WebSocketMessage {
  type: 'port_status_changed';
  data: {
    port_forward_id: number;
    status: PortForward['status'];
  };
}

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
  port_forwards: PortForward[];
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

// ===== 兼容性类型（废弃但保留） =====

/**
 * @deprecated 使用 Group 替代
 */
export interface HostGroup extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  tags: string;
  metadata: string;
  hosts?: Host[];
}

/**
 * @deprecated 使用 Group 替代
 */
export interface PortGroup extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  max_concurrent: number;
  tags: string;
  metadata: string;
  port_forwards?: PortForward[];
}

/**
 * @deprecated 使用 CreateGroupData 替代
 */
export interface CreateHostGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tags?: string;
  metadata?: string;
}

/**
 * @deprecated 使用 CreateGroupData 替代
 */
export interface CreatePortGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  max_concurrent?: number;
  tags?: string;
  metadata?: string;
}

/**
 * @deprecated 使用 GroupStats 替代
 */
export interface HostGroupStats {
  total_hosts: number;
  connected_hosts: number;
  disconnected_hosts: number;
  last_used?: string;
}

/**
 * @deprecated 使用 GroupStats 替代
 */
export interface PortGroupStats {
  total_ports: number;
  active_ports: number;
  inactive_ports: number;
  last_used?: string;
}
