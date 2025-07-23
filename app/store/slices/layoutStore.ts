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

// 布局状态接口
interface LayoutState {
  // 选中状态
  selected: SelectedItem
  setSelected: (selected: SelectedItem) => void
  
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
          projects: []
        }, false, 'reset')
      }
    }),
    {
      name: 'portfly-layout-store',
    }
  )
)
