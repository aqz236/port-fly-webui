import type { Project } from "~/shared/types/api";
import { AppLayoutContainer } from "~/shared/components/containers";

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
