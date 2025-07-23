// ProjectHeader.tsx - 项目头部组件
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Edit, Settings, Folder } from "lucide-react";
import { Project } from "~/shared/types/project";

interface ProjectHeaderProps {
  project: Project;
  onEdit?: () => void;
  onSettings?: () => void;
}

export function ProjectHeader({ project, onEdit, onSettings }: ProjectHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: project.color }}
        >
          <Folder className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">ID: {project.id}</Badge>
            {project.is_default && (
              <Badge variant="default">默认项目</Badge>
            )}
            <Badge variant="outline">层级: {project.level}</Badge>
            {project.parent_id && (
              <Badge variant="outline">父项目: {project.parent_id}</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          编辑
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4 mr-2" />
          设置
        </Button>
      </div>
    </div>
  );
}
