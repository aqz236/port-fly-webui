import { useCallback } from "react";
import type { EditProjectData } from "~/features/projects/components/dialogs/edit-project-dialog";
import { 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject, 
  useMoveProject 
} from "~/shared/api/hooks";
import { CreateProjectData, MoveProjectParams } from "~/shared/types/project";

interface UseProjectActionsProps {
  onProjectsUpdate: () => void;
}

export function useProjectActions({ onProjectsUpdate }: UseProjectActionsProps) {
  // 使用 mutation hooks
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const moveProjectMutation = useMoveProject();

  // 创建项目处理函数
  const handleCreateProject = useCallback(async (data: CreateProjectData) => {
    try {
      await createProjectMutation.mutateAsync(data);
      onProjectsUpdate();
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  }, [createProjectMutation, onProjectsUpdate]);

  // 编辑项目处理函数
  const handleEditProject = useCallback(async (projectId: number, data: EditProjectData) => {
    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data });
      onProjectsUpdate();
    } catch (error) {
      console.error('编辑项目失败:', error);
    }
  }, [updateProjectMutation, onProjectsUpdate]);

  // 删除项目处理函数
  const handleDeleteProject = useCallback(async (projectId: number) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      onProjectsUpdate();
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  }, [deleteProjectMutation, onProjectsUpdate]);

  // 移动项目处理函数
  const handleMoveProject = useCallback(async (params: MoveProjectParams) => {
    try {
      await moveProjectMutation.mutateAsync(params);
      onProjectsUpdate();
    } catch (error) {
      console.error('移动项目失败:', error);
    }
  }, [moveProjectMutation, onProjectsUpdate]);

  return {
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleMoveProject,
    isLoading: {
      create: createProjectMutation.isPending,
      update: updateProjectMutation.isPending,
      delete: deleteProjectMutation.isPending,
      move: moveProjectMutation.isPending
    }
  };
}
