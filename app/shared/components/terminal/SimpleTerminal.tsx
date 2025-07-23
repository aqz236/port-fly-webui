import { useRef, useEffect, useState } from 'react';
import { Host } from '~/shared/types/host';

interface SimpleTerminalProps {
  host: Host;
  embedded?: boolean;
}

// WebSocket 消息类型
interface TerminalMessage {
  type: 'terminal_connect' | 'terminal_data' | 'terminal_resize' | 'terminal_disconnect' | 
        'terminal_connected' | 'terminal_error';
  data: any;
  connectionId?: string;
}

// 连接参数
interface TerminalConnectionParams {
  hostname: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  authMethod: 'password' | 'key' | 'agent';
  cols: number;
  rows: number;
}

export function SimpleTerminal({ host, embedded = false }: SimpleTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 建立WebSocket连接
  const connectWebSocket = async () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    const wsUrl = `ws://localhost:8080/ws/terminal/${host.id}`;
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for host', host.id);
        setConnectionStatus('connected');
        
        // 发送连接参数
        const connectParams: TerminalConnectionParams = {
          hostname: host.hostname,
          port: host.port,
          username: host.username,
          password: host.password,
          privateKey: host.private_key,
          authMethod: host.auth_method,
          cols: 80,
          rows: 24
        };

        ws.send(JSON.stringify({
          type: 'terminal_connect',
          data: connectParams
        } as TerminalMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: TerminalMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        websocketRef.current = null;
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  // 处理WebSocket消息
  const handleWebSocketMessage = (message: TerminalMessage) => {
    const terminal = terminalInstanceRef.current;
    if (!terminal) return;

    switch (message.type) {
      case 'terminal_connected':
        console.log('SSH connection established');
        terminal.writeln('\r\nSSH connection established\r\n');
        break;
      
      case 'terminal_data':
        // 直接将服务器返回的数据写入终端
        if (typeof message.data === 'string') {
          terminal.write(message.data);
        }
        break;
      
      case 'terminal_error':
        console.error('Terminal error:', message.data);
        terminal.writeln(`\r\nError: ${message.data}\r\n`);
        setConnectionStatus('error');
        break;
    }
  };

  // 发送输入数据到服务器
  const sendInput = (data: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'terminal_data',
        data: data
      } as TerminalMessage));
    }
  };

  // 发送窗口大小变化
  const sendResize = (cols: number, rows: number) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'terminal_resize',
        data: { cols, rows }
      } as TerminalMessage));
    }
  };

  useEffect(() => {
    if (!isClient || !terminalRef.current || isLoaded) return;

    // 动态导入 xterm 相关模块
    const loadTerminal = async () => {
      try {
        const XTermPkg = await import('@xterm/xterm');
        const FitAddonPkg = await import('@xterm/addon-fit');
        
        const Terminal = XTermPkg.Terminal;
        const FitAddon = FitAddonPkg.FitAddon;

        // 创建终端实例
        const terminal = new Terminal({
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#d4d4d4',
          },
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: 14,
          cursorBlink: true,
          scrollback: 1000,
          cols: 80,
          rows: 24,
        });

        // 创建fit addon
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // 挂载到DOM
        terminal.open(terminalRef.current!);
        
        // 调整大小
        setTimeout(() => {
          fitAddon.fit();
          const dims = fitAddon.proposeDimensions();
          if (dims) {
            sendResize(dims.cols, dims.rows);
          }
        }, 100);

        // 处理用户输入
        terminal.onData((data) => {
          sendInput(data);
        });

        // 处理终端大小变化
        terminal.onResize(({ cols, rows }) => {
          sendResize(cols, rows);
        });

        terminalInstanceRef.current = terminal;
        fitAddonRef.current = fitAddon;
        setIsLoaded(true);

        // 建立WebSocket连接
        await connectWebSocket();

        // 窗口resize处理
        const handleResize = () => {
          setTimeout(() => {
            fitAddon.fit();
            const dims = fitAddon.proposeDimensions();
            if (dims) {
              sendResize(dims.cols, dims.rows);
            }
          }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          
          // 断开WebSocket连接
          if (websocketRef.current) {
            websocketRef.current.send(JSON.stringify({
              type: 'terminal_disconnect',
              data: {}
            } as TerminalMessage));
            websocketRef.current.close();
          }
          
          terminal.dispose();
        };
      } catch (error) {
        console.error('Failed to load terminal:', error);
        setConnectionStatus('error');
      }
    };

    loadTerminal();
  }, [host, isLoaded, isClient]);

  // 获取状态指示器
  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <span className="text-yellow-400">⚡ 连接中...</span>;
      case 'connected':
        return <span className="text-green-400">✓ 已连接</span>;
      case 'error':
        return <span className="text-red-400">✗ 连接失败</span>;
      default:
        return <span className="text-gray-400">○ 未连接</span>;
    }
  };

  // 服务器端渲染时显示占位符
  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e] text-white">
        <div>Loading terminal...</div>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="h-full w-full flex flex-col bg-[#1e1e1e] overflow-hidden">
        {/* 终端头部 */}
        <div className="bg-[#2d2d2d] px-4 py-2 text-white text-sm border-b border-gray-600 flex justify-between items-center">
          <div>
            <span className="font-medium">{host.name}</span>
            <span className="ml-2 text-gray-300">{host.username}@{host.hostname}:{host.port}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIndicator()}
          </div>
        </div>
        
        {/* 终端区域 */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={terminalRef}
            className="h-full w-full"
            style={{ padding: '8px' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
      {/* 状态栏 */}
      <div className="bg-[#2d2d2d] px-4 py-2 text-white text-sm border-b border-gray-600">
        {getStatusIndicator()}
      </div>
      
      {/* 终端区域 */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={terminalRef}
          className="h-full w-full"
          style={{ padding: '8px' }}
        />
      </div>
    </div>
  );
}
