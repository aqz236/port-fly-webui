// Port Forward Related Hooks
// 端口转发相关的 React Query hooks

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../client'
import { queryKeys } from './query-keys'
import { CreatePortForwardData, PortForward, UpdatePortForwardData } from '~/shared/types/port-forward'


/**
 * 获取端口转发列表 Hook
 * 可按组ID过滤
 */
export const usePortForwards = (
  groupId?: number,
  options?: UseQueryOptions<PortForward[]>
) => {
  return useQuery({
    queryKey: groupId ? queryKeys.portForwardsByGroup(groupId) : queryKeys.portForwards,
    queryFn: () => apiClient.portForwards.getPortForwards(groupId),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

/**
 * 获取单个端口转发 Hook
 */
export const usePortForward = (
  id: number,
  options?: UseQueryOptions<PortForward>
) => {
  return useQuery({
    queryKey: queryKeys.portForward(id),
    queryFn: () => apiClient.portForwards.getPortForward(id),
    enabled: id > 0,
    ...options,
  })
}

/**
 * 创建端口转发 Hook
 * 自动更新相关缓存
 */
export const useCreatePortForward = (
  options?: UseMutationOptions<PortForward, Error, CreatePortForwardData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePortForwardData) => apiClient.portForwards.createPortForward(data),
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

/**
 * 更新端口转发 Hook
 * 自动更新相关缓存
 */
export const useUpdatePortForward = (
  options?: UseMutationOptions<PortForward, Error, { id: number; data: UpdatePortForwardData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.portForwards.updatePortForward(id, data),
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

/**
 * 删除端口转发 Hook
 * 自动清理相关缓存
 */
export const useDeletePortForward = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.portForwards.deletePortForward(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.portForward(id) })
      queryClient.removeQueries({ queryKey: queryKeys.portForwardStats(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.portForwards })
    },
    ...options,
  })
}
