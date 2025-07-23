// Project Related Hooks
// 项目相关的 React Query hooks

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
  Project,
  CreateProjectData,
  UpdateProjectData,
  MoveProjectParams,
  ProjectStats
} from '../../types/api'

/**
 * 获取项目列表 Hook
 * 支持树形结构和父子关系查询
 */
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
    queryFn: () => apiClient.projects.getProjects(params) as Promise<Project[]>,
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    ...options,
  })
}

/**
 * 获取单个项目 Hook
 */
export const useProject = (
  id: number,
  options?: UseQueryOptions<Project>
) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiClient.projects.getProject(id),
    enabled: id > 0,
    ...options,
  })
}

/**
 * 获取项目统计数据 Hook
 * 每30秒自动刷新统计数据
 */
export const useProjectStats = (
  id: number,
  options?: UseQueryOptions<ProjectStats>
) => {
  return useQuery({
    queryKey: queryKeys.projectStats(id),
    queryFn: () => apiClient.projects.getProjectStats(id),
    enabled: id > 0,
    refetchInterval: 30000, // 每30秒刷新统计数据
    ...options,
  })
}

/**
 * 创建项目 Hook
 * 自动更新相关缓存
 */
export const useCreateProject = (
  options?: UseMutationOptions<Project, Error, CreateProjectData>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.projects.createProject(data),
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

/**
 * 更新项目 Hook
 * 自动更新相关缓存
 */
export const useUpdateProject = (
  options?: UseMutationOptions<Project, Error, { id: number; data: UpdateProjectData }>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.projects.updateProject(id, data),
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

/**
 * 删除项目 Hook
 * 自动清理相关缓存
 */
export const useDeleteProject = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.projects.deleteProject(id),
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

/**
 * 移动项目 Hook
 * 移动项目到不同的父级或位置
 */
export const useMoveProject = (
  options?: UseMutationOptions<void, Error, MoveProjectParams>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: MoveProjectParams) => apiClient.projects.moveProject(params),
    onSuccess: () => {
      // 移动项目后，使所有项目相关缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTree() })
    },
    ...options,
  })
}
