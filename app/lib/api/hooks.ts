// PortFly API Hooks with Tanstack Query
// 使用 Tanstack Query 优化的 API 请求钩子

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey
} from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  MoveProjectParams,
  Group,
  CreateGroupData,
  UpdateGroupData,
  Host,
  CreateHostData,
  UpdateHostData,
  PortForward,
  CreatePortForwardData,
  UpdatePortForwardData,
  TunnelSession,
  CreateTunnelSessionData,
  UpdateTunnelSessionData,
  HealthStatus,
  SystemStats,
  ProjectStats,
  GroupStats,
  HostStats,
  PortForwardStats,
  SessionStats
} from '../../types/api'

// ===== Query Keys =====
export const queryKeys = {
  // 健康检查
  health: ['health'] as const,
  systemStats: ['system', 'stats'] as const,
  
  // 项目相关
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  projectStats: (id: number) => ['projects', id, 'stats'] as const,
  projectChildren: (id: number) => ['projects', id, 'children'] as const,
  projectTree: () => ['projects', 'tree'] as const,
  
  // 组相关
  groups: ['groups'] as const,
  groupsByProject: (projectId: number) => ['groups', 'project', projectId] as const,
  group: (id: number) => ['groups', id] as const,
  groupStats: (id: number) => ['groups', id, 'stats'] as const,
  
  // 主机相关
  hosts: ['hosts'] as const,
  hostsByGroup: (groupId: number) => ['hosts', 'group', groupId] as const,
  host: (id: number) => ['hosts', id] as const,
  hostStats: (id: number) => ['hosts', id, 'stats'] as const,
  
  // 端口转发相关
  portForwards: ['port-forwards'] as const,
  portForwardsByGroup: (groupId: number) => ['port-forwards', 'group', groupId] as const,
  portForward: (id: number) => ['port-forwards', id] as const,
  portForwardStats: (id: number) => ['port-forwards', id, 'stats'] as const,
  
  // 会话相关
  sessions: ['sessions'] as const,
  activeSessions: ['sessions', 'active'] as const,
  session: (id: number) => ['sessions', id] as const,
  sessionStats: ['sessions', 'stats'] as const,
}

// ===== 健康检查 Hooks =====

export const useHealth = (options?: UseQueryOptions<HealthStatus>) => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.health(),
    refetchInterval: 30000, // 每30秒检查一次健康状态
    ...options,
  })
}

export const useSystemStats = (options?: UseQueryOptions<SystemStats>) => {
  return useQuery({
    queryKey: queryKeys.systemStats,
    queryFn: () => apiClient.getSystemStats(),
    refetchInterval: 10000, // 每10秒刷新系统状态
    ...options,
  })
}

// ===== 项目 Hooks =====

export const useProjects = (
  params?: {
    parent_id?: number;
    include_children?: boolean;
    as_tree?: boolean;
  },
  options?: UseQueryOptions<Project[]>
) => {
  return useQuery({
    queryKey: params?.as_tree ? queryKeys.projectTree() : queryKeys.projects,
    queryFn: () => apiClient.getProjects(params) as Promise<Project[]>,
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    ...options,
  })
}

export const useProject = (
  id: number,
  options?: UseQueryOptions<Project>
) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiClient.getProject(id),
    enabled: id > 0,
    ...options,
  })
}

export const useProjectStats = (
  id: number,
  options?: UseQueryOptions<ProjectStats>
) => {
  return useQuery({
    queryKey: queryKeys.projectStats(id),
    queryFn: () => apiClient.getProjectStats(id),
    enabled: id > 0,
    refetchInterval: 30000, // 每30秒刷新统计数据
    ...options,
  })
}

export const useCreateProject = (
  options?: UseMutationOptions<Project, Error, CreateProjectData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.createProject(data),
    onSuccess: (newProject) => {
      // 使项目列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTree() })
      
      // 如果有父项目，也要使父项目的子项目缓存失效
      if (newProject.parent_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projectChildren(newProject.parent_id) 
        })
      }
    },
    ...options,
  })
}

