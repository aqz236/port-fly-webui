import { useState, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "~/shared/components/ui/sidebar";
import { AppSidebar } from "~/shared/components/layouts/AppLayout";
import { AppHeader } from "~/shared/components/layouts/AppLayout/AppHeader";
import { TabsContent } from "~/shared/components/ui/tabs";
import { Button } from "~/shared/components/ui/button";
import type { Project, Group, GroupStats, ProjectStats } from "~/shared/types/api";
import type { SelectedItem } from "~/shared/components/layouts/AppLayout";
import { mockGroups } from "~/lib/mock-data";
import { GroupDetail } from "~/features/groups/components/GroupDetail";
import { ProjectDetail } from "~/features/projects/components/ProjectDetail";
import { DashboardPage } from "~/pages";
import { useTabManager } from "./useTabManager";
import { useProjectActions } from "./useProjectActions";

interface AppLayoutContainerProps {
  projects: Project[];
  onProjectsUpdate: () => void;
}

export function AppLayoutContainer({ projects, onProjectsUpdate }: AppLayoutContainerProps) {
  const [selected, setSelected] = useState<SelectedItem>({ type: 'overview' });

  // 使用标签页管理hook
  const {
    tabs,
    activeTab,
    getProjectById,
    getGroupById,
    openGroupTab,
    openProjectTab,
    closeTab,
    handleTabChange
  } = useTabManager({ projects });

  // 使用项目操作hook
  const {
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleMoveProject
  } = useProjectActions({ onProjectsUpdate });

  // 处理侧边栏选择
  const handleSidebarSelect = useCallback((selectedItem: SelectedItem) => {
    if (selectedItem.type === 'group' && selectedItem.projectId && selectedItem.groupId) {
      // 查找对应的组数据
      const project = projects.find(p => p.id === selectedItem.projectId);
      if (project && project.groups) {
        const group = project.groups.find((g: any) => g.id === selectedItem.groupId);
        if (group) {
          openGroupTab(group as Group);
          return;
        }
      }
      
      // 如果找不到真实数据，使用模拟数据
      const mockGroup = mockGroups.find(g => g.id === selectedItem.groupId);
      if (mockGroup) {
        openGroupTab(mockGroup);
        return;
      }
    }
    
    if (selectedItem.type === 'project' && selectedItem.projectId) {
      // 查找对应的项目数据并打开标签页
      const project = projects.find(p => p.id === selectedItem.projectId);
      if (project) {
        openProjectTab(project);
        return;
      }
    }
    
    // 其他情况更新选择状态（比如概览）
    setSelected(selectedItem);
  }, [projects, openGroupTab, openProjectTab]);

  // 获取页面标题
  const getPageTitle = useCallback((): string => {
    switch (selected.type) {
      case 'project':
        const selectedProject = projects.find(p => p.id === selected.projectId);
        return selectedProject?.name || '项目';
      case 'group':
        return '组';
      default:
        return '概览';
    }
  }, [selected, projects]);

  // 渲染主要内容
  const renderMainContent = useCallback(() => {
    // 如果有标签页打开，不渲染主内容（由标签页内容代替）
    if (tabs.length > 0 && activeTab) {
      return null;
    }

    switch (selected.type) {
      case 'overview':
        return (
          <DashboardPage
            projects={projects}
            onProjectClick={(project) => {
              openProjectTab(project);
            }}
          />
        );
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">欢迎使用 PortFly</h2>
            <p className="text-muted-foreground mb-8">
              从侧边栏选择项目或组来开始使用标签页功能
            </p>
          </div>
        );
    }
  }, [tabs.length, activeTab, selected, projects, openProjectTab]);

  // 模拟获取组统计数据
  const getGroupStats = (groupId: number): GroupStats => {
    return {
      total_hosts: Math.floor(Math.random() * 20) + 1,
      total_ports: Math.floor(Math.random() * 50) + 1,
      connected_hosts: Math.floor(Math.random() * 10),
      active_tunnels: Math.floor(Math.random() * 5),
      last_used: new Date().toISOString()
    };
  };

  // 模拟获取项目统计数据
  const getProjectStats = (projectId: number): ProjectStats => {
    const project = projects.find(p => p.id === projectId);
    return {
      total_groups: project?.groups?.length || 0,
      total_hosts: Math.floor(Math.random() * 50) + 1,
      total_ports: Math.floor(Math.random() * 100) + 1,
      active_tunnels: Math.floor(Math.random() * 15),
      last_used: new Date().toISOString()
    };
  };

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
            title={getPageTitle()}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onTabClose={closeTab}
            getProjectById={getProjectById}
            getGroupById={getGroupById}
          >
            {/* 标签页内容 */}
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {tab.type === 'group' ? (
                  (() => {
                    const group = getGroupById(tab.groupId);
                    return group ? (
                      <GroupDetail 
                        group={group} 
                        stats={getGroupStats(tab.groupId)}
                      />
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        组数据未找到
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const project = getProjectById(tab.projectId);
                    return project ? (
                      <ProjectDetail 
                        project={project}
                        stats={getProjectStats(tab.projectId)}
                        onGroupClick={openGroupTab}
                        onAddGroup={() => console.log('添加组到项目', tab.projectId)}
                      />
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        项目数据未找到
                      </div>
                    );
                  })()
                )}
              </TabsContent>
            ))}
          </AppHeader>
          
          {/* 主内容区域 */}
          <div className="flex-1 overflow-hidden">
            {tabs.length === 0 ? (
              // 没有打开标签页时显示选中的内容
              <div className="h-full flex flex-col">
                {/* 测试按钮区域 */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground mr-4">测试项目标签页:</span>
                      {projects.slice(0, 3).map((project) => (
                        <Button
                          key={project.id}
                          variant="outline"
                          size="sm"
                          onClick={() => openProjectTab(project)}
                          className="flex items-center gap-2"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project.color }}
                          />
                          打开项目 {project.name}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground mr-4">测试组标签页:</span>
                      {mockGroups.slice(0, 3).map((group) => (
                        <Button
                          key={group.id}
                          variant="outline"
                          size="sm"
                          onClick={() => openGroupTab(group)}
                          className="flex items-center gap-2"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          />
                          打开组 {group.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-6">
                  {renderMainContent()}
                </div>
              </div>
            ) : (
              // 有标签页时内容由TabsContent管理
              <div className="h-full overflow-auto">
                {/* 标签页内容已经在AppHeader的children中渲染 */}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
