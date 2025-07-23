import { Project } from "~/shared/types/project";
import { ProjectCard,  } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无项目，开始创建你的第一个项目
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick?.(project)}
        />
      ))}
    </div>
  );
}
