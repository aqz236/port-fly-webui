// 画布操作处理器的自定义Hook
import { useCallback, useMemo } from 'react';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';
import { ProjectCanvasProps, CanvasHandlers } from '../types';

/**
 * 画布操作处理器Hook
 * @param props 画布属性
 * @returns 操作处理器对象
 */
export function useCanvasHandlers(props: ProjectCanvasProps): CanvasHandlers {
  const {
    onEditGroup,
    onDeleteGroup,
    onCreateHost,
    onCreatePort,
    onEditHost,
    onDeleteHost,
    onConnectHost,
    onEditPort,
    onDeletePort,
    onTogglePort,
  } = props;

  // 组操作处理器
  const handleEditGroup = useCallback((group: Group) => {
    onEditGroup?.(group);
  }, [onEditGroup]);

  const handleDeleteGroup = useCallback((groupId: number) => {
    onDeleteGroup?.(groupId);
  }, [onDeleteGroup]);

  const handleAddHost = useCallback((groupId: number) => {
    onCreateHost?.(groupId);
  }, [onCreateHost]);

  const handleAddPort = useCallback((groupId: number) => {
    onCreatePort?.(groupId);
  }, [onCreatePort]);

  // 主机操作处理器
  const handleHostEdit = useCallback((host: Host) => {
    onEditHost?.(host);
  }, [onEditHost]);

  const handleHostDelete = useCallback((hostId: number) => {
    onDeleteHost?.(hostId);
  }, [onDeleteHost]);

  const handleHostConnect = useCallback((hostId: number) => {
    onConnectHost?.(hostId);
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
    handleEditGroup,
    handleDeleteGroup,
    handleAddHost,
    handleAddPort,
    handleHostEdit,
    handleHostDelete,
    handleHostConnect,
    handlePortEdit,
    handlePortDelete,
    handlePortToggle,
  }), [
    handleEditGroup,
    handleDeleteGroup,
    handleAddHost,
    handleAddPort,
    handleHostEdit,
    handleHostDelete,
    handleHostConnect,
    handlePortEdit,
    handlePortDelete,
    handlePortToggle,
  ]);
}
