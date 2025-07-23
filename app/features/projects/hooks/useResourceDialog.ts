// useResourceDialog.ts - 资源对话框状态管理Hook
import { useState, useCallback, useEffect } from "react";
import { Group } from "~/shared/types/group";
import { Host } from "~/shared/types/host";
import { PortForward } from "~/shared/types/port-forward";

export interface DialogState {
  type: 'group' | 'host' | 'port' | null;
  mode: 'create' | 'edit';
  data?: any;
  projectId?: number;
  groupId?: number;
  hostId?: number;
}

export function useResourceDialog() {
  const [dialogState, setDialogState] = useState<DialogState>({ 
    type: null, 
    mode: 'create' 
  });



  const openDialog = useCallback((
    type: DialogState['type'], 
    mode: DialogState['mode'], 
    data?: any, 
    projectId?: number,
    groupId?: number, 
    hostId?: number
  ) => {
    setDialogState({ type, mode, data, projectId, groupId, hostId });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, mode: 'create' });
  }, []);

  // 便捷方法
  const openCreateGroupDialog = useCallback((projectId: number) => {
    openDialog('group', 'create', {}, projectId);
  }, [openDialog]);

  const openEditGroupDialog = useCallback((group: Group) => {
    openDialog('group', 'edit', group, group.project_id, group.id);
  }, [openDialog]);

  const openCreateHostDialog = useCallback((groupId: number) => {
    openDialog('host', 'create', {}, undefined, groupId);
  }, [openDialog]);

  const openEditHostDialog = useCallback((host: Host) => {
    openDialog('host', 'edit', host, undefined, host.group_id, host.id);
  }, [openDialog]);

  const openCreatePortDialog = useCallback((groupId: number, hostId?: number) => {
    openDialog('port', 'create', {}, undefined, groupId, hostId);
  }, [openDialog]);

  const openEditPortDialog = useCallback((port: PortForward) => {
    openDialog('port', 'edit', port, undefined, port.group_id, port.host_id);
  }, [openDialog]);

  return {
    dialogState,
    openDialog,
    closeDialog,
    openCreateGroupDialog,
    openEditGroupDialog,
    openCreateHostDialog,
    openEditHostDialog,
    openCreatePortDialog,
    openEditPortDialog,
  };
}
