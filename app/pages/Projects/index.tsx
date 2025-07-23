import { ProjectDetail } from "~/features/projects/components/ProjectDetail";
import type { Project } from "~/shared/types/api";

interface ProjectsPageProps {
  project: Project;
}

export function ProjectsPage({ project }: ProjectsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
      
      <ProjectDetail project={project} />
    </div>
  );
}

export default ProjectsPage;
