// Health and System Stats Hooks
// 健康检查和系统统计相关的 React Query hooks

import { 
  useQuery,
  type UseQueryOptions
} from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { queryKeys } from './query-keys'
import type { HealthStatus, SystemStats } from '../../../types/api'

/**
 * 健康检查 Hook
 * 每30秒自动检查一次健康状态
 */
export const useHealth = (options?: UseQueryOptions<HealthStatus>) => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.health.health(),
    refetchInterval: 30000, // 每30秒检查一次健康状态
    ...options,
  })
}

/**
 * 系统统计 Hook
 * 每10秒自动刷新系统状态
 */
export const useSystemStats = (options?: UseQueryOptions<SystemStats>) => {
  return useQuery({
    queryKey: queryKeys.systemStats,
    queryFn: () => apiClient.health.getSystemStats(),
    refetchInterval: 10000, // 每10秒刷新系统状态
    ...options,
  })
}
