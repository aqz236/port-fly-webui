import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Group } from '~/shared/types/group'
import { Host } from '~/shared/types/host'
import { PortForward } from '~/shared/types/port-forward'
import { Project } from '~/shared/types/project'

// 资源管理状态接口
interface ResourceState {
  // 当前项目数据
  currentProject: Project | null
  setCurrentProject: (project: Project) => void
  
  // Groups 管理
  groups: Group[]
  setGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  updateGroup: (groupId: number, updates: Partial<Group>) => void
  removeGroup: (groupId: number) => void
  getGroupById: (groupId: number) => Group | undefined
  
  // Hosts 管理
  hosts: Host[]
  setHosts: (hosts: Host[]) => void
  addHost: (host: Host) => void
  updateHost: (hostId: number, updates: Partial<Host>) => void
  removeHost: (hostId: number) => void
  getHostById: (hostId: number) => Host | undefined
  getHostsByGroup: (groupId: number) => Host[]
  
  // PortForwards 管理
  portForwards: PortForward[]
  setPortForwards: (portForwards: PortForward[]) => void
  addPortForward: (portForward: PortForward) => void
  updatePortForward: (portId: number, updates: Partial<PortForward>) => void
  removePortForward: (portId: number) => void
  getPortForwardById: (portId: number) => PortForward | undefined
  getPortForwardsByGroup: (groupId: number) => PortForward[]
  getPortForwardsByHost: (hostId: number) => PortForward[]
  
  // 刷新数据
  refreshProject: () => void
  
  // 重置状态
  reset: () => void
}

export const useResourceStore = create<ResourceState>()(
  devtools(
    (set, get) => ({
      // 当前项目
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      
      // Groups
      groups: [],
      setGroups: (groups) => set({ groups }),
      addGroup: (group) => set((state) => {
        const newGroups = [...state.groups, group]
        // 同时更新当前项目中的 groups
        const currentProject = state.currentProject
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            groups: newGroups
          }
          return {
            groups: newGroups,
            currentProject: updatedProject
          }
        }
        return { groups: newGroups }
      }),
      updateGroup: (groupId, updates) => set((state) => {
        const newGroups = state.groups.map(group => 
          group.id === groupId ? { ...group, ...updates } : group
        )
        // 同时更新当前项目中的 groups
        const currentProject = state.currentProject
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            groups: newGroups
          }
          return {
            groups: newGroups,
            currentProject: updatedProject
          }
        }
        return { groups: newGroups }
      }),
      removeGroup: (groupId) => set((state) => {
        const newGroups = state.groups.filter(group => group.id !== groupId)
        // 同时移除相关的 hosts 和 portForwards
        const newHosts = state.hosts.filter(host => host.group_id !== groupId)
        const newPortForwards = state.portForwards.filter(port => port.group_id !== groupId)
        
        // 同时更新当前项目中的 groups
        const currentProject = state.currentProject
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            groups: newGroups
          }
          return {
            groups: newGroups,
            hosts: newHosts,
            portForwards: newPortForwards,
            currentProject: updatedProject
          }
        }
        return { 
          groups: newGroups,
          hosts: newHosts,
          portForwards: newPortForwards
        }
      }),
      getGroupById: (groupId) => get().groups.find(group => group.id === groupId),
      
      // Hosts
      hosts: [],
      setHosts: (hosts) => set({ hosts }),
      addHost: (host) => set((state) => {
        const newHosts = [...state.hosts, host]
        // 更新对应组中的 hosts
        const newGroups = state.groups.map(group => {
          if (group.id === host.group_id) {
            return {
              ...group,
              hosts: [...(group.hosts || []), host]
            }
          }
          return group
        })
        return { hosts: newHosts, groups: newGroups }
      }),
      updateHost: (hostId, updates) => set((state) => {
        const newHosts = state.hosts.map(host => 
          host.id === hostId ? { ...host, ...updates } : host
        )
        // 更新对应组中的 hosts
        const newGroups = state.groups.map(group => ({
          ...group,
          hosts: group.hosts?.map(host => 
            host.id === hostId ? { ...host, ...updates } : host
          ) || []
        }))
        return { hosts: newHosts, groups: newGroups }
      }),
      removeHost: (hostId) => set((state) => {
        const newHosts = state.hosts.filter(host => host.id !== hostId)
        // 同时移除相关的 portForwards
        const newPortForwards = state.portForwards.filter(port => port.host_id !== hostId)
        // 更新对应组中的 hosts
        const newGroups = state.groups.map(group => ({
          ...group,
          hosts: group.hosts?.filter(host => host.id !== hostId) || []
        }))
        return { 
          hosts: newHosts, 
          portForwards: newPortForwards,
          groups: newGroups 
        }
      }),
      getHostById: (hostId) => get().hosts.find(host => host.id === hostId),
      getHostsByGroup: (groupId) => get().hosts.filter(host => host.group_id === groupId),
      
      // PortForwards
      portForwards: [],
      setPortForwards: (portForwards) => set({ portForwards }),
      addPortForward: (portForward) => set((state) => {
        const newPortForwards = [...state.portForwards, portForward]
        // 更新对应组中的 port_forwards
        const newGroups = state.groups.map(group => {
          if (group.id === portForward.group_id) {
            return {
              ...group,
              port_forwards: [...(group.port_forwards || []), portForward]
            }
          }
          return group
        })
        return { portForwards: newPortForwards, groups: newGroups }
      }),
      updatePortForward: (portId, updates) => set((state) => {
        const newPortForwards = state.portForwards.map(port => 
          port.id === portId ? { ...port, ...updates } : port
        )
        // 更新对应组中的 port_forwards
        const newGroups = state.groups.map(group => ({
          ...group,
          port_forwards: group.port_forwards?.map(port => 
            port.id === portId ? { ...port, ...updates } : port
          ) || []
        }))
        return { portForwards: newPortForwards, groups: newGroups }
      }),
      removePortForward: (portId) => set((state) => {
        const newPortForwards = state.portForwards.filter(port => port.id !== portId)
        // 更新对应组中的 port_forwards
        const newGroups = state.groups.map(group => ({
          ...group,
          port_forwards: group.port_forwards?.filter(port => port.id !== portId) || []
        }))
        return { portForwards: newPortForwards, groups: newGroups }
      }),
      getPortForwardById: (portId) => get().portForwards.find(port => port.id === portId),
      getPortForwardsByGroup: (groupId) => get().portForwards.filter(port => port.group_id === groupId),
      getPortForwardsByHost: (hostId) => get().portForwards.filter(port => port.host_id === hostId),
      
      // 刷新数据
      refreshProject: () => {
        // 这里可以添加重新获取数据的逻辑
        console.log('Refreshing project data...')
      },
      
      // 重置状态
      reset: () => set({
        currentProject: null,
        groups: [],
        hosts: [],
        portForwards: []
      })
    }),
    { name: 'resource-store' }
  )
)
