// HostNode 主机节点类型定义
import { BaseEntity } from '~/shared/types/base';
import { Host } from '~/shared/types/host';
import { TunnelSession } from '~/shared/types/session';

// 主机节点数据
export interface HostNodeData {
  host: Host;
  projectId: number;
  sessions?: TunnelSession[];
  isExpanded?: boolean;
  onEdit?: (host: Host) => void;
  onDelete?: (hostId: number) => void;
  onConnect?: (hostId: number) => void;
  onDisconnect?: (hostId: number) => void;
  onOpenTerminal?: (hostId: number) => void;
  onShowSessions?: (hostId: number) => void;
}

// 终端连接状态
export interface TerminalState {
  hostId: number;
  connectionId: string;
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
}

// 终端连接参数
export interface TerminalConnectionParams {
  hostId: number;
  width?: number;
  height?: number;
  shell?: string; // bash, zsh, sh, etc.
}

// WebSocket 消息类型
export interface TerminalMessage {
  type: 'terminal_connect' | 'terminal_data' | 'terminal_resize' | 'terminal_disconnect' | 'terminal_connected' | 'terminal_error' | 'connect' | 'input' | 'resize' | 'disconnect' | 'data' | 'error' | 'connection' | 'connected';
  data: any;
  connectionId?: string;
}

// SSH 执行命令参数
export interface SSHExecParams {
  hostId: number;
  command: string;
  timeout?: number;
}

// SSH 执行结果
export interface SSHExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}
