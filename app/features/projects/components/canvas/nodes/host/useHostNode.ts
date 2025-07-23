// useHostNode.ts - 主机节点相关的 Hook
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '~/shared/api/client';
import { Host } from '~/shared/types/host';
import { TerminalState, SSHExecParams, SSHExecResult } from './types';
import { useWebSocket } from '~/shared/hooks/useWebSocket';

interface WebSocketMessage {
  type: string;
  data: {
    host_id: number;
    status: string;
    last_connected?: string;
  };
}

export function useHostNode(hostId: number) {
  const queryClient = useQueryClient();
  const [terminalStates, setTerminalStates] = useState<Record<string, TerminalState>>({});

  // WebSocket 连接用于实时状态更新
  const { isConnected: wsConnected, sendMessage } = useWebSocket(
    'ws://localhost:8080/api/v1/ws',
    {
      onMessage: (message: WebSocketMessage) => {
        if (message.type === 'host_status_changed' && message.data.host_id === hostId) {
          // 更新主机状态
          queryClient.setQueryData(['hosts', hostId], (oldData: Host | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                status: message.data.status,
                last_connected: message.data.last_connected || oldData.last_connected
              };
            }
            return oldData;
          });
        }
      }
    }
  );

  // 连接主机
  const connectMutation = useMutation({
    mutationFn: async (hostId: number) => {
      const response = await fetch(`/api/v1/hosts/${hostId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('连接失败');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts', hostId] });
    },
  });

  // 断开主机连接
  const disconnectMutation = useMutation({
    mutationFn: async (hostId: number) => {
      const response = await fetch(`/api/v1/hosts/${hostId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('断开连接失败');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts', hostId] });
    },
  });

  // 执行 SSH 命令
  const execCommandMutation = useMutation({
    mutationFn: async (params: SSHExecParams): Promise<SSHExecResult> => {
      const response = await fetch(`/api/v1/hosts/${params.hostId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: params.command,
          timeout: params.timeout || 30000,
        }),
      });
      
      if (!response.ok) {
        throw new Error('命令执行失败');
      }
      
      const result = await response.json();
      return result.data; // 后端返回的数据在 data 字段中
    },
  });

  // 测试主机连接
  const testConnectionMutation = useMutation({
    mutationFn: async (hostId: number) => {
      return apiClient.hosts.testHostConnection(hostId);
    },
  });

  // 连接主机
  const connect = useCallback((hostId: number) => {
    connectMutation.mutate(hostId);
  }, [connectMutation]);

  // 断开连接
  const disconnect = useCallback((hostId: number) => {
    disconnectMutation.mutate(hostId);
  }, [disconnectMutation]);

  // 执行命令
  const execCommand = useCallback((params: SSHExecParams) => {
    return execCommandMutation.mutateAsync(params);
  }, [execCommandMutation]);

  // 测试连接
  const testConnection = useCallback((hostId: number) => {
    return testConnectionMutation.mutateAsync(hostId);
  }, [testConnectionMutation]);

  // 更新终端状态
  const updateTerminalState = useCallback((connectionId: string, state: Partial<TerminalState>) => {
    setTerminalStates(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        ...state
      }
    }));
  }, []);

  // 创建终端连接
  const createTerminalConnection = useCallback((hostId: number) => {
    const connectionId = `terminal_${hostId}_${Date.now()}`;
    const initialState: TerminalState = {
      hostId,
      connectionId,
      isConnected: false,
      isConnecting: true
    };
    
    setTerminalStates(prev => ({
      ...prev,
      [connectionId]: initialState
    }));
    
    return connectionId;
  }, []);

  // 关闭终端连接
  const closeTerminalConnection = useCallback((connectionId: string) => {
    setTerminalStates(prev => {
      const newStates = { ...prev };
      delete newStates[connectionId];
      return newStates;
    });
  }, []);

  return {
    // 状态
    wsConnected,
    terminalStates,
    
    // 连接操作
    connect,
    disconnect,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    
    // 命令执行
    execCommand,
    isExecuting: execCommandMutation.isPending,
    
    // 连接测试
    testConnection,
    isTesting: testConnectionMutation.isPending,
    
    // 终端管理
    createTerminalConnection,
    closeTerminalConnection,
    updateTerminalState,
    
    // 错误状态
    connectError: connectMutation.error,
    disconnectError: disconnectMutation.error,
    execError: execCommandMutation.error,
    testError: testConnectionMutation.error,
  };
}