export const useUpdateProject = (
  options?: UseMutationOptions<Project, Error, { id: number; data: UpdateProjectData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateProject(id, data),
    onSuccess: (updatedProject, { id }) => {
      // 更新项目缓存
      queryClient.setQueryData(queryKeys.project(id), updatedProject)
      
      // 使项目列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTree() })
    },
    ...options,
  })
}

export const useDeleteProject = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteProject(id),
    onSuccess: (_, id) => {
      // 移除项目缓存
      queryClient.removeQueries({ queryKey: queryKeys.project(id) })
      queryClient.removeQueries({ queryKey: queryKeys.projectStats(id) })
      queryClient.removeQueries({ queryKey: queryKeys.projectChildren(id) })
      
      // 使项目列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTree() })
    },
    ...options,
  })
}

export const useMoveProject = (
  options?: UseMutationOptions<void, Error, MoveProjectParams>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: MoveProjectParams) => apiClient.moveProject(params),
    onSuccess: () => {
      // 移动项目后，使所有项目相关缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTree() })
    },
    ...options,
  })
}

// ===== 组 Hooks =====

export const useGroups = (
  projectId?: number,
  options?: UseQueryOptions<Group[]>
) => {
  return useQuery({
    queryKey: projectId ? queryKeys.groupsByProject(projectId) : queryKeys.groups,
    queryFn: () => apiClient.getGroups(projectId),
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
    ...options,
  })
}

export const useGroup = (
  id: number,
  options?: UseQueryOptions<Group>
) => {
  return useQuery({
    queryKey: queryKeys.group(id),
    queryFn: () => apiClient.getGroup(id),
    enabled: id > 0,
    ...options,
  })
}

export const useCreateGroup = (
  options?: UseMutationOptions<Group, Error, CreateGroupData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateGroupData) => apiClient.createGroup(data),
    onSuccess: (newGroup) => {
      // 使组列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.groups })
      if (newGroup.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.groupsByProject(newGroup.project_id) 
        })
      }
    },
    ...options,
  })
}

export const useUpdateGroup = (
  options?: UseMutationOptions<Group, Error, { id: number; data: UpdateGroupData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateGroup(id, data),
    onSuccess: (updatedGroup, { id }) => {
      // 更新组缓存
      queryClient.setQueryData(queryKeys.group(id), updatedGroup)
      
      // 使组列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.groups })
      if (updatedGroup.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.groupsByProject(updatedGroup.project_id) 
        })
      }
    },
    ...options,
  })
}

export const useDeleteGroup = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteGroup(id),
    onSuccess: (_, id) => {
      // 移除组缓存
      queryClient.removeQueries({ queryKey: queryKeys.group(id) })
      queryClient.removeQueries({ queryKey: queryKeys.groupStats(id) })
      
      // 使组列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    },
    ...options,
  })
}

// ===== 主机 Hooks =====

export const useHosts = (
  groupId?: number,
  options?: UseQueryOptions<Host[]>
) => {
  return useQuery({
    queryKey: groupId ? queryKeys.hostsByGroup(groupId) : queryKeys.hosts,
    queryFn: () => apiClient.getHosts(groupId),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useHost = (
  id: number,
  options?: UseQueryOptions<Host>
) => {
  return useQuery({
    queryKey: queryKeys.host(id),
    queryFn: () => apiClient.getHost(id),
    enabled: id > 0,
    ...options,
  })
}

export const useCreateHost = (
  options?: UseMutationOptions<Host, Error, CreateHostData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateHostData) => apiClient.createHost(data),
    onSuccess: (newHost) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hosts })
      if (newHost.group_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.hostsByGroup(newHost.group_id) 
        })
      }
    },
    ...options,
  })
}

export const useUpdateHost = (
  options?: UseMutationOptions<Host, Error, { id: number; data: UpdateHostData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateHost(id, data),
    onSuccess: (updatedHost, { id }) => {
      queryClient.setQueryData(queryKeys.host(id), updatedHost)
      queryClient.invalidateQueries({ queryKey: queryKeys.hosts })
      if (updatedHost.group_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.hostsByGroup(updatedHost.group_id) 
        })
      }
    },
    ...options,
  })
}

