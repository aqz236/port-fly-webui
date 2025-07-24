// Port 相关的类型定义
import { BaseEntity } from "../base";
import { Group } from "../group";
import { Host } from "../host";

// 端口类型
export type PortType = 'local' | 'remote';

// 端口状态
export type PortStatus = 'active' | 'inactive' | 'error' | 'connecting';

// 端口
export interface Port extends BaseEntity {
  name: string;
  type: PortType;
  port: number;
  target_host: string;
  target_port?: number;
  description: string;
  auto_start: boolean;
  status: PortStatus;
  color: string;
  icon: string;
  is_visible: boolean;
  tags: string[];
  metadata?: Record<string, any>;
  
  // 外键
  group_id: number;
  group?: Group;
  host_id: number;
  host?: Host;
}

// 端口统计信息
export interface PortStats {
  total_sessions: number;
  active_sessions: number;
  total_data_transferred: number;
  last_used?: string;
  uptime: number;
}

// 创建端口数据
export interface CreatePortData {
  name: string;
  type: PortType;
  port: number;
  target_host?: string;
  target_port?: number;
  description?: string;
  auto_start?: boolean;
  color?: string;
  icon?: string;
  tags?: string[];
  group_id: number;
  host_id: number;
}

// 更新端口数据
export interface UpdatePortData extends Partial<Omit<CreatePortData, 'group_id' | 'host_id'>> {
  is_visible?: boolean;
}

// 端口控制操作
export type PortControlAction = 'start' | 'stop' | 'restart';

// 端口控制请求
export interface PortControlRequest {
  action: PortControlAction;
}

// 端口响应
export interface PortResponse {
  port: Port;
  stats?: PortStats;
}

// 端口节点数据接口
export interface BasePortNodeData {
  id: string;
  type: PortType;
  label: string;
  description: string;
  status: PortStatus;
  port: Port;
  projectId: number;
  isExpanded?: boolean;
  
  // 样式配置
  color?: string;
  icon?: string;
  
  // 生命周期回调
  onEdit?: (portId: number) => void;
  onDelete?: (portId: number) => void;
  onStart?: (portId: number) => void;
  onStop?: (portId: number) => void;
  onRestart?: (portId: number) => void;
  
  // 元数据
  metadata?: {
    portId: number;
    hostId: number;
    groupId: number;
    nodeVersion: string;
  };
}

// Local Port 节点数据
export interface LocalPortNodeData extends BasePortNodeData {
  type: 'local';
}

// Remote Port 节点数据
export interface RemotePortNodeData extends BasePortNodeData {
  type: 'remote';
}

// Port 节点数据联合类型
export type PortNodeData = LocalPortNodeData | RemotePortNodeData;
