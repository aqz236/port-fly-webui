import { useState, useCallback, useEffect } from "react";
import type { Project, Group } from "~/shared/types/api";
import { mockGroups } from "~/shared/utils/mock-data";

// 标签页相关类型
export interface GroupTab {
  id: string;
  groupId: number;
  title: string;
  type: 'group';
}

export interface ProjectTab {
  id: string;
  projectId: number;
  title: string;
  type: 'project';
}

export type Tab = GroupTab | ProjectTab;

interface UseTabManagerProps {
  projects: Project[];
}

export function useTabManager({ projects }: UseTabManagerProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

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

  return {
    tabs,
    activeTab,
    getProjectById,
    getGroupById,
    openGroupTab,
    openProjectTab,
    closeTab,
    handleTabChange
  };
}
