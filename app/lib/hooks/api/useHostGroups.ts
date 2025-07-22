import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '~/lib/api/client'
import { notify } from '~/lib/store/useUIStore'
import type {
  HostGroup,
  CreateHostGroupData,
  UpdateHostGroupData,
  HostGroupStats
} from '~/types/api'

// Query Keys
export const hostGroupKeys = {
  all: ['hostGroups'] as const,
  lists: () => [...hostGroupKeys.all, 'list'] as const,
  list: (filters: string) => [...hostGroupKeys.lists(), { filters }] as const,
  details: () => [...hostGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...hostGroupKeys.details(), id] as const,
  stats: (id: number) => [...hostGroupKeys.detail(id), 'stats'] as const,
}

// 获取所有主机分组
export function useHostGroups() {
  return useQuery({
    queryKey: hostGroupKeys.lists(),
    queryFn: () => apiClient.getHostGroups(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  })
}

// 获取单个主机分组
export function useHostGroup(id: number, enabled = true) {
  return useQuery({
    queryKey: hostGroupKeys.detail(id),
    queryFn: () => apiClient.getHostGroup(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// 获取主机分组统计
export function useHostGroupStats(id: number, enabled = true) {
  return useQuery({
    queryKey: hostGroupKeys.stats(id),
    queryFn: () => apiClient.getHostGroupStats(id),
    enabled: enabled && id > 0,
    staleTime: 30 * 1000, // 30秒缓存（统计数据更新频繁）
    refetchInterval: 60 * 1000, // 每分钟自动刷新
  })
}

// 创建主机分组
export function useCreateHostGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateHostGroupData) => apiClient.createHostGroup(data),
    onSuccess: (newGroup) => {
      // 更新列表缓存
      queryClient.setQueryData<HostGroup[]>(
        hostGroupKeys.lists(),
        (old = []) => [...old, newGroup]
      )
      
      // 显示成功通知
      notify.success('创建成功', `主机分组 "${newGroup.name}" 已创建`)
    },
    onError: (error) => {
      console.error('创建主机分组失败:', error)
      notify.error('创建失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 更新主机分组
export function useUpdateHostGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHostGroupData }) =>
      apiClient.updateHostGroup(id, data),
    onSuccess: (updatedGroup) => {
      // 更新列表缓存
      queryClient.setQueryData<HostGroup[]>(
        hostGroupKeys.lists(),
        (old = []) => 
          old.map(group => 
            group.id === updatedGroup.id ? updatedGroup : group
          )
      )
      
      // 更新详情缓存
      queryClient.setQueryData(
        hostGroupKeys.detail(updatedGroup.id),
        updatedGroup
      )
      
      // 显示成功通知
      notify.success('更新成功', `主机分组 "${updatedGroup.name}" 已更新`)
    },
    onError: (error) => {
      console.error('更新主机分组失败:', error)
      notify.error('更新失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 删除主机分组
export function useDeleteHostGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteHostGroup(id),
    onSuccess: (_, deletedId) => {
      // 从列表缓存中移除
      queryClient.setQueryData<HostGroup[]>(
        hostGroupKeys.lists(),
        (old = []) => old.filter(group => group.id !== deletedId)
      )
      
      // 移除相关缓存
      queryClient.removeQueries({ queryKey: hostGroupKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: hostGroupKeys.stats(deletedId) })
      
      // 显示成功通知
      notify.success('删除成功', '主机分组已删除')
    },
    onError: (error) => {
      console.error('删除主机分组失败:', error)
      notify.error('删除失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 批量操作hooks
export function useHostGroupActions() {
  const createMutation = useCreateHostGroup()
  const updateMutation = useUpdateHostGroup()
  const deleteMutation = useDeleteHostGroup()

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
