import { BaseEntity } from "../base";
import { Host } from "../host";
import { PortForward } from "../port-forward";
import { WebSocketMessage } from "../websocket";

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

export interface SessionStatusMessage extends WebSocketMessage {
  type: 'session_status_changed';
  data: {
    session_id: number;
    status: TunnelSession['status'];
    error_message?: string;
    data_transferred?: number;
  };
}
