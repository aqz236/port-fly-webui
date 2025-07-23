import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import type { Project } from "~/shared/types/api";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color }}
          />
          <CardTitle className="text-base">{project.name}</CardTitle>
          {project.is_default && (
            <Badge variant="secondary" className="text-xs">默认</Badge>
          )}
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{project.groups?.length || 0} 个组</span>
          <span>
            {project.groups?.reduce((sum, g) => sum + (g.hosts?.length || 0), 0) || 0} 主机
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
