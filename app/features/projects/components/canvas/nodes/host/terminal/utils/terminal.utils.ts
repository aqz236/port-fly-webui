// 终端工具函数
import { TerminalConfig, TerminalTheme } from '../types';

/**
 * 合并终端配置
 */
export function mergeTerminalConfig(
  defaultConfig: TerminalConfig,
  userConfig?: Partial<TerminalConfig>
): TerminalConfig {
  if (!userConfig) return defaultConfig;
  
  return {
    ...defaultConfig,
    ...userConfig,
    theme: userConfig.theme ? { ...defaultConfig.theme, ...userConfig.theme } : defaultConfig.theme
  };
}

/**
 * 验证终端配置
 */
export function validateTerminalConfig(config: Partial<TerminalConfig>): string[] {
  const errors: string[] = [];
  
  if (config.fontSize !== undefined) {
    if (config.fontSize < 8 || config.fontSize > 32) {
      errors.push('Font size must be between 8 and 32');
    }
  }
  
  if (config.cols !== undefined) {
    if (config.cols < 20 || config.cols > 300) {
      errors.push('Columns must be between 20 and 300');
    }
  }
  
  if (config.rows !== undefined) {
    if (config.rows < 5 || config.rows > 100) {
      errors.push('Rows must be between 5 and 100');
    }
  }
  
  return errors;
}

/**
 * 格式化终端输出
 */
export function formatTerminalOutput(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }
  
  return String(data);
}

/**
 * 解析ANSI转义序列
 */
export function parseAnsiCodes(text: string): { type: string; content: string }[] {
  const ansiRegex = /\x1b\[([\d;]*?)m/g;
  const parts: { type: string; content: string }[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = ansiRegex.exec(text)) !== null) {
    // 添加普通文本
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }
    
    // 添加ANSI代码
    parts.push({
      type: 'ansi',
      content: match[1] || ''
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }
  
  return parts;
}

/**
 * 清理终端输出中的特殊字符
 */
export function sanitizeTerminalOutput(text: string): string {
  // 移除控制字符，但保留换行和制表符
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * 计算终端尺寸
 */
export function calculateTerminalSize(
  containerWidth: number,
  containerHeight: number,
  fontSize: number,
  fontFamily: string
): { cols: number; rows: number } {
  // 创建临时元素来测量字符尺寸
  const tempElement = document.createElement('div');
  tempElement.style.fontFamily = fontFamily;
  tempElement.style.fontSize = `${fontSize}px`;
  tempElement.style.position = 'absolute';
  tempElement.style.visibility = 'hidden';
  tempElement.style.whiteSpace = 'pre';
  tempElement.textContent = 'M'; // 使用M字符作为参考
  
  document.body.appendChild(tempElement);
  
  const charWidth = tempElement.offsetWidth;
  const charHeight = tempElement.offsetHeight;
  
  document.body.removeChild(tempElement);
  
  // 计算列数和行数（留一些边距）
  const cols = Math.floor((containerWidth - 20) / charWidth);
  const rows = Math.floor((containerHeight - 20) / charHeight);
  
  return {
    cols: Math.max(cols, 20), // 最小20列
    rows: Math.max(rows, 5)   // 最小5行
  };
}

/**
 * 生成WebSocket URL
 */
export function generateWebSocketUrl(hostId: number, baseUrl?: string): string {
  const base = baseUrl || 'ws://localhost:8080';
  return `${base}/ws/terminal/${hostId}`;
}

/**
 * 检查WebSocket是否可用
 */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== 'undefined';
}

/**
 * 格式化连接时间
 */
export function formatConnectionTime(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  if (diff < 1000) {
    return 'just now';
  } else if (diff < 60000) {
    return `${Math.floor(diff / 1000)}s ago`;
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
}

/**
 * 生成唯一的连接ID
 */
export function generateConnectionId(hostId: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${hostId}-${timestamp}-${random}`;
}

/**
 * 检查是否为特殊按键
 */
export function isSpecialKey(keyCode: string): boolean {
  const specialKeys = [
    'Enter', 'Backspace', 'Delete', 'Tab', 'Escape',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Home', 'End', 'PageUp', 'PageDown',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
  ];
  return specialKeys.includes(keyCode);
}

/**
 * 转换按键为终端输入
 */
export function keyToTerminalInput(event: KeyboardEvent): string {
  const { key, ctrlKey, altKey, metaKey } = event;
  
  // Ctrl组合键
  if (ctrlKey && !altKey && !metaKey) {
    switch (key.toLowerCase()) {
      case 'c': return '\x03'; // Ctrl+C (SIGINT)
      case 'd': return '\x04'; // Ctrl+D (EOF)
      case 'z': return '\x1a'; // Ctrl+Z (SIGTSTP)
      case 'l': return '\x0c'; // Ctrl+L (clear screen)
      case 'a': return '\x01'; // Ctrl+A (beginning of line)
      case 'e': return '\x05'; // Ctrl+E (end of line)
      case 'k': return '\x0b'; // Ctrl+K (kill line)
      case 'u': return '\x15'; // Ctrl+U (kill whole line)
      case 'w': return '\x17'; // Ctrl+W (kill word)
    }
  }
  
  // 方向键
  switch (key) {
    case 'ArrowUp': return '\x1b[A';
    case 'ArrowDown': return '\x1b[B';
    case 'ArrowRight': return '\x1b[C';
    case 'ArrowLeft': return '\x1b[D';
    case 'Home': return '\x1b[H';
    case 'End': return '\x1b[F';
    case 'PageUp': return '\x1b[5~';
    case 'PageDown': return '\x1b[6~';
    case 'Delete': return '\x1b[3~';
    case 'Insert': return '\x1b[2~';
  }
  
  // 功能键
  if (key.startsWith('F')) {
    const num = parseInt(key.substring(1));
    if (num >= 1 && num <= 12) {
      const codes = [
        '\x1bOP', '\x1bOQ', '\x1bOR', '\x1bOS', // F1-F4
        '\x1b[15~', '\x1b[17~', '\x1b[18~', '\x1b[19~', // F5-F8
        '\x1b[20~', '\x1b[21~', '\x1b[23~', '\x1b[24~'  // F9-F12
      ];
      return codes[num - 1] || '';
    }
  }
  
  // 其他特殊键
  switch (key) {
    case 'Enter': return '\r';
    case 'Backspace': return '\x7f';
    case 'Tab': return '\t';
    case 'Escape': return '\x1b';
  }
  
  // 普通字符
  if (key.length === 1) {
    return key;
  }
  
  return '';
}

/**
 * 验证主机连接参数
 */
export function validateHostConnection(host: any): string[] {
  const errors: string[] = [];
  
  if (!host.hostname) {
    errors.push('Hostname is required');
  }
  
  if (!host.port || host.port < 1 || host.port > 65535) {
    errors.push('Valid port number is required (1-65535)');
  }
  
  if (!host.username) {
    errors.push('Username is required');
  }
  
  if (!host.auth_method) {
    errors.push('Authentication method is required');
  }
  
  if (host.auth_method === 'password' && !host.password) {
    errors.push('Password is required for password authentication');
  }
  
  if (host.auth_method === 'key' && !host.private_key) {
    errors.push('Private key is required for key authentication');
  }
  
  return errors;
}
