// Group Related Hooks
// 画布相关的 React Query hooks

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../client'
import { queryKeys } from './query-keys'
import { CreateGroupData, Group, UpdateGroupData } from '~/shared/types/group'


/**
 * 获取画布列表 Hook
 * 可按项目ID过滤
 */
export const useGroups = (
  projectId?: number,
  options?: UseQueryOptions<Group[]>
) => {
  return useQuery({
    queryKey: projectId ? queryKeys.groupsByProject(projectId) : queryKeys.groups,
    queryFn: () => apiClient.groups.getGroups(projectId),
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
    ...options,
  })
}

/**
 * 获取单个画布 Hook
 */
export const useGroup = (
  id: number,
  options?: UseQueryOptions<Group>
) => {
  return useQuery({
    queryKey: queryKeys.group(id),
    queryFn: () => apiClient.groups.getGroup(id),
    enabled: id > 0,
    ...options,
  })
}

/**
 * 创建画布 Hook
 * 自动更新相关缓存
 */
export const useCreateGroup = (
  options?: UseMutationOptions<Group, Error, CreateGroupData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateGroupData) => apiClient.groups.createGroup(data),
    onSuccess: (newGroup) => {
      // 使画布列表缓存失效
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

/**
 * 更新画布 Hook
 * 自动更新相关缓存
 */
export const useUpdateGroup = (
  options?: UseMutationOptions<Group, Error, { id: number; data: UpdateGroupData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.groups.updateGroup(id, data),
    onSuccess: (updatedGroup, { id }) => {
      // 更新画布缓存
      queryClient.setQueryData(queryKeys.group(id), updatedGroup)
      
      // 使画布列表缓存失效
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

/**
 * 删除画布 Hook
 * 自动清理相关缓存
 */
export const useDeleteGroup = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.groups.deleteGroup(id),
    onSuccess: (_, id) => {
      // 移除画布缓存
      queryClient.removeQueries({ queryKey: queryKeys.group(id) })
      queryClient.removeQueries({ queryKey: queryKeys.groupStats(id) })
      
      // 使画布列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    },
    ...options,
  })
}
