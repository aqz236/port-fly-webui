import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '~/lib/api/client'
import { notify } from '~/lib/store/useUIStore'
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectStats
} from '~/types/api'

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  stats: (id: number) => [...projectKeys.detail(id), 'stats'] as const,
}

// 获取所有项目
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => apiClient.getProjects(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  })
}

// 获取单个项目
export function useProject(id: number, enabled = true) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiClient.getProject(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// 获取项目统计
export function useProjectStats(id: number, enabled = true) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: () => apiClient.getProjectStats(id),
    enabled: enabled && id > 0,
    staleTime: 30 * 1000, // 30秒缓存（统计数据更新频繁）
    refetchInterval: 60 * 1000, // 每分钟自动刷新
  })
}

// 项目操作 hooks
export function useProjectActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.createProject(data),
    onSuccess: (newProject) => {
      // 更新项目列表缓存
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old ? [...old, newProject] : [newProject]
      })
      
      notify.success('创建成功', `项目 "${newProject.name}" 已创建`)
    },
    onError: (error: Error) => {
      notify.error('创建失败', error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      apiClient.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // 更新项目列表缓存
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old?.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      })
      
      // 更新单个项目缓存
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject
      )
      
      notify.success('更新成功', `项目 "${updatedProject.name}" 已更新`)
    },
    onError: (error: Error) => {
      notify.error('更新失败', error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // 从项目列表缓存中移除
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old?.filter((project) => project.id !== deletedId)
      })
      
      // 移除单个项目缓存
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: projectKeys.stats(deletedId) })
      
      notify.success('删除成功', '项目已删除')
    },
    onError: (error: Error) => {
      notify.error('删除失败', error.message)
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}

// 默认项目相关
export function useDefaultProject() {
  const { data: projects } = useProjects()
  const defaultProject = projects?.find(p => p.is_default)
  
  return {
    defaultProject,
    hasDefaultProject: !!defaultProject,
  }
}

// 项目选择器
export function useProjectSelector() {
  const { data: projects, isLoading, error } = useProjects()
  
  const options = projects?.map(project => ({
    value: project.id,
    label: project.name,
    color: project.color,
    icon: project.icon,
    isDefault: project.is_default,
  })) || []
  
  return {
    options,
    isLoading,
    error,
  }
}
