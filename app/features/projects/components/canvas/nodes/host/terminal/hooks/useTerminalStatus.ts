// 终端状态管理Hook
import { useMemo } from 'react';
import { TerminalState } from '../types';
import { TERMINAL_STATUS_TEXT, TERMINAL_STATUS_COLORS } from '../config';

interface UseTerminalStatusProps {
  state: TerminalState;
}

export function useTerminalStatus({ state }: UseTerminalStatusProps) {
  // 获取状态文本
  const statusText = useMemo(() => {
    if (state.isConnecting) return TERMINAL_STATUS_TEXT.CONNECTING;
    if (state.isConnected) return TERMINAL_STATUS_TEXT.CONNECTED;
    if (state.error) return TERMINAL_STATUS_TEXT.ERROR;
    return TERMINAL_STATUS_TEXT.DISCONNECTED;
  }, [state.isConnecting, state.isConnected, state.error]);

  // 获取状态颜色
  const statusColor = useMemo(() => {
    if (state.isConnecting) return TERMINAL_STATUS_COLORS.CONNECTING;
    if (state.isConnected) return TERMINAL_STATUS_COLORS.CONNECTED;
    if (state.error) return TERMINAL_STATUS_COLORS.ERROR;
    return TERMINAL_STATUS_COLORS.DISCONNECTED;
  }, [state.isConnecting, state.isConnected, state.error]);

  // 获取状态图标
  const getStatusIcon = useMemo(() => {
    if (state.isConnecting) return '🟡';
    if (state.isConnected) return '🟢';
    if (state.error) return '🔴';
    return '⚪';
  }, [state.isConnecting, state.isConnected, state.error]);

  // 检查是否可以执行操作
  const canExecuteCommands = useMemo(() => {
    return state.isConnected && !state.isConnecting && !state.error;
  }, [state.isConnected, state.isConnecting, state.error]);

  // 检查是否需要重连
  const needsReconnect = useMemo(() => {
    return !state.isConnected && !state.isConnecting && !!state.error;
  }, [state.isConnected, state.isConnecting, state.error]);

  return {
    // 状态信息
    statusText,
    statusColor,
    statusIcon: getStatusIcon,
    
    // 状态标志
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    hasError: !!state.error,
    error: state.error,
    connectionId: state.connectionId,
    
    // 操作标志
    canExecuteCommands,
    needsReconnect,
    
    // 样式类
    indicatorClass: `w-2 h-2 rounded-full ${statusColor}`,
    badgeVariant: state.error ? 'destructive' : 'outline'
  };
}
