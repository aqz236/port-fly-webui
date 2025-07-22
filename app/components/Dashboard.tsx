import { useState } from "react";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { AppSidebar, AppHeader, ViewType, SelectedItem } from "~/components/layout";
import { OverviewView, ProjectView, GroupView } from "~/components/views";
import { Project } from "~/components/features/projects";
import { Group } from "~/components/features/groups";
import { Host } from "~/components/features/hosts";
import { PortForward } from "~/components/features/ports";
import { apiClient } from "~/lib/api/client";
import type { CreateProjectData } from "~/types/api";

interface DashboardProps {
  projects: Project[];
  onProjectsUpdate?: () => void; // 添加项目更新回调
}

export function Dashboard({ projects, onProjectsUpdate }: DashboardProps) {
  const [selected, setSelected] = useState<SelectedItem>({ type: 'overview' });

  const getSelectedProject = (): Project | null => {
    if (selected.projectId) {
      return projects.find(p => p.id === selected.projectId) || null;
    }
    return null;
  };

  const getSelectedGroup = (): Group | null => {
    const project = getSelectedProject();
    if (project && selected.groupId) {
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
      const newProject = await apiClient.createProject(data);
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
