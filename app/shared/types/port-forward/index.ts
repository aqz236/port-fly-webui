import { BaseEntity } from "../base";
import { Group } from "../group";
import { Host } from "../host";
import { WebSocketMessage } from "../websocket";

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

// ===== WebSocket 消息类型 =====



export interface PortStatusMessage extends WebSocketMessage {
  type: 'port_status_changed';
  data: {
    port_forward_id: number;
    status: PortForward['status'];
  };
}

