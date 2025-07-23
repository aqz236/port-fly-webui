// ProjectDetail 组件 v3 - 重构后的清晰架构
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
  const handleCreateGroupClick = useCallback(() => {
    openCreateGroupDialog(project.id);
  }, [project.id, openCreateGroupDialog]);

  const handleDeleteNode = useCallback(async (nodeType: string, nodeId: number) => {
    if (!confirm(`确定要删除这个${nodeType === 'group' ? '组' : nodeType === 'host' ? '主机' : '端口转发'}吗？`)) {
      return;
    }

    try {
      switch (nodeType) {
        case 'group':
          await handleDeleteGroup(nodeId, refetchGroups);
          break;
        case 'host':
          await handleDeleteHost(nodeId, refetchHosts);
          break;
        case 'port':
          await handleDeletePortForward(nodeId, refetchPortForwards);
          break;
      }
    } catch (error) {
      console.error('删除失败:', error);
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
      console.error('保存组失败:', error);
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

      {/* 资源管理器 */}
      <ResourceViewer
        project={projectWithData}
        stats={stats}
        onCreateGroup={handleCreateGroupClick}
        onEditGroup={openEditGroupDialog}
        onDeleteGroup={(id) => handleDeleteNode('group', id)}
        onCreateHost={openCreateHostDialog}
        onEditHost={openEditHostDialog}
        onDeleteHost={(id) => handleDeleteNode('host', id)}
        onConnectHost={handleConnectHost}
        onCreatePort={openCreatePortDialog}
        onEditPort={openEditPortDialog}
        onDeletePort={(id) => handleDeleteNode('port', id)}
        onTogglePort={handleStartPortForward}
      />

      {/* 项目数据展示 */}
      {/* <ProjectDataView project={projectWithData} /> */}

      {/* 资源对话框 */}
      {/* <ResourceDialogs
        dialogState={dialogState}
        hosts={hosts}
        onCloseDialog={closeDialog}
        onSaveGroup={handleSaveGroup}
        onSaveHost={handleSaveHost}
        onSavePortForward={handleSavePortForward}
        groupLoading={groupLoading}
        hostLoading={hostLoading}
        portLoading={portLoading}
      /> */}
    </div>
  );
}
