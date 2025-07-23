import { Button } from "~/shared/components/ui/button";
import { StatCard } from "~/shared/common/StatCard";
import { GroupList } from "~/features/groups/components";
import { Plus } from "lucide-react";
import type { Project, Group } from "~/shared/types/api";

interface ProjectViewProps {
  project: Project;
  onGroupSelect: (groupId: number) => void;
  onAddGroup?: () => void;
}

export function ProjectView({ project, onGroupSelect, onAddGroup }: ProjectViewProps) {
  const totalHosts = (project.groups || []).reduce((sum: number, g: Group) => sum + (g.hosts?.length || 0), 0);
  const totalPorts = (project.groups || []).reduce((sum: number, g: Group) => sum + (g.port_forwards?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </h2>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <Button onClick={onAddGroup}>
          <Plus className="w-4 h-4 mr-2" />
          添加组
        </Button>
      </div>
      
      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="组数量"
          value={project.groups?.length || 0}
          icon={Plus}
        />
        <StatCard
          title="主机数量"
          value={totalHosts}
          icon={Plus}
        />
        <StatCard
          title="端口转发"
          value={totalPorts}
          icon={Plus}
        />
      </div>
      
      {/* 组列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">组列表</h3>
        <GroupList 
          groups={project.groups || []}
          onGroupClick={(group) => onGroupSelect(group.id)}
        />
      </div>
    </div>
  );
}
