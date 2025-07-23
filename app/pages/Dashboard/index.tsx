import { StatCard } from "~/shared/components/common/StatCard";
import { ProjectList } from "~/features/projects/components";
import { FolderOpen, Server, Zap, Activity } from "lucide-react";
import { Group } from "~/shared/types/group";
import { Project } from "~/shared/types/project";

interface DashboardPageProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function DashboardPage({ projects, onProjectClick }: DashboardPageProps) {
  // 计算统计数据
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
          icon={FolderOpen}
          description="管理的项目数量"
        />
        <StatCard
          title="资源组"
          value={totalGroups}
          icon={Server}
          description="所有项目的资源组"
        />
        <StatCard
          title="主机数量"
          value={totalHosts}
          icon={Server}
          description="配置的主机总数"
        />
        <StatCard
          title="端口转发"
          value={totalPorts}
          icon={Zap}
          description="配置的端口转发"
        />
      </div>

      {/* 项目列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">项目列表</h3>
        <ProjectList 
          projects={projects} 
          onProjectClick={onProjectClick}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
