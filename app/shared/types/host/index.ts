import { BaseEntity } from "../base";
import { Group } from "../group";
import { WebSocketMessage } from "../websocket";

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


// ===== WebSocket 消息类型 =====


export interface HostStatusMessage extends WebSocketMessage {
  type: 'host_status_changed';
  data: {
    host_id: number;
    status: Host['status'];
    last_connected?: string;
  };
}