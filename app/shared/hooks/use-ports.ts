// Port Hooks - TanStack Query hooks for port operations
// 端口相关的 React Query hooks

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portApiClient } from '~/shared/api/port';
import { 
  Port, 
  CreatePortData, 
  UpdatePortData, 
  PortControlRequest, 
  PortResponse 
} from '~/shared/types/port';

// Query Keys
export const portQueryKeys = {
  all: ['ports'] as const,
  lists: () => [...portQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...portQueryKeys.lists(), { filters }] as const,
  details: () => [...portQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...portQueryKeys.details(), id] as const,
};

// 获取端口列表
export function usePorts(params?: {
  group_id?: number;
  host_id?: number;
}) {
  return useQuery({
    queryKey: portQueryKeys.list(params || {}),
    queryFn: () => portApiClient.getPorts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 获取单个端口
export function usePort(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: portQueryKeys.detail(id),
    queryFn: () => portApiClient.getPort(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 创建端口
export function useCreatePort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePortData) => portApiClient.createPort(data),
    onSuccess: (newPortResponse) => {
      // 添加到缓存
      queryClient.setQueryData(
        portQueryKeys.detail(newPortResponse.port.id),
        newPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 更新端口
export function useUpdatePort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortData }) =>
      portApiClient.updatePort(id, data),
    onSuccess: (updatedPortResponse, { id }) => {
      // 更新缓存
      queryClient.setQueryData(
        portQueryKeys.detail(id),
        updatedPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 删除端口
export function useDeletePort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => portApiClient.deletePort(id),
    onSuccess: (_, id) => {
      // 从缓存中移除
      queryClient.removeQueries({
        queryKey: portQueryKeys.detail(id),
      });

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 控制端口（通用）
export function useControlPort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: PortControlRequest }) =>
      portApiClient.controlPort(id, action),
    onSuccess: (updatedPortResponse, { id }) => {
      // 更新缓存
      queryClient.setQueryData(
        portQueryKeys.detail(id),
        updatedPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 启动端口
export function useStartPort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => portApiClient.startPort(id),
    onSuccess: (updatedPortResponse, id) => {
      // 更新缓存
      queryClient.setQueryData(
        portQueryKeys.detail(id),
        updatedPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 停止端口
export function useStopPort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => portApiClient.stopPort(id),
    onSuccess: (updatedPortResponse, id) => {
      // 更新缓存
      queryClient.setQueryData(
        portQueryKeys.detail(id),
        updatedPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 重启端口
export function useRestartPort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => portApiClient.restartPort(id),
    onSuccess: (updatedPortResponse, id) => {
      // 更新缓存
      queryClient.setQueryData(
        portQueryKeys.detail(id),
        updatedPortResponse
      );

      // 使端口列表失效
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.lists(),
      });
    },
  });
}

// 批量操作 hooks
export function useBulkPortOperations() {
  const queryClient = useQueryClient();

  const bulkStart = useMutation({
    mutationFn: async (portIds: number[]) => {
      const results = await Promise.allSettled(
        portIds.map(id => portApiClient.startPort(id))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.all,
      });
    },
  });

  const bulkStop = useMutation({
    mutationFn: async (portIds: number[]) => {
      const results = await Promise.allSettled(
        portIds.map(id => portApiClient.stopPort(id))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.all,
      });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (portIds: number[]) => {
      const results = await Promise.allSettled(
        portIds.map(id => portApiClient.deletePort(id))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: portQueryKeys.all,
      });
    },
  });

  return {
    bulkStart,
    bulkStop,
    bulkDelete,
  };
}
