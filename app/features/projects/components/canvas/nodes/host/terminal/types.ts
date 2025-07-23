// 终端相关类型定义
import { ReactNode } from 'react';
import type { Terminal as XTerminal } from '@xterm/xterm';
import type { FitAddon as XFitAddon } from '@xterm/addon-fit';
import { Host } from '~/shared/types/host';

// 终端连接状态
export interface TerminalState {
  hostId: number;
  connectionId: string;
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
}

// 终端实例
export interface TerminalInstance {
  terminal: XTerminal;
  fitAddon: XFitAddon;
  websocket: WebSocket | null;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}

// 终端连接参数
export interface TerminalConnectionParams {
  hostId: number;
  width?: number;
  height?: number;
  shell?: string;
}

// WebSocket 消息类型
export interface TerminalMessage {
  type: 'terminal_connect' | 'terminal_data' | 'terminal_resize' | 'terminal_disconnect' | 
        'terminal_connected' | 'terminal_error';
  data: any;
  connectionId?: string;
}

// 终端配置
export interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
  theme: TerminalTheme;
  cursorBlink: boolean;
  allowTransparency: boolean;
  cols: number;
  rows: number;
}

// 终端主题
export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

// 终端会话
export interface TerminalSession {
  hostId: number;
  host: Host;
  state: TerminalState;
  instance?: TerminalInstance;
  createdAt: Date;
  lastActivity: Date;
}

// 终端操作接口
export interface TerminalOperations {
  connect: (element: HTMLElement) => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
  clear: () => void;
  copy: () => Promise<boolean>;
  paste: () => Promise<boolean>;
  resize: () => boolean;
  sendInput: (data: string) => boolean;
}

// 终端事件
export interface TerminalEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onData?: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
  onStateChange?: (state: TerminalState) => void;
}

// 终端组件属性
export interface TerminalProps {
  host: Host;
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  config?: Partial<TerminalConfig>;
  events?: TerminalEvents;
}

// WebSocket 连接状态
export enum WebSocketState {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

// 终端渲染模式
export enum TerminalMode {
  EMBEDDED = 'EMBEDDED',    // 嵌入在标签页中
  POPUP = 'POPUP',          // 弹窗模式
  FULLSCREEN = 'FULLSCREEN' // 全屏模式
}