export const useDeleteHost = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteHost(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.host(id) })
      queryClient.removeQueries({ queryKey: queryKeys.hostStats(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hosts })
    },
    ...options,
  })
}

export const useTestHostConnection = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  return useMutation({
    mutationFn: (id: number) => apiClient.testHostConnection(id),
    ...options,
  })
}

// ===== 端口转发 Hooks =====

export const usePortForwards = (
  groupId?: number,
  options?: UseQueryOptions<PortForward[]>
) => {
  return useQuery({
    queryKey: groupId ? queryKeys.portForwardsByGroup(groupId) : queryKeys.portForwards,
    queryFn: () => apiClient.getPortForwards(groupId),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const usePortForward = (
  id: number,
  options?: UseQueryOptions<PortForward>
) => {
  return useQuery({
    queryKey: queryKeys.portForward(id),
    queryFn: () => apiClient.getPortForward(id),
    enabled: id > 0,
    ...options,
  })
}

export const useCreatePortForward = (
  options?: UseMutationOptions<PortForward, Error, CreatePortForwardData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePortForwardData) => apiClient.createPortForward(data),
    onSuccess: (newPortForward) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portForwards })
      if (newPortForward.group_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.portForwardsByGroup(newPortForward.group_id) 
        })
      }
    },
    ...options,
  })
}

export const useUpdatePortForward = (
  options?: UseMutationOptions<PortForward, Error, { id: number; data: UpdatePortForwardData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updatePortForward(id, data),
    onSuccess: (updatedPortForward, { id }) => {
      queryClient.setQueryData(queryKeys.portForward(id), updatedPortForward)
      queryClient.invalidateQueries({ queryKey: queryKeys.portForwards })
      if (updatedPortForward.group_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.portForwardsByGroup(updatedPortForward.group_id) 
        })
      }
    },
    ...options,
  })
}

export const useDeletePortForward = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deletePortForward(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.portForward(id) })
      queryClient.removeQueries({ queryKey: queryKeys.portForwardStats(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.portForwards })
    },
    ...options,
  })
}

// ===== 会话 Hooks =====

export const useTunnelSessions = (options?: UseQueryOptions<TunnelSession[]>) => {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => apiClient.getTunnelSessions(),
    refetchInterval: 5000, // 每5秒刷新会话状态
    ...options,
  })
}

export const useActiveTunnelSessions = (options?: UseQueryOptions<TunnelSession[]>) => {
  return useQuery({
    queryKey: queryKeys.activeSessions,
    queryFn: () => apiClient.getActiveTunnelSessions(),
    refetchInterval: 3000, // 每3秒刷新活动会话
    ...options,
  })
}

export const useTunnelSession = (
  id: number,
  options?: UseQueryOptions<TunnelSession>
) => {
  return useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => apiClient.getTunnelSession(id),
    enabled: id > 0,
    refetchInterval: 5000, // 每5秒刷新会话状态
    ...options,
  })
}

export const useCreateTunnelSession = (
  options?: UseMutationOptions<TunnelSession, Error, CreateTunnelSessionData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTunnelSessionData) => apiClient.createTunnelSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

export const useStartTunnel = (
  options?: UseMutationOptions<TunnelSession, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.startTunnel(id),
    onSuccess: (session, id) => {
      queryClient.setQueryData(queryKeys.session(id), session)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

export const useStopTunnel = (
  options?: UseMutationOptions<TunnelSession, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.stopTunnel(id),
    onSuccess: (session, id) => {
      queryClient.setQueryData(queryKeys.session(id), session)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

export const useSessionStats = (options?: UseQueryOptions<SessionStats>) => {
  return useQuery({
    queryKey: queryKeys.sessionStats,
    queryFn: () => apiClient.getSessionStats(),
    refetchInterval: 10000, // 每10秒刷新统计数据
    ...options,
  })
}
