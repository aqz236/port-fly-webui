// 终端配置和常量
import type { TerminalConfig, TerminalTheme } from './types';

// 默认终端主题
export const DEFAULT_TERMINAL_THEME: TerminalTheme = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  cursorAccent: '#1e1e1e',
  selection: '#264f78',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#e5e5e5'
};

// 默认终端配置
export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  fontSize: 14,
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  theme: DEFAULT_TERMINAL_THEME,
  cursorBlink: true,
  allowTransparency: false,
  cols: 80,
  rows: 24
};

// WebSocket 配置
export const WEBSOCKET_CONFIG = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  pingInterval: 30000,
  connectionTimeout: 10000
};

// 终端操作快捷键
export const TERMINAL_SHORTCUTS = {
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  clear: 'Ctrl+L',
  interrupt: 'Ctrl+C',
  suspend: 'Ctrl+Z',
  eof: 'Ctrl+D'
};

// 终端状态文本映射
export const TERMINAL_STATUS_TEXT = {
  CONNECTING: '连接中...',
  CONNECTED: '已连接',
  DISCONNECTED: '已断开',
  ERROR: '连接错误',
  RECONNECTING: '重新连接中...'
};

// 终端状态颜色映射
export const TERMINAL_STATUS_COLORS = {
  CONNECTING: 'bg-yellow-500',
  CONNECTED: 'bg-green-500',
  DISCONNECTED: 'bg-gray-500',
  ERROR: 'bg-red-500',
  RECONNECTING: 'bg-blue-500'
};

// 支持的Shell类型
export const SUPPORTED_SHELLS = [
  { value: 'bash', label: 'Bash' },
  { value: 'zsh', label: 'Zsh' },
  { value: 'sh', label: 'Shell' },
  { value: 'fish', label: 'Fish' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'cmd', label: 'Command Prompt' }
];

// 终端大小预设
export const TERMINAL_SIZE_PRESETS = {
  small: { cols: 80, rows: 24 },
  medium: { cols: 120, rows: 30 },
  large: { cols: 160, rows: 40 },
  xlarge: { cols: 200, rows: 50 }
};

// 终端主题预设
export const TERMINAL_THEME_PRESETS = {
  dark: DEFAULT_TERMINAL_THEME,
  light: {
    ...DEFAULT_TERMINAL_THEME,
    background: '#ffffff',
    foreground: '#000000',
    selection: '#b3d4fc'
  },
  monokai: {
    ...DEFAULT_TERMINAL_THEME,
    background: '#272822',
    foreground: '#f8f8f2',
    green: '#a6e22e',
    red: '#f92672',
    yellow: '#e6db74',
    blue: '#66d9ef',
    magenta: '#ae81ff'
  },
  solarized: {
    ...DEFAULT_TERMINAL_THEME,
    background: '#002b36',
    foreground: '#839496',
    green: '#859900',
    red: '#dc322f',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198'
  }
};
