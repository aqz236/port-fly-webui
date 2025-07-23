// Host Related Hooks
// 主机相关的 React Query hooks

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../client'
import { queryKeys } from './query-keys'
import type {
  Host,
  CreateHostData,
  UpdateHostData
} from '../../types/api'

/**
 * 获取主机列表 Hook
 * 可按组ID过滤
 */
export const useHosts = (
  groupId?: number,
  options?: UseQueryOptions<Host[]>
) => {
  return useQuery({
    queryKey: groupId ? queryKeys.hostsByGroup(groupId) : queryKeys.hosts,
    queryFn: () => apiClient.hosts.getHosts(groupId),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

/**
 * 获取单个主机 Hook
 */
export const useHost = (
  id: number,
  options?: UseQueryOptions<Host>
) => {
  return useQuery({
    queryKey: queryKeys.host(id),
    queryFn: () => apiClient.hosts.getHost(id),
    enabled: id > 0,
    ...options,
  })
}

/**
 * 创建主机 Hook
 * 自动更新相关缓存
 */
export const useCreateHost = (
  options?: UseMutationOptions<Host, Error, CreateHostData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateHostData) => apiClient.hosts.createHost(data),
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

/**
 * 更新主机 Hook
 * 自动更新相关缓存
 */
export const useUpdateHost = (
  options?: UseMutationOptions<Host, Error, { id: number; data: UpdateHostData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.hosts.updateHost(id, data),
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

/**
 * 删除主机 Hook
 * 自动清理相关缓存
 */
export const useDeleteHost = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.hosts.deleteHost(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.host(id) })
      queryClient.removeQueries({ queryKey: queryKeys.hostStats(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hosts })
    },
    ...options,
  })
}

/**
 * 测试主机连接 Hook
 * 用于验证主机连接状态
 */
export const useTestHostConnection = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  return useMutation({
    mutationFn: (id: number) => apiClient.hosts.testHostConnection(id),
    ...options,
  })
}
