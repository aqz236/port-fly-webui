import { useState, useCallback, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "~/shared/components/ui/sidebar";
import { AppSidebar } from "~/components/layout";
import { AppHeader } from "~/components/layout/AppHeader";
import { Dashboard } from "~/components/Dashboard";
import { GroupDetail } from "~/features/groups/components/GroupDetail";
import { ProjectDetail } from "~/features/projects/components/ProjectDetail";
import { OverviewView, ProjectView } from "~/components/views";
import { TabsContent } from "~/shared/components/ui/tabs";
import { Button } from "~/shared/components/ui/button";
import type { Group, GroupStats, ProjectStats } from "~/shared/types/api";
import { mockGroups } from "~/lib/mock-data";
import type { SelectedItem } from "~/components/layout";
import type { CreateProjectData, MoveProjectParams, Project } from "~/shared/types/api";
import type { EditProjectData } from "~/features/projects/components/dialogs/edit-project-dialog";
import { 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject, 
  useMoveProject 
} from "~/shared/api/hooks";

// 标签页相关类型
interface GroupTab {
  id: string;
  groupId: number;
  title: string;
  type: 'group';
}

interface ProjectTab {
  id: string;
  projectId: number;
  title: string;
  type: 'project';
}

type Tab = GroupTab | ProjectTab;

interface MainLayoutProps {
  projects: Project[];
  onProjectsUpdate: () => void;
}

export function MainLayout({ projects, onProjectsUpdate }: MainLayoutProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selected, setSelected] = useState<SelectedItem>({ type: 'overview' });

  // 使用 mutation hooks
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const moveProjectMutation = useMoveProject();

  // 根据ID获取项目数据
  const getProjectById = useCallback((projectId: number): Project | null => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects]);

  // 根据ID获取组数据  
  const getGroupById = useCallback((groupId: number): Group | null => {
    // 先从项目中查找
    for (const project of projects) {
      if (project.groups) {
        const group = project.groups.find((g: any) => g.id === groupId);
        if (group) return group as Group;
      }
    }
    // 如果找不到，从模拟数据中查找
    return mockGroups.find(g => g.id === groupId) || null;
  }, [projects]);

  // 监听项目数据变化，更新标签页标题
  useEffect(() => {
    setTabs(currentTabs => 
      currentTabs.map(tab => {
        if (tab.type === 'project') {
          const project = getProjectById(tab.projectId);
          if (project && project.name !== tab.title) {
            return { ...tab, title: project.name };
          }
        } else if (tab.type === 'group') {
          const group = getGroupById(tab.groupId);
          if (group && group.name !== tab.title) {
            return { ...tab, title: group.name };
          }
        }
        return tab;
      })
    );
  }, [projects, getProjectById, getGroupById]);

  // 打开新的Group标签页
  const openGroupTab = useCallback((group: Group) => {
    const tabId = `group-${group.id}`;
    
    // 检查是否已经打开了这个组
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (existingTab) {
      setActiveTab(tabId);
      return;
    }

    // 创建新标签页
    const newTab: GroupTab = {
      id: tabId,
      groupId: group.id,
      title: group.name,
      type: 'group'
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabId);
  }, [tabs]);

  // 打开新的Project标签页
  const openProjectTab = useCallback((project: Project) => {
    const tabId = `project-${project.id}`;
    
    // 检查是否已经打开了这个项目
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (existingTab) {
      setActiveTab(tabId);
      return;
    }

    // 创建新标签页
    const newTab: ProjectTab = {
      id: tabId,
      projectId: project.id,
      title: project.name,
      type: 'project'
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabId);
  }, [tabs]);

  // 关闭标签页
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // 如果关闭的是当前活跃标签页，切换到其他标签页
      if (activeTab === tabId) {
        if (newTabs.length > 0) {
          setActiveTab(newTabs[newTabs.length - 1].id);
        } else {
          setActiveTab("");
        }
      }
      
      return newTabs;
    });
  }, [activeTab]);

  // 切换标签页
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

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

  // 创建项目处理函数
  const handleCreateProject = useCallback(async (data: CreateProjectData) => {
    try {
      await createProjectMutation.mutateAsync(data);
      onProjectsUpdate();
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  }, [createProjectMutation, onProjectsUpdate]);

  // 编辑项目处理函数
  const handleEditProject = useCallback(async (projectId: number, data: EditProjectData) => {
    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data });
      onProjectsUpdate();
    } catch (error) {
      console.error('编辑项目失败:', error);
    }
  }, [updateProjectMutation, onProjectsUpdate]);

  // 删除项目处理函数
  const handleDeleteProject = useCallback(async (projectId: number) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      onProjectsUpdate();
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  }, [deleteProjectMutation, onProjectsUpdate]);

  // 移动项目处理函数
  const handleMoveProject = useCallback(async (params: MoveProjectParams) => {
    try {
      await moveProjectMutation.mutateAsync(params);
      onProjectsUpdate();
    } catch (error) {
      console.error('移动项目失败:', error);
    }
  }, [moveProjectMutation, onProjectsUpdate]);

  // 获取选中的项目
  const getSelectedProject = useCallback((): Project | null => {
    if (selected.projectId) {
      return projects.find(p => p.id === selected.projectId) || null;
    }
    return null;
  }, [projects, selected.projectId]);

  // 获取页面标题
  const getPageTitle = useCallback((): string => {
    switch (selected.type) {
      case 'project':
        return getSelectedProject()?.name || '项目';
      case 'group':
        // 如果是组但在标签页中，标题由标签页管理
        return '组';
      default:
        return '概览';
    }
  }, [selected.type, getSelectedProject]);

  // 渲染主要内容
  const renderMainContent = useCallback(() => {
    // 如果有标签页打开，不渲染主内容（由标签页内容代替）
    if (tabs.length > 0 && activeTab) {
      return null;
    }

    switch (selected.type) {
      case 'overview':
        return (
          <OverviewView
            projects={projects}
            onProjectSelect={(projectId) => {
              const project = projects.find(p => p.id === projectId);
              if (project) {
                openProjectTab(project);
              }
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
