import { useParams, useNavigate } from "@remix-run/react";
import { ProjectDetail } from "~/features/projects/components/ProjectDetail";
import { useProjects } from "~/shared/api/hooks";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { useEffect } from "react";

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { setSelected, getProjectStats } = useLayoutStore();

  const project = projects.find(p => p.id === Number(projectId));

  // 设置选中状态
  useEffect(() => {
    if (project) {
      setSelected({ 
        type: 'project', 
        projectId: project.id 
      });
    }
  }, [project?.id]); // 只依赖 project.id，避免无限循环

  const handleGroupClick = (group: any) => {
    navigate(`/app/group/${group.id}`);
  };

  if (!project) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        项目未找到
      </div>
    );
  }

  const stats = getProjectStats(project.id);

  return (
    <ProjectDetail 
      project={project}
      stats={stats}
      onGroupClick={handleGroupClick}
    />
  );
}
