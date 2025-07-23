// Session Related Hooks
// 会话相关的 React Query hooks

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../client'
import { queryKeys } from './query-keys'
import { TunnelSession, CreateTunnelSessionData, SessionStats } from '~/shared/types/session'


/**
 * 获取隧道会话列表 Hook
 * 每5秒自动刷新会话状态
 */
export const useTunnelSessions = (options?: UseQueryOptions<TunnelSession[]>) => {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => apiClient.sessions.getTunnelSessions(),
    refetchInterval: 5000, // 每5秒刷新会话状态
    ...options,
  })
}

/**
 * 获取活动隧道会话列表 Hook
 * 每3秒自动刷新活动会话
 */
export const useActiveTunnelSessions = (options?: UseQueryOptions<TunnelSession[]>) => {
  return useQuery({
    queryKey: queryKeys.activeSessions,
    queryFn: () => apiClient.sessions.getActiveTunnelSessions(),
    refetchInterval: 3000, // 每3秒刷新活动会话
    ...options,
  })
}

/**
 * 获取单个隧道会话 Hook
 * 每5秒自动刷新会话状态
 */
export const useTunnelSession = (
  id: number,
  options?: UseQueryOptions<TunnelSession>
) => {
  return useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => apiClient.sessions.getTunnelSession(id),
    enabled: id > 0,
    refetchInterval: 5000, // 每5秒刷新会话状态
    ...options,
  })
}

/**
 * 创建隧道会话 Hook
 * 自动更新相关缓存
 */
export const useCreateTunnelSession = (
  options?: UseMutationOptions<TunnelSession, Error, CreateTunnelSessionData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTunnelSessionData) => apiClient.sessions.createTunnelSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

/**
 * 启动隧道 Hook
 * 自动更新会话状态缓存
 */
export const useStartTunnel = (
  options?: UseMutationOptions<TunnelSession, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.sessions.startTunnel(id),
    onSuccess: (session, id) => {
      queryClient.setQueryData(queryKeys.session(id), session)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

/**
 * 停止隧道 Hook
 * 自动更新会话状态缓存
 */
export const useStopTunnel = (
  options?: UseMutationOptions<TunnelSession, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.sessions.stopTunnel(id),
    onSuccess: (session, id) => {
      queryClient.setQueryData(queryKeys.session(id), session)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions })
    },
    ...options,
  })
}

/**
 * 获取会话统计数据 Hook
 * 每10秒自动刷新统计数据
 */
export const useSessionStats = (options?: UseQueryOptions<SessionStats>) => {
  return useQuery({
    queryKey: queryKeys.sessionStats,
    queryFn: () => apiClient.sessions.getSessionStats(),
    refetchInterval: 10000, // 每10秒刷新统计数据
    ...options,
  })
}
