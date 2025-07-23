import { Outlet, useNavigate } from "@remix-run/react";
import { SidebarProvider, SidebarInset } from "~/shared/components/ui/sidebar";
import { AppSidebar } from "~/shared/components/layouts/AppLayout";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { useProjectActions } from "~/shared/hooks/business/useProjectActions";
import { Project } from "~/shared/types/project";
import { useProjects } from "~/shared/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { RemixTabBrowser } from "~/shared/components/navigation/RemixTabBrowser";

export default function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 获取项目数据
  const { data: projects = [], isLoading, error } = useProjects();
  
  // 使用布局状态管理
  const {
    selected,
    setProjects,
  } = useLayoutStore();

  // 初始化项目数据到store
  useEffect(() => {
    if (projects.length > 0) {
      setProjects(projects);
    }
  }, [projects]); // 移除 setProjects 依赖项以避免无限循环

  // 项目更新回调函数
  const handleProjectsUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  // 使用项目操作hook
  const {
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleMoveProject
  } = useProjectActions({ onProjectsUpdate: handleProjectsUpdate });

  // 处理侧边栏选择 - 使用路由导航
  const handleSidebarSelect = (selectedItem: any) => {
    if (selectedItem.type === 'overview') {
      navigate('/app');
    } else if (selectedItem.type === 'project') {
      navigate(`/app/project/${selectedItem.projectId}`);
    } else if (selectedItem.type === 'group') {
      navigate(`/app/group/${selectedItem.groupId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">
          加载失败: {error instanceof Error ? error.message : '未知错误'}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          projects={projects}
          selected={selected}
          onSelect={handleSidebarSelect}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onMoveProject={handleMoveProject}
        />
        
        <SidebarInset className="flex-1">
          {/* 使用新的标签页浏览器 */}
          <RemixTabBrowser>
            <Outlet />
          </RemixTabBrowser>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
