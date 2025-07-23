// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { apiClient } from '~/lib/api/client'
// import { notify } from '~/lib/store/useUIStore'
// import type {
//   Group,
//   CreateGroupData,
//   UpdateGroupData,
//   GroupStats
// } from '~/types/api'

// // Query Keys
// export const groupKeys = {
//   all: ['groups'] as const,
//   lists: () => [...groupKeys.all, 'list'] as const,
//   list: (filters: Record<string, any>) => [...groupKeys.lists(), filters] as const,
//   details: () => [...groupKeys.all, 'detail'] as const,
//   detail: (id: number) => [...groupKeys.details(), id] as const,
//   stats: (id: number) => [...groupKeys.detail(id), 'stats'] as const,
// }

// // 获取组列表（可按项目过滤）
// export function useGroups(projectId?: number) {
//   return useQuery({
//     queryKey: groupKeys.list({ projectId }),
//     queryFn: () => apiClient.getGroups(projectId),
//     staleTime: 5 * 60 * 1000, // 5分钟缓存
//     gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
//   })
// }

// // 获取单个组
// export function useGroup(id: number, enabled = true) {
//   return useQuery({
//     queryKey: groupKeys.detail(id),
//     queryFn: () => apiClient.getGroup(id),
//     enabled: enabled && id > 0,
//     staleTime: 5 * 60 * 1000,
//   })
// }

// // 获取组统计
// export function useGroupStats(id: number, enabled = true) {
//   return useQuery({
//     queryKey: groupKeys.stats(id),
//     queryFn: () => apiClient.getGroupStats(id),
//     enabled: enabled && id > 0,
//     staleTime: 30 * 1000, // 30秒缓存（统计数据更新频繁）
//     refetchInterval: 60 * 1000, // 每分钟自动刷新
//   })
// }

// // 组操作 hooks
// export function useGroupActions() {
//   const queryClient = useQueryClient()

//   const createMutation = useMutation({
//     mutationFn: (data: CreateGroupData) => apiClient.createGroup(data),
//     onSuccess: (newGroup) => {
//       // 更新相关项目的组列表缓存
//       queryClient.setQueryData<Group[]>(
//         groupKeys.list({ projectId: newGroup.project_id }),
//         (old) => {
//           return old ? [...old, newGroup] : [newGroup]
//         }
//       )
      
//       // 更新全部组列表缓存
//       queryClient.setQueryData<Group[]>(
//         groupKeys.list({}),
//         (old) => {
//           return old ? [...old, newGroup] : [newGroup]
//         }
//       )
      
//       notify.success('创建成功', `组 "${newGroup.name}" 已创建`)
//     },
//     onError: (error: Error) => {
//       notify.error('创建失败', error.message)
//     },
//   })

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: number; data: UpdateGroupData }) =>
//       apiClient.updateGroup(id, data),
//     onSuccess: (updatedGroup) => {
//       // 更新所有相关的缓存
//       const projectId = updatedGroup.project_id
      
//       queryClient.setQueryData<Group[]>(
//         groupKeys.list({ projectId }),
//         (old) => {
//           return old?.map((group) =>
//             group.id === updatedGroup.id ? updatedGroup : group
//           )
//         }
//       )
      
//       queryClient.setQueryData<Group[]>(
//         groupKeys.list({}),
//         (old) => {
//           return old?.map((group) =>
//             group.id === updatedGroup.id ? updatedGroup : group
//           )
//         }
//       )
      
//       // 更新单个组缓存
//       queryClient.setQueryData(
//         groupKeys.detail(updatedGroup.id),
//         updatedGroup
//       )
      
//       notify.success('更新成功', `组 "${updatedGroup.name}" 已更新`)
//     },
//     onError: (error: Error) => {
//       notify.error('更新失败', error.message)
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => apiClient.deleteGroup(id),
//     onSuccess: (_, deletedId) => {
//       // 从所有相关缓存中移除
//       queryClient.setQueriesData<Group[]>(
//         { queryKey: groupKeys.lists() },
//         (old) => {
//           return old?.filter((group) => group.id !== deletedId)
//         }
//       )
      
//       // 移除单个组缓存
//       queryClient.removeQueries({ queryKey: groupKeys.detail(deletedId) })
//       queryClient.removeQueries({ queryKey: groupKeys.stats(deletedId) })
      
//       notify.success('删除成功', '组已删除')
//     },
//     onError: (error: Error) => {
//       notify.error('删除失败', error.message)
//     },
//   })

//   return {
//     create: createMutation.mutate,
//     update: updateMutation.mutate,
//     remove: deleteMutation.mutate,
//     isCreating: createMutation.isPending,
//     isUpdating: updateMutation.isPending,
//     isDeleting: deleteMutation.isPending,
//     isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
//   }
// }

// // 组选择器（用于下拉菜单等）
// export function useGroupSelector(projectId?: number) {
//   const { data: groups, isLoading, error } = useGroups(projectId)
  
//   const options = groups?.map(group => ({
//     value: group.id,
//     label: group.name,
//     color: group.color,
//     icon: group.icon,
//     projectId: group.project_id,
//   })) || []
  
//   return {
//     options,
//     isLoading,
//     error,
//   }
// }

// // 按项目分组的组列表
// export function useGroupsByProject() {
//   const { data: groups, isLoading, error } = useGroups()
  
//   const groupsByProject = groups?.reduce((acc, group) => {
//     const projectId = group.project_id
//     if (!acc[projectId]) {
//       acc[projectId] = []
//     }
//     acc[projectId].push(group)
//     return acc
//   }, {} as Record<number, Group[]>) || {}
  
//   return {
//     groupsByProject,
//     isLoading,
//     error,
//   }
// }
