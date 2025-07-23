// ResourceViewer.tsx - 资源查看器组件
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Button } from "~/shared/components/ui/button";
import { Badge } from "~/shared/components/ui/badge";
import { Plus, Layers3, List, Grid3X3, Folder, Server, Users, Activity } from "lucide-react";
import { Project, ProjectStats } from "~/shared/types/project";
import { Group } from "~/shared/types/group";
import { Host } from "~/shared/types/host";
import { PortForward } from "~/shared/types/port-forward";

import { ProjectCanvas } from "./canvas";

type ViewMode = 'canvas' | 'list' | 'grid';

interface ResourceViewerProps {
  project: Project;
  stats?: ProjectStats;
  onCreateGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: number) => void;
  onCreateHost: (groupId: number) => void;
  onEditHost: (host: Host) => void;
  onDeleteHost: (id: number) => void;
  onConnectHost: (hostId: number) => void;
  onCreatePort: (groupId: number, hostId?: number) => void;
  onEditPort: (port: PortForward) => void;
  onDeletePort: (id: number) => void;
  onTogglePort: (portId: number) => void;
}

export function ResourceViewer({ 
  project, 
  stats,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onCreateHost,
  onEditHost,
  onDeleteHost,
  onConnectHost,
  onCreatePort,
  onEditPort,
  onDeletePort,
  onTogglePort
}: ResourceViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');

  return (
    <Card className="h-full flex flex-col border-[0]">
      <CardHeader className="p-2 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>资源管理</CardTitle>
            <CardDescription>
              可视化管理项目中的组、主机和端口转发
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* 紧凑统计信息 */}
            {/* {stats && (
              <div className="flex items-center gap-3 mr-4">
                <Badge variant="outline" className="text-xs">
                  <Folder className="h-3 w-3 mr-1" />
                  {stats.total_groups}组
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Server className="h-3 w-3 mr-1" />
                  {stats.total_hosts}主机
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {stats.total_ports}端口
                </Badge>
                <Badge variant={stats.active_tunnels > 0 ? "default" : "secondary"} className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  {stats.active_tunnels}活跃
                </Badge>
              </div>
            )} */}
            
            {/* 视图切换 */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'canvas' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('canvas')}
                className="h-8"
              >
                <Layers3 className="h-4 w-4 mr-1" />
                画布
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <List className="h-4 w-4 mr-1" />
                列表
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                网格
              </Button>
            </div>
            
            {/* 快速创建按钮 */}
            <Button onClick={onCreateGroup} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              创建组
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="h-full">
        {viewMode === 'canvas' && (
          <div className="h-full border-t">
            <ProjectCanvas
              project={project}
              onCreateGroup={onCreateGroup}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onCreateHost={onCreateHost}
              onEditHost={onEditHost}
              onDeleteHost={onDeleteHost}
              onConnectHost={onConnectHost}
              onCreatePort={onCreatePort}
              onEditPort={onEditPort}
              onDeletePort={onDeletePort}
              onTogglePort={onTogglePort}
            />
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              列表视图开发中...
            </div>
          </div>
        )}
        
        {viewMode === 'grid' && (
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              网格视图开发中...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
