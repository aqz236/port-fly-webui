// 主终端组件 - 模块化重构版本
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '~/shared/components/ui/card';
import '@xterm/xterm/css/xterm.css';

import { Host } from '~/shared/types/host';
import { TerminalProps, TerminalMode } from './types';
import { useTerminalManager } from './hooks/useTerminalManager';
import { TerminalHeader } from './components/TerminalHeader';
import { TerminalError } from './components/TerminalError';

export function Terminal({ 
  host, 
  isOpen, 
  onClose, 
  embedded = false,
  config,
  events
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 使用终端管理器
  const { state, operations } = useTerminalManager({
    host,
    onStateChange: events?.onStateChange
  });

  // 组件挂载时连接终端
  useEffect(() => {
    if (isOpen && terminalRef.current && !isMounted) {
      const connectTerminal = async () => {
        try {
          await operations.connect(terminalRef.current!);
          setIsMounted(true);
        } catch (error) {
          console.error('Failed to connect terminal:', error);
        }
      };
      connectTerminal();
    }
  }, [isOpen, isMounted]); // 移除operations依赖，避免无限循环

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (isMounted) {
        operations.disconnect();
      }
    };
  }, []); // 空依赖数组，只在组件卸载时执行

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (isMounted) {
        setTimeout(() => {
          operations.resize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [operations, isMounted]);

  // 切换最大化状态
  const handleToggleMaximize = () => {
    setIsMaximized(prev => !prev);
    // 延迟调整大小以等待动画完成
    setTimeout(() => {
      operations.resize();
    }, 300);
  };

  // 重连处理
  const handleReconnect = () => {
    if (terminalRef.current) {
      operations.reconnect();
    }
  };

  if (!isOpen) return null;

  // 嵌入模式渲染
  if (embedded) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <TerminalHeader
          host={host}
          state={state}
          operations={operations}
          embedded={true}
        />
        
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={terminalRef}
            className="h-full w-full overflow-hidden"
            style={{ 
              backgroundColor: '#1e1e1e',
              padding: '4px'
            }}
          />
          
          {state.error && (
            <TerminalError
              error={state.error}
              onRetry={handleReconnect}
              embedded={true}
            />
          )}
        </div>
      </div>
    );
  }

  // 弹窗模式渲染
  const containerClass = `fixed bg-black/50 z-50 flex items-center justify-center ${
    isMaximized ? 'inset-0 p-0' : 'inset-0 p-4'
  }`;

  const cardClass = `bg-background shadow-2xl ${
    isMaximized 
      ? 'w-full h-full rounded-none' 
      : 'w-[90vw] h-[80vh] max-w-6xl rounded-lg'
  }`;

  return (
    <div className={containerClass}>
      <Card className={`${cardClass} flex flex-col`}>
        <CardHeader className="pb-0">
          <TerminalHeader
            host={host}
            state={state}
            operations={operations}
            embedded={false}
            isMaximized={isMaximized}
            onToggleMaximize={handleToggleMaximize}
            onClose={onClose}
          />
        </CardHeader>

        <CardContent className="flex-1 p-0 relative">
          <div 
            ref={terminalRef}
            className="h-full w-full"
            style={{ 
              backgroundColor: '#1e1e1e',
              padding: '8px'
            }}
          />
          
          {state.error && (
            <TerminalError
              error={state.error}
              onRetry={handleReconnect}
              embedded={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Terminal;
