import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Group, GroupStats } from '~/shared/types/group'
import { Project, ProjectStats } from '~/shared/types/project'

// 选中项类型
export interface SelectedItem {
  type: 'overview' | 'project' | 'group'
  projectId?: number
  groupId?: number
}

// 标签页类型（用于排序和持久化）
export interface TabItem {
  id: string
  title: string
  path: string
  type: 'overview' | 'project' | 'group' | 'terminal'
  color?: string
  closable?: boolean
  order: number
}

// 布局状态接口
interface LayoutState {
  // 选中状态
  selected: SelectedItem
  setSelected: (selected: SelectedItem) => void
  
  // 标签页管理
  tabs: TabItem[]
  activeTab: string | null
  addTab: (tab: Omit<TabItem, 'order'>) => void
  removeTab: (tabId: string) => void
  reorderTabs: (tabIds: string[]) => void
  setActiveTab: (tabId: string) => void
  
  // 数据查找助手
  projects: Project[]
  setProjects: (projects: Project[]) => void
  getProjectById: (id: number) => Project | undefined
  getGroupById: (id: number) => Group | undefined
  
  // 统计数据
  getGroupStats: (groupId: number) => GroupStats
  getProjectStats: (projectId: number) => ProjectStats
  
  // 清理和重置
  reset: () => void
}

// 生成统计数据的辅助函数
const generateGroupStats = (groupId: number): GroupStats => ({
  total_hosts: Math.floor(Math.random() * 20) + 1,
  total_ports: Math.floor(Math.random() * 50) + 1,
  connected_hosts: Math.floor(Math.random() * 10),
  active_tunnels: Math.floor(Math.random() * 5),
  last_used: new Date().toISOString()
})

const generateProjectStats = (projectId: number, projects: Project[]): ProjectStats => {
  const project = projects.find(p => p.id === projectId)
  return {
    total_groups: project?.groups?.length || 0,
    total_hosts: Math.floor(Math.random() * 50) + 1,
    total_ports: Math.floor(Math.random() * 100) + 1,
    active_tunnels: Math.floor(Math.random() * 15),
    last_used: new Date().toISOString()
  }
}

// 创建布局状态store
export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      selected: { type: 'overview' },
      projects: [],
      tabs: [],
      activeTab: null,

      // 选中状态管理
      setSelected: (selected) => {
        set({ selected }, false, 'setSelected')
      },

      // 项目数据管理
      setProjects: (projects) => {
        set({ projects }, false, 'setProjects')
      },

      // 标签页管理
      addTab: (tabData) => {
        const { tabs } = get()
        
        // 检查标签页是否已存在
        const existingTab = tabs.find(tab => tab.id === tabData.id)
        if (existingTab) {
          // 更新现有标签页信息
          const updatedTabs = tabs.map(tab => 
            tab.id === tabData.id ? { ...tab, ...tabData } : tab
          )
          set({ tabs: updatedTabs, activeTab: tabData.id }, false, 'updateTab')
          return
        }

        // 添加新标签页，order为当前最大order + 1
        const maxOrder = tabs.length > 0 ? Math.max(...tabs.map(t => t.order)) : -1
        const newTab: TabItem = {
          ...tabData,
          order: maxOrder + 1
        }

        set(
          { tabs: [...tabs, newTab], activeTab: newTab.id },
          false,
          'addTab'
        )
      },

      removeTab: (tabId) => {
        const { tabs, activeTab } = get()
        const newTabs = tabs.filter(tab => tab.id !== tabId)
        
        let newActiveTab = activeTab
        if (activeTab === tabId) {
          // 如果关闭的是当前活动标签页，切换到下一个或上一个
          const currentIndex = tabs.findIndex(tab => tab.id === tabId)
          if (newTabs.length > 0) {
            if (currentIndex > 0) {
              newActiveTab = newTabs[currentIndex - 1].id
            } else {
              newActiveTab = newTabs[0].id
            }
          } else {
            newActiveTab = null
          }
        }

        set(
          { tabs: newTabs, activeTab: newActiveTab },
          false,
          'removeTab'
        )
      },

      reorderTabs: (tabIds) => {
        const { tabs } = get()
        const reorderedTabs = tabIds.map((id, index) => {
          const tab = tabs.find(t => t.id === id)
          return tab ? { ...tab, order: index } : null
        }).filter(Boolean) as TabItem[]

        set({ tabs: reorderedTabs }, false, 'reorderTabs')
      },

      setActiveTab: (tabId) => {
        set({ activeTab: tabId }, false, 'setActiveTab')
      },

      // 数据查找助手
      getProjectById: (id: number) => {
        return get().projects.find(p => p.id === id)
      },

      getGroupById: (id: number) => {
        const { projects } = get()
        for (const project of projects) {
          if (project.groups) {
            const group = project.groups.find((g: any) => g.id === id)
            if (group) return group as Group
          }
        }
        return undefined
      },

      // 统计数据生成
      getGroupStats: (groupId: number) => {
        return generateGroupStats(groupId)
      },

      getProjectStats: (projectId: number) => {
        const { projects } = get()
        return generateProjectStats(projectId, projects)
      },

      // 清理和重置
      reset: () => {
        set({
          selected: { type: 'overview' },
          projects: [],
          tabs: [],
          activeTab: null
        }, false, 'reset')
      }
    }),
    {
      name: 'portfly-layout-store',
    }
  )
)
