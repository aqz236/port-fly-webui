// 终端管理Hook
import { useRef, useEffect, useCallback } from 'react';
import { Host } from '~/shared/types/host';
import { TerminalState, TerminalMessage, TerminalConnectionParams } from '../types';
import { TerminalWebSocketService } from '../services/websocket.service';
import { TerminalInstanceService } from '../services/instance.service';
import { useTerminalStore } from '~/shared/store/terminalStore';

interface UseTerminalManagerProps {
  host: Host;
  onStateChange?: (state: TerminalState) => void;
}

export function useTerminalManager({ host, onStateChange }: UseTerminalManagerProps) {
  const wsServiceRef = useRef<TerminalWebSocketService | null>(null);
  const instanceServiceRef = useRef<TerminalInstanceService | null>(null);
  const isInitializedRef = useRef(false);

  const { 
    getTerminalSession, 
    updateTerminalState,
    setTerminalInstance,
    getTerminalInstance
  } = useTerminalStore();

  // 获取当前会话状态
  const session = getTerminalSession(host.id);
  const state = session?.state || {
    hostId: host.id,
    connectionId: '',
    isConnected: false,
    isConnecting: false
  };

  // 初始化服务
  const initializeServices = useCallback(() => {
    if (isInitializedRef.current) return;

    // 创建实例服务（单例）
    if (!instanceServiceRef.current) {
      instanceServiceRef.current = new TerminalInstanceService();
    }

    // WebSocket消息处理
    const handleMessage = (message: TerminalMessage) => {
      const instanceService = instanceServiceRef.current;
      if (!instanceService) return;

      switch (message.type) {
        case 'terminal_data':
          // 写入终端数据
          if (message.data) {
            const output = typeof message.data === 'string' ? message.data : String(message.data);
            instanceService.writeToTerminal(host.id, output);
          }
          break;

        case 'terminal_connected':
          console.log('Terminal connected:', message.data);
          updateTerminalState(host.id, {
            isConnected: true,
            isConnecting: false,
            connectionId: message.data?.sessionId || '',
            error: undefined
          });

          // 发送初始终端大小
          const size = instanceService.getTerminalSize(host.id);
          if (size && wsServiceRef.current) {
            wsServiceRef.current.sendResize(size.cols, size.rows);
          }
          break;

        case 'terminal_error':
          console.error('Terminal error:', message.data);
          const errorMsg = message.data?.message || message.data || 'Terminal error';
          updateTerminalState(host.id, {
            error: errorMsg,
            isConnected: false,
            isConnecting: false
          });

          // 在终端中显示错误
          instanceService.writeToTerminal(host.id, `\r\n\x1b[31mError: ${errorMsg}\x1b[0m\r\n`);
          break;
      }
    };

    // WebSocket状态变化处理
    const handleStateChange = (wsState: any) => {
      switch (wsState) {
        case 'CONNECTING':
          updateTerminalState(host.id, { isConnecting: true, error: undefined });
          break;
        case 'OPEN':
          updateTerminalState(host.id, { isConnecting: false });
          break;
        case 'CLOSED':
          updateTerminalState(host.id, { isConnected: false, isConnecting: false });
          break;
      }
    };

    // 错误处理
    const handleError = (error: string) => {
      updateTerminalState(host.id, { 
        error, 
        isConnected: false, 
        isConnecting: false 
      });
    };

    // 创建WebSocket服务
    wsServiceRef.current = new TerminalWebSocketService(
      host.id,
      handleMessage,
      handleStateChange,
      handleError
    );

    isInitializedRef.current = true;
  }, [host.id, updateTerminalState]);

  // 连接终端
  const connect = useCallback(async (element: HTMLElement) => {
    try {
      initializeServices();
      
      const wsService = wsServiceRef.current;
      const instanceService = instanceServiceRef.current;
      
      if (!wsService || !instanceService) {
        throw new Error('Services not initialized');
      }

      // 创建或获取终端实例
      let instance = instanceService.getInstance(host.id);
      if (!instance) {
        instance = await instanceService.createInstance(host.id);
      }
      
      if (instance) {
        // 绑定事件 - 使用防抖来避免频繁发送
        let resizeTimeout: NodeJS.Timeout;
        
        instance.terminal.onData((data: string) => {
          // 确保连接后再发送数据
          if (wsService.isConnected()) {
            wsService.sendInput(data);
          }
        });

        instance.terminal.onResize(({ cols, rows }: { cols: number; rows: number }) => {
          // 防抖处理resize事件
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (wsService.isConnected()) {
              wsService.sendResize(cols, rows);
            }
          }, 100);
        });
      }

      // 挂载终端到DOM
      instanceService.mountTerminal(host.id, element);

      // 先连接WebSocket，等待连接成功
      await wsService.connect();

      // 等待一小段时间确保连接稳定
      await new Promise(resolve => setTimeout(resolve, 100));

      // 连接成功后发送连接参数
      const size = instanceService.getTerminalSize(host.id);
      const params: TerminalConnectionParams = {
        hostId: host.id,
        width: size?.cols || 80,
        height: size?.rows || 24,
        shell: 'bash'
      };

      wsService.sendConnectParams(params);

    } catch (error) {
      console.error('Failed to connect terminal:', error);
      updateTerminalState(host.id, {
        error: 'Failed to initialize terminal',
        isConnecting: false
      });
    }
  }, [host.id, initializeServices, updateTerminalState]);  // 断开连接
  const disconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
    }
    if (instanceServiceRef.current) {
      instanceServiceRef.current.unmountTerminal(host.id);
    }
  }, [host.id]);

  // 重连
  const reconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      setTimeout(() => {
        wsServiceRef.current?.connect();
      }, 1000);
    }
  }, []);

  // 清屏
  const clear = useCallback(() => {
    if (instanceServiceRef.current) {
      instanceServiceRef.current.clearTerminal(host.id);
    }
  }, [host.id]);

  // 复制选中内容
  const copy = useCallback(async () => {
    if (instanceServiceRef.current) {
      const selection = instanceServiceRef.current.getTerminalSelection(host.id);
      if (selection) {
        try {
          await navigator.clipboard.writeText(selection);
          return true;
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
        }
      }
    }
    return false;
  }, [host.id]);

  // 粘贴内容
  const paste = useCallback(async () => {
    if (instanceServiceRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        return instanceServiceRef.current.pasteToTerminal(host.id, text);
      } catch (error) {
        console.error('Failed to paste from clipboard:', error);
      }
    }
    return false;
  }, [host.id]);

  // 调整大小
  const resize = useCallback(() => {
    if (instanceServiceRef.current) {
      return instanceServiceRef.current.resizeTerminal(host.id);
    }
    return false;
  }, [host.id]);

  // 发送输入
  const sendInput = useCallback((data: string) => {
    if (wsServiceRef.current) {
      return wsServiceRef.current.sendInput(data);
    }
    return false;
  }, []);

  // 状态变化通知
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.destroy();
      }
      if (instanceServiceRef.current) {
        instanceServiceRef.current.unmountTerminal(host.id);
      }
    };
  }, [host.id]);

  return {
    state,
    operations: {
      connect,
      disconnect,
      reconnect,
      clear,
      copy,
      paste,
      resize,
      sendInput
    }
  };
}
