// useProjectActions.ts - 项目操作Hook
import { useCallback } from "react";
import { Group, CreateGroupData, UpdateGroupData } from "~/shared/types/group";
import { Host, CreateHostData, UpdateHostData } from "~/shared/types/host";

// API hooks
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from "~/shared/api/hooks/groups";
import { useCreateHost, useUpdateHost, useDeleteHost } from "~/shared/api/hooks/hosts";

// Store
import { useResourceStore } from "~/store/slices/resourceStore";

export function useProjectActions() {
  const {
    addGroup,
    updateGroup,
    removeGroup,
    addHost,
    updateHost,
    removeHost,
    addPortForward,
    updatePortForward,
    removePortForward
  } = useResourceStore();

  // Mutations
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const createHostMutation = useCreateHost();
  const updateHostMutation = useUpdateHost();
  const deleteHostMutation = useDeleteHost();


  // Group actions
  const handleCreateGroup = useCallback(async (data: CreateGroupData, refetchGroups: () => Promise<any>) => {
    try {
      const newGroup = await createGroupMutation.mutateAsync(data);
      addGroup(newGroup);
      await refetchGroups();
      return newGroup;
    } catch (error) {
      console.error('创建组失败:', error);
      throw error;
    }
  }, [createGroupMutation, addGroup]);

  const handleUpdateGroup = useCallback(async (id: number, data: UpdateGroupData, refetchGroups: () => Promise<any>) => {
    try {
      const updatedGroup = await updateGroupMutation.mutateAsync({ id, data });
      updateGroup(id, updatedGroup);
      await refetchGroups();
      return updatedGroup;
    } catch (error) {
      console.error('更新组失败:', error);
      throw error;
    }
  }, [updateGroupMutation, updateGroup]);

  const handleDeleteGroup = useCallback(async (id: number, refetchGroups: () => Promise<any>) => {
    try {
      await deleteGroupMutation.mutateAsync(id);
      removeGroup(id);
      await refetchGroups();
    } catch (error) {
      console.error('删除组失败:', error);
      throw error;
    }
  }, [deleteGroupMutation, removeGroup]);

  // Host actions
  const handleCreateHost = useCallback(async (data: CreateHostData, refetchHosts: () => Promise<any>) => {
    try {
      const newHost = await createHostMutation.mutateAsync(data);
      addHost(newHost);
      await refetchHosts();
      return newHost;
    } catch (error) {
      console.error('创建主机失败:', error);
      throw error;
    }
  }, [createHostMutation, addHost]);

  const handleUpdateHost = useCallback(async (id: number, data: UpdateHostData, refetchHosts: () => Promise<any>) => {
    try {
      const updatedHost = await updateHostMutation.mutateAsync({ id, data });
      updateHost(id, updatedHost);
      await refetchHosts();
      return updatedHost;
    } catch (error) {
      console.error('更新主机失败:', error);
      throw error;
    }
  }, [updateHostMutation, updateHost]);

  const handleDeleteHost = useCallback(async (id: number, refetchHosts: () => Promise<any>) => {
    try {
      await deleteHostMutation.mutateAsync(id);
      removeHost(id);
      await refetchHosts();
    } catch (error) {
      console.error('删除主机失败:', error);
      throw error;
    }
  }, [deleteHostMutation, removeHost]);





  // Canvas actions
  const handleConnectHost = useCallback(async (hostId: number) => {
    // TODO: 实现主机连接逻辑
    console.log('连接主机:', hostId);
  }, []);

  const handleStartPortForward = useCallback(async (portId: number) => {
    // TODO: 实现端口转发启动逻辑
    console.log('启动端口转发:', portId);
  }, []);

  const handleStopPortForward = useCallback(async (portId: number) => {
    // TODO: 实现端口转发停止逻辑
    console.log('停止端口转发:', portId);
  }, []);

  return {
    // Group actions
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    
    // Host actions
    handleCreateHost,
    handleUpdateHost,
    handleDeleteHost,
    
    
    // Canvas actions
    handleConnectHost,
    
    // Loading states
    groupLoading: createGroupMutation.isPending || updateGroupMutation.isPending,
    hostLoading: createHostMutation.isPending || updateHostMutation.isPending,
  };
}
