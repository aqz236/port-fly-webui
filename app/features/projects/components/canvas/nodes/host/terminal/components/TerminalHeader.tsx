// 终端头部组件
import React from 'react';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { 
  Copy, 
  Clipboard, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Minimize2, 
  X 
} from 'lucide-react';
import { Host } from '~/shared/types/host';
import { TerminalOperations } from '../types';
import { useTerminalStatus } from '../hooks/useTerminalStatus';

interface TerminalHeaderProps {
  host: Host;
  state: any;
  operations: TerminalOperations;
  embedded?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onClose?: () => void;
}

export function TerminalHeader({
  host,
  state,
  operations,
  embedded = false,
  isMaximized = false,
  onToggleMaximize,
  onClose
}: TerminalHeaderProps) {
  const { 
    statusText, 
    statusColor, 
    canExecuteCommands, 
    needsReconnect,
    indicatorClass 
  } = useTerminalStatus({ state });

  const handleCopy = async () => {
    try {
      await operations.copy();
    } catch (error) {
      console.warn('Copy failed:', error);
    }
  };

  const handlePaste = async () => {
    try {
      await operations.paste();
    } catch (error) {
      console.warn('Paste failed:', error);
    }
  };

  const buttonSize = embedded ? 'sm' : 'sm';
  const iconSize = embedded ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className={`flex items-center justify-between ${embedded ? 'p-2 border-b' : 'p-3'}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={indicatorClass} />
          <span className={`font-medium ${embedded ? 'text-sm' : 'text-base'}`}>
            {embedded ? host.name : `SSH 终端 - ${host.name}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{host.hostname}:{host.port}</span>
          <Badge variant="outline" className="text-xs">
            {statusText}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* 复制按钮 */}
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleCopy}
          disabled={!canExecuteCommands}
          className={embedded ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
          title="复制选中内容 (Ctrl+C)"
        >
          <Copy className={iconSize} />
        </Button>
        
        {/* 粘贴按钮 */}
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handlePaste}
          disabled={!canExecuteCommands}
          className={embedded ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
          title="粘贴 (Ctrl+V)"
        >
          <Clipboard className={iconSize} />
        </Button>
        
        {/* 清屏按钮 */}
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={operations.clear}
          disabled={!canExecuteCommands}
          className={embedded ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
          title="清屏 (Ctrl+L)"
        >
          <RotateCcw className={iconSize} />
        </Button>
        
        {/* 重连按钮 */}
        {needsReconnect && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={operations.reconnect}
            className={embedded ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            title="重新连接"
          >
            <Settings className={iconSize} />
          </Button>
        )}
        
        {/* 最大化/还原按钮 (仅非嵌入模式) */}
        {!embedded && onToggleMaximize && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={onToggleMaximize}
            className="h-8 w-8 p-0"
            title={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? (
              <Minimize2 className={iconSize} />
            ) : (
              <Maximize2 className={iconSize} />
            )}
          </Button>
        )}
        
        {/* 关闭按钮 (仅非嵌入模式) */}
        {!embedded && onClose && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={onClose}
            className="h-8 w-8 p-0"
            title="关闭"
          >
            <X className={iconSize} />
          </Button>
        )}
      </div>
    </div>
  );
}
