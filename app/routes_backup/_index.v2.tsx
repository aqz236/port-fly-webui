import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { 
  Plus, 
  Server, 
  Zap, 
  Activity, 
  AlertCircle, 
  FolderOpen,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { useProjects, useProjectActions, useProject } from "../lib/hooks/api/useProjects";
import { useGroups, useGroupActions } from "../lib/hooks/api/useGroups";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center gap-4 p-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">加载失败</p>
          <p className="text-red-600 text-sm">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} size="sm">
            重试
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 项目卡片组件
function ProjectCard({ project, onSelectProject }: { 
  project: any; 
  onSelectProject: (projectId: number) => void;
}) {
  const { data: groups } = useGroups(project.id);
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelectProject(project.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          <CardTitle className="text-base">{project.name}</CardTitle>
          {project.is_default && (
            <Badge variant="secondary" className="text-xs">默认</Badge>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            <span>{groups?.length || 0} 组</span>
          </div>
          <div className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            <span>
              {groups?.reduce((sum, group) => sum + (group.hosts?.length || 0), 0) || 0} 主机
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>
              {groups?.reduce((sum, group) => sum + (group.port_forwards?.length || 0), 0) || 0} 端口
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 组卡片组件
function GroupCard({ group }: { group: any }) {
  const hostCount = group.hosts?.length || 0;
  const portCount = group.port_forwards?.length || 0;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: group.color || '#10b981' }}
          />
          <CardTitle className="text-base">{group.name}</CardTitle>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span>主机</span>
            </div>
            <span className="font-medium">{hostCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>端口转发</span>
            </div>
            <span className="font-medium">{portCount}</span>
          </div>
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {group.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {group.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{group.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 项目视图
function ProjectsView({ onSelectProject }: { onSelectProject: (projectId: number) => void }) {
  const { data: projects, isLoading, error, refetch } = useProjects();
  const { create, isCreating } = useProjectActions();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const handleCreateProject = () => {
    create({
      name: `新项目 ${Date.now()}`,
      description: "通过API创建的测试项目",
      color: "#6366f1",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">项目空间</h2>
        <Button onClick={handleCreateProject} disabled={isCreating} size="sm">
          {isCreating ? "创建中..." : "新建项目"}
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects?.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onSelectProject={onSelectProject}
          />
        ))}
        
        {(!projects || projects.length === 0) && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2" />
              <span className="text-sm">暂无项目</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 项目详情视图
function ProjectDetailView({ 
  projectId, 
  onBack 
}: { 
  projectId: number; 
  onBack: () => void;
}) {
  const { data: project } = useProject(projectId);
  const { data: groups, isLoading, error, refetch } = useGroups(projectId);
  const { create, isCreating } = useGroupActions();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const handleCreateGroup = () => {
    create({
      name: `新建组 ${Date.now()}`,
      description: "通过API创建的测试组",
      color: "#10b981",
      project_id: projectId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← 返回
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{project?.name}</h2>
            <p className="text-sm text-muted-foreground">{project?.description}</p>
          </div>
        </div>
        <Button onClick={handleCreateGroup} disabled={isCreating} size="sm">
          {isCreating ? "创建中..." : "新建组"}
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groups?.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
        
        {(!groups || groups.length === 0) && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2" />
              <span className="text-sm">暂无组</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 统计概览
function StatsOverview() {
  const { data: projects } = useProjects();
  const { data: allGroups } = useGroups();

  const totalProjects = projects?.length || 0;
  const totalGroups = allGroups?.length || 0;
  const totalHosts = allGroups?.reduce((sum, group) => sum + (group.hosts?.length || 0), 0) || 0;
  const totalPorts = allGroups?.reduce((sum, group) => sum + (group.port_forwards?.length || 0), 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">项目数量</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">工作空间</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">组数量</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGroups}</div>
          <p className="text-xs text-muted-foreground">资源分组</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">主机总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHosts}</div>
          <p className="text-xs text-muted-foreground">SSH连接</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">端口转发</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPorts}</div>
          <p className="text-xs text-muted-foreground">隧道规则</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Index() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">PortFly</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedProjectId ? '项目详情' : '工作空间'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProjectId 
              ? '管理项目中的资源组'
              : '选择一个项目开始管理您的SSH隧道和端口转发'
            }
          </p>
        </div>
        
        <StatsOverview />
        
        {selectedProjectId ? (
          <ProjectDetailView 
            projectId={selectedProjectId} 
            onBack={() => setSelectedProjectId(null)}
          />
        ) : (
          <ProjectsView onSelectProject={setSelectedProjectId} />
        )}
      </main>
    </div>
  );
}
