import { AppLayoutContainer } from "~/shared/components/containers";
import { Project } from "~/shared/types/project";

interface MainLayoutProps {
  projects: Project[];
  onProjectsUpdate: () => void;
}

export function MainLayout({ projects, onProjectsUpdate }: MainLayoutProps) {
  return (
    <AppLayoutContainer 
      projects={projects}
      onProjectsUpdate={onProjectsUpdate}
    />
  );
}
