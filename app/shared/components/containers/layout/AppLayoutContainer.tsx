import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "~/shared/components/ui/sidebar";
import { AppSidebar } from "~/shared/components/layouts/AppLayout";
import { AppHeader } from "~/shared/components/layouts/AppLayout/AppHeader";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { TabContentRenderer } from "./TabContentRenderer";
import { MainContentArea } from "../content/MainContentArea";
import { useSidebarSelection } from "~/shared/hooks/layout/useSidebarSelection";
import { useProjectActions } from "~/shared/hooks/business/useProjectActions";
import { getPageTitle } from "~/shared/utils/pageTitle";
import { Project } from "~/shared/types/project";

interface AppLayoutContainerProps {
  projects: Project[];
  onProjectsUpdate: () => void;
}

export function AppLayoutContainer({ projects, onProjectsUpdate }: AppLayoutContainerProps) {
  // 使用布局状态管理
  const {
    selected,
    tabs,
    activeTab,
    setProjects,
    closeTab,
    setActiveTab,
    openGroupTab
  } = useLayoutStore()

  // 初始化项目数据到store
  useEffect(() => {
    setProjects(projects)
  }, [projects, setProjects])

  // 使用侧边栏选择hook
  const { handleSidebarSelect } = useSidebarSelection({ projects })

  // 使用项目操作hook
  const {
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleMoveProject
  } = useProjectActions({ onProjectsUpdate })

  // 标签页变更处理
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  // 处理添加组
  const handleAddGroup = (projectId: number) => {
    console.log('添加组到项目', projectId)
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
          <AppHeader
            title={getPageTitle(selected, projects)}
            tabs={tabs}
            activeTab={activeTab || undefined}
            onTabChange={handleTabChange}
            onTabClose={closeTab}
          >
            {/* 标签页内容 */}
            <TabContentRenderer 
              tabs={tabs}
              onGroupClick={openGroupTab}
              onAddGroup={handleAddGroup}
            />
          </AppHeader>
          
          {/* 主内容区域 */}
          <MainContentArea projects={projects} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
