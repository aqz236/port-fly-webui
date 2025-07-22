import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '~/lib/api/client'
import { notify } from '~/lib/store/useUIStore'
import type {
  PortGroup,
  CreatePortGroupData,
  UpdatePortGroupData,
  PortGroupStats
} from '~/types/api'

// Query Keys
export const portGroupKeys = {
  all: ['portGroups'] as const,
  lists: () => [...portGroupKeys.all, 'list'] as const,
  list: (filters: string) => [...portGroupKeys.lists(), { filters }] as const,
  details: () => [...portGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...portGroupKeys.details(), id] as const,
  stats: (id: number) => [...portGroupKeys.detail(id), 'stats'] as const,
}

// 获取所有端口分组
export function usePortGroups() {
  return useQuery({
    queryKey: portGroupKeys.lists(),
    queryFn: () => apiClient.getPortGroups(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  })
}

// 获取单个端口分组
export function usePortGroup(id: number, enabled = true) {
  return useQuery({
    queryKey: portGroupKeys.detail(id),
    queryFn: () => apiClient.getPortGroup(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// 获取端口分组统计
export function usePortGroupStats(id: number, enabled = true) {
  return useQuery({
    queryKey: portGroupKeys.stats(id),
    queryFn: () => apiClient.getPortGroupStats(id),
    enabled: enabled && id > 0,
    staleTime: 30 * 1000, // 30秒缓存
    refetchInterval: 60 * 1000, // 每分钟自动刷新
  })
}

// 创建端口分组
export function useCreatePortGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePortGroupData) => apiClient.createPortGroup(data),
    onSuccess: (newGroup) => {
      // 更新列表缓存
      queryClient.setQueryData<PortGroup[]>(
        portGroupKeys.lists(),
        (old = []) => [...old, newGroup]
      )
      
      // 显示成功通知
      notify.success('创建成功', `端口分组 "${newGroup.name}" 已创建`)
    },
    onError: (error) => {
      console.error('创建端口分组失败:', error)
      notify.error('创建失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 更新端口分组
export function useUpdatePortGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortGroupData }) =>
      apiClient.updatePortGroup(id, data),
    onSuccess: (updatedGroup) => {
      // 更新列表缓存
      queryClient.setQueryData<PortGroup[]>(
        portGroupKeys.lists(),
        (old = []) => 
          old.map(group => 
            group.id === updatedGroup.id ? updatedGroup : group
          )
      )
      
      // 更新详情缓存
      queryClient.setQueryData(
        portGroupKeys.detail(updatedGroup.id),
        updatedGroup
      )
      
      // 显示成功通知
      notify.success('更新成功', `端口分组 "${updatedGroup.name}" 已更新`)
    },
    onError: (error) => {
      console.error('更新端口分组失败:', error)
      notify.error('更新失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 删除端口分组
export function useDeletePortGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiClient.deletePortGroup(id),
    onSuccess: (_, deletedId) => {
      // 从列表缓存中移除
      queryClient.setQueryData<PortGroup[]>(
        portGroupKeys.lists(),
        (old = []) => old.filter(group => group.id !== deletedId)
      )
      
      // 移除相关缓存
      queryClient.removeQueries({ queryKey: portGroupKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: portGroupKeys.stats(deletedId) })
      
      // 显示成功通知
      notify.success('删除成功', '端口分组已删除')
    },
    onError: (error) => {
      console.error('删除端口分组失败:', error)
      notify.error('删除失败', error instanceof Error ? error.message : '未知错误')
    },
  })
}

// 批量操作hooks
export function usePortGroupActions() {
  const createMutation = useCreatePortGroup()
  const updateMutation = useUpdatePortGroup()
  const deleteMutation = useDeletePortGroup()

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
