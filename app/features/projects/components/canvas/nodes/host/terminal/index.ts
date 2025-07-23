// 终端模块入口文件
export { Terminal as SSHTerminal } from './Terminal';
export { TerminalHeader } from './components/TerminalHeader';
export { TerminalError } from './components/TerminalError';

// Hooks
export { useTerminalManager } from './hooks/useTerminalManager';
export { useTerminalStatus } from './hooks/useTerminalStatus';

// Services
export { TerminalWebSocketService } from './services/websocket.service';
export { TerminalInstanceService } from './services/instance.service';

// Types
export type {
  TerminalState,
  TerminalInstance,
  TerminalConnectionParams,
  TerminalMessage,
  TerminalConfig,
  TerminalTheme,
  TerminalSession,
  TerminalOperations,
  TerminalEvents,
  TerminalProps
} from './types';

// Constants and Config
export {
  DEFAULT_TERMINAL_CONFIG,
  DEFAULT_TERMINAL_THEME,
  WEBSOCKET_CONFIG,
  TERMINAL_SHORTCUTS,
  TERMINAL_STATUS_TEXT,
  TERMINAL_STATUS_COLORS,
  SUPPORTED_SHELLS,
  TERMINAL_SIZE_PRESETS,
  TERMINAL_THEME_PRESETS
} from './config';

// Utils
export {
  mergeTerminalConfig,
  validateTerminalConfig,
  formatTerminalOutput,
  parseAnsiCodes,
  sanitizeTerminalOutput,
  calculateTerminalSize,
  generateWebSocketUrl,
  isWebSocketSupported,
  formatConnectionTime,
  generateConnectionId,
  isSpecialKey,
  keyToTerminalInput,
  validateHostConnection
} from './utils/terminal.utils';
