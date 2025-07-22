import { StatCard } from "~/components/common/StatCard";
import { ProjectList } from "~/components/features/projects";
import { FolderOpen, Server, Zap, Activity } from "lucide-react";
import type { Project, Group } from "~/types/api";

interface OverviewViewProps {
  projects: Project[];
  onProjectSelect: (projectId: number) => void;
}

export function OverviewView({ projects, onProjectSelect }: OverviewViewProps) {
  // 计算统计数据 - 添加空值检查和明确类型
  const totalGroups = projects.reduce((sum: number, p: Project) => sum + (p.groups?.length || 0), 0);
  const totalHosts = projects.reduce((sum: number, p: Project) => 
    sum + (p.groups?.reduce((gSum: number, g: Group) => gSum + (g.hosts?.length || 0), 0) || 0), 0);
  const totalPorts = projects.reduce((sum: number, p: Project) => 
    sum + (p.groups?.reduce((gSum: number, g: Group) => gSum + (g.port_forwards?.length || 0), 0) || 0), 0);
  const activeConnections = projects.reduce((sum: number, p: Project) => 
    sum + (p.groups?.reduce((gSum: number, g: Group) => 
      gSum + (g.port_forwards?.filter((pf: any) => pf.status === 'active')?.length || 0), 0) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">概览</h2>
        <p className="text-muted-foreground">管理你的SSH隧道和端口转发</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="项目总数"
          value={projects.length}
          description="工作空间"
          icon={FolderOpen}
        />
        <StatCard
          title="总主机数"
          value={totalHosts}
          description="SSH连接"
          icon={Server}
        />
        <StatCard
          title="端口转发"
          value={totalPorts}
          description="隧道规则"
          icon={Zap}
        />
        <StatCard
          title="活跃连接"
          value={activeConnections}
          description="实时数据"
          icon={Activity}
        />
      </div>
      
      {/* 项目列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">最近项目</h3>
        <ProjectList 
          projects={projects}
          onProjectClick={(project) => onProjectSelect(project.id)}
        />
      </div>
    </div>
  );
}
