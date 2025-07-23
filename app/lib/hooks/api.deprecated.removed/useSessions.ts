// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { apiClient } from '~/lib/api/client'
// import { notify } from '~/lib/store/useUIStore'
// import type {
//   TunnelSession,
//   CreateTunnelSessionData,
//   UpdateTunnelSessionData
// } from '~/types/api'

// // Query Keys
// export const sessionKeys = {
//   all: ['sessions'] as const,
//   lists: () => [...sessionKeys.all, 'list'] as const,
//   list: (filters: string) => [...sessionKeys.lists(), { filters }] as const,
//   active: () => [...sessionKeys.all, 'active'] as const,
//   details: () => [...sessionKeys.all, 'detail'] as const,
//   detail: (id: number) => [...sessionKeys.details(), id] as const,
// }

// // 获取所有隧道会话
// export function useTunnelSessions() {
//   return useQuery({
//     queryKey: sessionKeys.lists(),
//     queryFn: () => apiClient.getTunnelSessions(),
//     staleTime: 30 * 1000, // 30秒缓存（会话状态变化频繁）
//     refetchInterval: 10 * 1000, // 每10秒自动刷新
//   })
// }

// // 获取活跃的隧道会话
// export function useActiveTunnelSessions() {
//   return useQuery({
//     queryKey: sessionKeys.active(),
//     queryFn: () => apiClient.getActiveTunnelSessions(),
//     staleTime: 10 * 1000, // 10秒缓存
//     refetchInterval: 5 * 1000, // 每5秒自动刷新（实时性要求高）
//   })
// }

// // 获取单个隧道会话
// export function useTunnelSession(id: number, enabled = true) {
//   return useQuery({
//     queryKey: sessionKeys.detail(id),
//     queryFn: () => apiClient.getTunnelSession(id),
//     enabled: enabled && id > 0,
//     staleTime: 30 * 1000,
//     refetchInterval: 5 * 1000,
//   })
// }

// // 创建隧道会话
// export function useCreateTunnelSession() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: CreateTunnelSessionData) => apiClient.createTunnelSession(data),
//     onSuccess: (newSession) => {
//       // 更新列表缓存
//       queryClient.setQueryData<TunnelSession[]>(
//         sessionKeys.lists(),
//         (old = []) => [...old, newSession]
//       )
      
//       // 刷新活跃会话列表
//       queryClient.invalidateQueries({ queryKey: sessionKeys.active() })
      
//       // 显示成功通知
//       notify.success('会话创建成功', '隧道会话已创建，可以启动了')
//     },
//     onError: (error) => {
//       console.error('创建隧道会话失败:', error)
//       notify.error('创建失败', error instanceof Error ? error.message : '未知错误')
//     },
//   })
// }

// // 更新隧道会话
// export function useUpdateTunnelSession() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ id, data }: { id: number; data: UpdateTunnelSessionData }) =>
//       apiClient.updateTunnelSession(id, data),
//     onSuccess: (updatedSession) => {
//       // 更新列表缓存
//       queryClient.setQueryData<TunnelSession[]>(
//         sessionKeys.lists(),
//         (old = []) => 
//           old.map(session => 
//             session.id === updatedSession.id ? updatedSession : session
//           )
//       )
      
//       // 更新详情缓存
//       queryClient.setQueryData(
//         sessionKeys.detail(updatedSession.id),
//         updatedSession
//       )
      
//       // 刷新活跃会话列表
//       queryClient.invalidateQueries({ queryKey: sessionKeys.active() })
//     },
//     onError: (error) => {
//       console.error('更新隧道会话失败:', error)
//       notify.error('更新失败', error instanceof Error ? error.message : '未知错误')
//     },
//   })
// }

// // 删除隧道会话
// export function useDeleteTunnelSession() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: number) => apiClient.deleteTunnelSession(id),
//     onSuccess: (_, deletedId) => {
//       // 从列表缓存中移除
//       queryClient.setQueryData<TunnelSession[]>(
//         sessionKeys.lists(),
//         (old = []) => old.filter(session => session.id !== deletedId)
//       )
      
//       // 移除相关缓存
//       queryClient.removeQueries({ queryKey: sessionKeys.detail(deletedId) })
      
//       // 刷新活跃会话列表
//       queryClient.invalidateQueries({ queryKey: sessionKeys.active() })
      
//       // 显示成功通知
//       notify.success('删除成功', '隧道会话已删除')
//     },
//     onError: (error) => {
//       console.error('删除隧道会话失败:', error)
//       notify.error('删除失败', error instanceof Error ? error.message : '未知错误')
//     },
//   })
// }

// // 启动隧道
// export function useStartTunnel() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (sessionId: number) => apiClient.startTunnel(sessionId),
//     onSuccess: (_, sessionId) => {
//       // 刷新会话详情
//       queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      
//       // 刷新会话列表
//       queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
//       queryClient.invalidateQueries({ queryKey: sessionKeys.active() })
      
//       // 显示成功通知
//       notify.success('隧道启动成功', '隧道连接已建立')
//     },
//     onError: (error) => {
//       console.error('启动隧道失败:', error)
//       notify.error('启动失败', error instanceof Error ? error.message : '未知错误')
//     },
//   })
// }

// // 停止隧道
// export function useStopTunnel() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (sessionId: number) => apiClient.stopTunnel(sessionId),
//     onSuccess: (_, sessionId) => {
//       // 刷新会话详情
//       queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      
//       // 刷新会话列表
//       queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
//       queryClient.invalidateQueries({ queryKey: sessionKeys.active() })
      
//       // 显示成功通知
//       notify.success('隧道已停止', '隧道连接已断开')
//     },
//     onError: (error) => {
//       console.error('停止隧道失败:', error)
//       notify.error('停止失败', error instanceof Error ? error.message : '未知错误')
//     },
//   })
// }

// // 隧道控制操作
// export function useTunnelActions() {
//   const startMutation = useStartTunnel()
//   const stopMutation = useStopTunnel()
//   const createMutation = useCreateTunnelSession()
//   const deleteMutation = useDeleteTunnelSession()

//   return {
//     start: startMutation.mutate,
//     stop: stopMutation.mutate,
//     create: createMutation.mutate,
//     delete: deleteMutation.mutate,
//     isStarting: startMutation.isPending,
//     isStopping: stopMutation.isPending,
//     isCreating: createMutation.isPending,
//     isDeleting: deleteMutation.isPending,
//     isLoading: startMutation.isPending || stopMutation.isPending || 
//                createMutation.isPending || deleteMutation.isPending,
//   }
// }
