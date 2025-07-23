import { ProjectDetailV2 } from "~/features/projects/components/ProjectDetail.v2";
import { Project } from "~/shared/types/project";

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
      
      <ProjectDetailV2 project={project} />
    </div>
  );
}

export default ProjectsPage;
