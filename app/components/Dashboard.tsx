import { useState } from "react";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { AppSidebar, AppHeader, ViewType, SelectedItem } from "~/components/layout";
import { OverviewView, ProjectView, GroupView } from "~/components/views";
import { ProjectCard } from "~/components/features/projects";
import { GroupCard } from "~/components/features/groups";
import { 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject, 
  useMoveProject 
} from "~/lib/hooks/api";
import type { CreateProjectData, UpdateProjectData, MoveProjectParams, Project, Group, Host, PortForward } from "~/types/api";
import type { EditProjectData } from "~/components/dialogs/edit-project-dialog";

interface DashboardProps {
  projects: Project[];
  onProjectsUpdate?: () => void; // 添加项目更新回调
}

export function Dashboard({ projects, onProjectsUpdate }: DashboardProps) {
  const [selected, setSelected] = useState<SelectedItem>({ type: 'overview' });

  // 使用 mutation hooks
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const moveProjectMutation = useMoveProject();

  const getSelectedProject = (): Project | null => {
    if (selected.projectId) {
      return projects.find(p => p.id === selected.projectId) || null;
    }
    return null;
  };

  const getSelectedGroup = (): Group | null => {
    const project = getSelectedProject();
    if (project && project.groups && selected.groupId) {
      return project.groups.find(g => g.id === selected.groupId) || null;
    }
    return null;
  };

  const getPageTitle = (): string => {
    switch (selected.type) {
      case 'project':
        return getSelectedProject()?.name || '项目';
      case 'group':
        return getSelectedGroup()?.name || '组';
      default:
        return '概览';
    }
  };

  const handleProjectSelect = (projectId: number) => {
    setSelected({ type: 'project', projectId });
  };

  const handleGroupSelect = (projectId: number, groupId: number) => {
    setSelected({ type: 'group', projectId, groupId });
  };

  // 事件处理函数
  const handleEditHost = (host: Host) => {
    console.log('编辑主机:', host);
    // TODO: 实现编辑主机逻辑
  };

  const handleToggleConnection = (host: Host) => {
    console.log('切换连接状态:', host);
    // TODO: 实现连接/断开逻辑
  };

  const handleEditPort = (port: PortForward) => {
    console.log('编辑端口转发:', port);
    // TODO: 实现编辑端口转发逻辑
  };

  const handleTogglePortStatus = (port: PortForward) => {
    console.log('切换端口状态:', port);
    // TODO: 实现启动/停止端口转发逻辑
  };

  const handleAddGroup = () => {
    console.log('添加组');
    // TODO: 实现添加组逻辑
  };

  const handleAddHost = () => {
    console.log('添加主机');
    // TODO: 实现添加主机逻辑
  };

  const handleAddPort = () => {
    console.log('添加端口转发');
    // TODO: 实现添加端口转发逻辑
  };

  // 创建项目处理函数
  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      console.log('Creating project with data:', data);
      const newProject = await createProjectMutation.mutateAsync(data);
      console.log('Project created successfully:', newProject);
      
      // 触发项目列表更新
      if (onProjectsUpdate) {
        onProjectsUpdate();
      }
      
      // 可选：自动选择新创建的项目
      setSelected({ type: 'project', projectId: newProject.id });
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error; // 重新抛出错误，让Dialog组件处理
    }
  };

  // 移动项目处理函数
  const handleMoveProject = async (params: MoveProjectParams) => {
    try {
      console.log('Moving project with params:', params);
      await moveProjectMutation.mutateAsync(params);
      console.log('Project moved successfully');
      
      // 触发项目列表更新
      if (onProjectsUpdate) {
        onProjectsUpdate();
      }
    } catch (error) {
      console.error('Failed to move project:', error);
      throw error;
    }
  };

  // 编辑项目处理函数
  const handleEditProject = async (projectId: number, data: EditProjectData) => {
    try {
      console.log('Editing project:', projectId, 'with data:', data);
      
      // 获取原项目数据以保留parent_id等字段
      const originalProject = projects.find(p => p.id === projectId);
      
      // 将 EditProjectData 转换为 UpdateProjectData
      const updateData: UpdateProjectData = {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        is_default: data.is_default,
        // 保留原有的parent_id，维持项目层级关系
        parent_id: originalProject?.parent_id,
      };
      
      await updateProjectMutation.mutateAsync({ id: projectId, data: updateData });
      console.log('Project edited successfully');
      
      // 触发项目列表更新
      if (onProjectsUpdate) {
        onProjectsUpdate();
      }
    } catch (error) {
      console.error('Failed to edit project:', error);
      throw error;
    }
  };

  // 删除项目处理函数
  const handleDeleteProject = async (projectId: number) => {
    try {
      console.log('Deleting project:', projectId);
      await deleteProjectMutation.mutateAsync(projectId);
      console.log('Project deleted successfully');
      
      // 如果删除的是当前选中的项目，回到概览页面
      if (selected.type === 'project' && selected.projectId === projectId) {
        setSelected({ type: 'overview' });
      }
      
      // 触发项目列表更新
      if (onProjectsUpdate) {
        onProjectsUpdate();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const renderMainContent = () => {
    switch (selected.type) {
      case 'project': {
        const project = getSelectedProject();
        if (!project) return null;
        return (
          <ProjectView
            project={project}
            onGroupSelect={(groupId) => handleGroupSelect(project.id, groupId)}
            onAddGroup={handleAddGroup}
          />
        );
      }
      case 'group': {
        const group = getSelectedGroup();
        if (!group) return null;
        return (
          <GroupView
            group={group}
            onAddHost={handleAddHost}
            onAddPort={handleAddPort}
            onEditHost={handleEditHost}
            onToggleConnection={handleToggleConnection}
            onEditPort={handleEditPort}
            onTogglePortStatus={handleTogglePortStatus}
          />
        );
      }
      default:
        return (
          <OverviewView
            projects={projects}
            onProjectSelect={handleProjectSelect}
          />
        );
    }
  };

  return (

    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          projects={projects}
          selected={selected}
          onSelect={setSelected}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onMoveProject={handleMoveProject}
        />
        
        <SidebarInset className="flex-1">
          <AppHeader title={getPageTitle()} />
          
          <div className="flex-1 overflow-auto p-6">
            {renderMainContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>

  );
}
