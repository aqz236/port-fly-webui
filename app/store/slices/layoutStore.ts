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

// 标签页类型
export interface Tab {
  id: string
  type: 'project' | 'group' | 'terminal'
  projectId: number
  groupId?: number
  hostId?: number
  title: string
  color?: string
}

// 布局状态接口
interface LayoutState {
  // 选中状态
  selected: SelectedItem
  setSelected: (selected: SelectedItem) => void

  // 标签页管理
  tabs: Tab[]
  activeTab: string | null
  openProjectTab: (project: Project) => void
  openGroupTab: (group: Group) => void
  openTerminalTab: (host: any, projectId: number) => void
  closeTab: (tabId: string) => void
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
  clearTabs: () => void
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
      tabs: [],
      activeTab: null,
      projects: [],

      // 选中状态管理
      setSelected: (selected) => {
        set({ selected }, false, 'setSelected')
      },

      // 项目数据管理
      setProjects: (projects) => {
        set({ projects }, false, 'setProjects')
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

      // 标签页管理
      openProjectTab: (project) => {
        const { tabs, setActiveTab } = get()
        const tabId = `project-${project.id}`
        
        // 检查标签页是否已存在
        const existingTab = tabs.find(tab => tab.id === tabId)
        if (existingTab) {
          setActiveTab(tabId)
          return
        }

        // 创建新标签页
        const newTab: Tab = {
          id: tabId,
          type: 'project',
          projectId: project.id,
          title: project.name,
          color: project.color
        }

        set(
          state => ({
            tabs: [...state.tabs, newTab],
            activeTab: tabId
          }),
          false,
          'openProjectTab'
        )
      },

      openGroupTab: (group) => {
        const { tabs, setActiveTab } = get()
        const tabId = `group-${group.id}`
        
        // 检查标签页是否已存在
        const existingTab = tabs.find(tab => tab.id === tabId)
        if (existingTab) {
          setActiveTab(tabId)
          return
        }

        // 创建新标签页
        const newTab: Tab = {
          id: tabId,
          type: 'group',
          projectId: group.project_id,
          groupId: group.id,
          title: group.name,
          color: group.color
        }

        set(
          state => ({
            tabs: [...state.tabs, newTab],
            activeTab: tabId
          }),
          false,
          'openGroupTab'
        )
      },

      openTerminalTab: (host, projectId) => {
        const { tabs, setActiveTab } = get()
        const tabId = `terminal-${host.id}`
        
        // 检查标签页是否已存在
        const existingTab = tabs.find(tab => tab.id === tabId)
        if (existingTab) {
          setActiveTab(tabId)
          return
        }

        // 创建新标签页
        const newTab: Tab = {
          id: tabId,
          type: 'terminal',
          projectId: projectId,
          hostId: host.id,
          title: `终端 - ${host.name}`,
          color: '#10b981' // 绿色表示终端
        }

        set(
          state => ({
            tabs: [...state.tabs, newTab],
            activeTab: tabId
          }),
          false,
          'openTerminalTab'
        )
      },

      closeTab: (tabId) => {
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
          'closeTab'
        )
      },

      setActiveTab: (tabId) => {
        set({ activeTab: tabId }, false, 'setActiveTab')
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
      clearTabs: () => {
        set({ tabs: [], activeTab: null }, false, 'clearTabs')
      },

      reset: () => {
        set({
          selected: { type: 'overview' },
          tabs: [],
          activeTab: null,
          projects: []
        }, false, 'reset')
      }
    }),
    {
      name: 'portfly-layout-store',
    }
  )
)
