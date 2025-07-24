// ProjectDetail 组件 - 新架构版本
import { useCallback } from "react";
import { Project, ProjectStats } from "~/shared/types/project";
import { Group, CreateGroupData, UpdateGroupData } from "~/shared/types/group";
import { Host, CreateHostData, UpdateHostData } from "~/shared/types/host";
import { PortForward, CreatePortForwardData, UpdatePortForwardData } from "~/shared/types/port-forward";

// Custom hooks
import { useProjectData } from "../hooks/useProjectData";
import { useProjectActions } from "../hooks/useProjectActions";
import { useResourceDialog } from "../hooks/useResourceDialog";

// Components
import { ProjectHeader } from "./ProjectHeader";
import { ResourceViewer } from "./ResourceViewer";
import { ProjectDataView } from "./ProjectDataView";
import { ResourceDialogs } from "./ResourceDialogs";

interface ProjectDetailProps {
  project: Project;
  stats?: ProjectStats;
  onGroupClick?: (group: Group) => void;
}

export function ProjectDetail({ project, stats, onGroupClick }: ProjectDetailProps) {
  // Custom hooks
  const { projectWithData, hosts, refetchGroups, refetchHosts, refetchPortForwards } = useProjectData(project);
  
  const {
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleCreateHost,
    handleUpdateHost,
    handleDeleteHost,
    handleCreatePortForward,
    handleUpdatePortForward,
    handleDeletePortForward,
    handleConnectHost,
    handleStartPortForward,
    groupLoading,
    hostLoading,
    portLoading,
  } = useProjectActions();

  const {
    dialogState,
    closeDialog,
    openCreateGroupDialog,
    openEditGroupDialog,
    openCreateHostDialog,
    openEditHostDialog,
    openCreatePortDialog,
    openEditPortDialog,
  } = useResourceDialog();

  // Resource event handlers
  const handleCreateGroupClick = useCallback((projectId: number) => {
    openCreateGroupDialog(projectId);
  }, [openCreateGroupDialog]);

  const handleDeleteResource = useCallback(async (resourceType: string, resourceId: number) => {
    const resourceNames = {
      'group': '画布',
      'host': '主机',
      'port': '端口转发'
    };
    
    const resourceName = resourceNames[resourceType as keyof typeof resourceNames] || resourceType;
    
    if (!confirm(`确定要删除这个${resourceName}吗？`)) {
      return;
    }

    try {
      switch (resourceType) {
        case 'group':
          await handleDeleteGroup(resourceId, refetchGroups);
          break;
        case 'host':
          await handleDeleteHost(resourceId, refetchHosts);
          break;
        case 'port':
          await handleDeletePortForward(resourceId, refetchPortForwards);
          break;
        default:
          console.warn(`未知的资源类型: ${resourceType}`);
      }
    } catch (error) {
      console.error(`删除${resourceName}失败:`, error);
    }
  }, [handleDeleteGroup, handleDeleteHost, handleDeletePortForward, refetchGroups, refetchHosts, refetchPortForwards]);

  // Dialog save handlers
  const handleSaveGroup = useCallback(async (data: CreateGroupData | UpdateGroupData) => {
    try {
      if (dialogState.mode === 'create') {
        await handleCreateGroup(data as CreateGroupData, refetchGroups);
      } else {
        await handleUpdateGroup(dialogState.data.id, data as UpdateGroupData, refetchGroups);
      }
      closeDialog();
    } catch (error) {
      console.error('保存画布失败:', error);
    }
  }, [dialogState, handleCreateGroup, handleUpdateGroup, refetchGroups, closeDialog]);

  const handleSaveHost = useCallback(async (data: CreateHostData | UpdateHostData) => {
    try {
      if (dialogState.mode === 'create') {
        await handleCreateHost(data as CreateHostData, refetchHosts);
      } else {
        await handleUpdateHost(dialogState.data.id, data as UpdateHostData, refetchHosts);
      }
      closeDialog();
    } catch (error) {
      console.error('保存主机失败:', error);
    }
  }, [dialogState, handleCreateHost, handleUpdateHost, refetchHosts, closeDialog]);

  const handleSavePortForward = useCallback(async (data: CreatePortForwardData | UpdatePortForwardData) => {
    try {
      if (dialogState.mode === 'create') {
        await handleCreatePortForward(data as CreatePortForwardData, refetchPortForwards);
      } else {
        await handleUpdatePortForward(dialogState.data.id, data as UpdatePortForwardData, refetchPortForwards);
      }
      closeDialog();
    } catch (error) {
      console.error('保存端口转发失败:', error);
    }
  }, [dialogState, handleCreatePortForward, handleUpdatePortForward, refetchPortForwards, closeDialog]);

  return (
    <div className="w-full h-full">
      {/* 项目头部信息 */}
      {/* <ProjectHeader project={projectWithData} stats={stats} /> */}

      {/* 资源管理器 */}
      <ResourceViewer
        project={projectWithData}
        stats={stats}
        onCreateGroup={handleCreateGroupClick}
        onEditGroup={openEditGroupDialog}
        onDeleteGroup={(id) => handleDeleteResource('group', id)}
        onCreateHost={openCreateHostDialog}
        onEditHost={openEditHostDialog}
        onDeleteHost={(id) => handleDeleteResource('host', id)}
        onConnectHost={handleConnectHost}
        onCreatePort={openCreatePortDialog}
        onEditPort={openEditPortDialog}
        onDeletePort={(id) => handleDeleteResource('port', id)}
        onTogglePort={handleStartPortForward}
      />

      {/* 项目数据展示 */}
      {/* <ProjectDataView project={projectWithData} /> */}

      {/* 资源对话框 */}
      <ResourceDialogs
        dialogState={dialogState}
        hosts={hosts}
        onCloseDialog={closeDialog}
        onSaveGroup={handleSaveGroup}
        onSaveHost={handleSaveHost}
        onSavePortForward={handleSavePortForward}
        groupLoading={groupLoading}
        hostLoading={hostLoading}
        portLoading={portLoading}
      />
    </div>
  );
}
