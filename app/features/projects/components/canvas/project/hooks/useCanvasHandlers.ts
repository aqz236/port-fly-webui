// 画布操作处理器的自定义Hook
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';
import { Port, PortType } from '~/shared/types/port';
import { ProjectCanvasProps, CanvasHandlers } from '../types';

/**
 * 画布操作处理器Hook
 * @param props 画布属性
 * @returns 操作处理器对象
 */
export function useCanvasHandlers(props: ProjectCanvasProps): CanvasHandlers {
  const queryClient = useQueryClient();
  const {
    onCreateHost,
    onCreatePort,
    onCreatePortV2,
    onEditHost,
    onDeleteHost,
    onConnectHost,
    onEditPort,
    onEditPortV2,
    onDeletePort,
    onTogglePort,
  } = props;


  const handleAddHost = useCallback((groupId: number) => {
    onCreateHost?.(groupId);
  }, [onCreateHost]);

  const handleAddPort = useCallback((groupId: number) => {
    onCreatePort?.(groupId);
  }, [onCreatePort]);

  const handleAddPortV2 = useCallback((groupId: number, portType: PortType) => {
    onCreatePortV2?.(groupId, portType);
  }, [onCreatePortV2]);

  // 主机操作处理器
  const handleHostEdit = useCallback((host: Host) => {
    onEditHost?.(host);
  }, [onEditHost]);

  const handleHostDelete = useCallback((hostId: number) => {
    onDeleteHost?.(hostId);
  }, [onDeleteHost]);

  const handleHostDisconnect = useCallback(async (hostId: number) => {
    console.log('断开主机:', hostId);
    try {
      const response = await fetch(`/api/v1/hosts/${hostId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`断开失败: ${errorData.error || errorData.message || '服务器错误'}`);
      }
      
      const result = await response.json();
      console.log('主机断开成功:', result);
      
      // 更新查询缓存
      if (result.success && result.data) {
        queryClient.setQueryData(['hosts', hostId], result.data);
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['hosts'] });
      }
      
    } catch (error) {
      console.error('主机断开失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`主机断开失败: ${errorMessage}`);
    }
  }, [queryClient]);

  const handleHostConnect = useCallback(async (hostId: number) => {
    console.log('连接主机:', hostId);
    try {
      // 先测试连接
      console.log('测试主机连接...');
      const testResponse = await fetch(`/api/v1/hosts/${hostId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!testResponse.ok) {
        const testError = await testResponse.json();
        throw new Error(`连接测试失败: ${testError.error || testError.message || '未知错误'}`);
      }
      
      const testResult = await testResponse.json();
      console.log('连接测试结果:', testResult);
      
      if (!testResult.success) {
        throw new Error(`连接测试失败: ${testResult.message || '主机不可达'}`);
      }
      
      // 测试成功后再进行实际连接
      console.log('开始连接主机...');
      const response = await fetch(`/api/v1/hosts/${hostId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`连接失败: ${errorData.error || errorData.message || '服务器错误'}`);
      }
      
      const result = await response.json();
      console.log('主机连接成功:', result);
      
      // 如果返回了更新的主机数据，更新查询缓存
      if (result.success && result.data) {
        // 更新主机缓存
        queryClient.setQueryData(['hosts', hostId], result.data);
        
        // 失效项目查询以刷新整个项目数据
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['hosts'] });
      }
      
      // 调用上层处理器
      onConnectHost?.(hostId);
    } catch (error) {
      console.error('主机连接失败:', error);
      // 可以在这里添加一个 toast 通知
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`主机连接失败: ${errorMessage}`);
    }
  }, [onConnectHost]);

  // 端口操作处理器
  const handlePortEdit = useCallback((port: PortForward) => {
    onEditPort?.(port);
  }, [onEditPort]);

  const handlePortDelete = useCallback((portId: number) => {
    onDeletePort?.(portId);
  }, [onDeletePort]);

  const handlePortToggle = useCallback((portId: number) => {
    onTogglePort?.(portId);
  }, [onTogglePort]);

  return useMemo(() => ({
    handleAddHost,
    handleAddPort,
    handleAddPortV2,
    onCreatePortV2,
    handleHostEdit,
    handleHostDelete,
    handleHostConnect,
    handleHostDisconnect,
    handlePortEdit,
    handlePortDelete,
    handlePortToggle,
  }), [
    handleAddHost,
    handleAddPort,
    handleAddPortV2,
    onCreatePortV2,
    handleHostEdit,
    handleHostDelete,
    handleHostConnect,
    handleHostDisconnect,
    handlePortEdit,
    handlePortDelete,
    handlePortToggle,
  ]);
}
