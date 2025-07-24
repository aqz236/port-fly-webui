// ResourceViewer.tsx - 资源查看器组件 - 新架构版本
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Button } from "~/shared/components/ui/button";
import { Badge } from "~/shared/components/ui/badge";
import { Plus, Layers3, List, Grid3X3, Folder, Server, Users, Activity } from "lucide-react";
import { Project, ProjectStats } from "~/shared/types/project";
import { Group } from "~/shared/types/group";
import { Host } from "~/shared/types/host";
import { PortForward } from "~/shared/types/port-forward";
import { Port, PortType } from "~/shared/types/port";

import { ProjectCanvas } from "./canvas";

type ViewMode = 'canvas' | 'list' | 'grid';

interface ResourceViewerProps {
  project: Project;
  stats?: ProjectStats;
  onCreateGroup: (projectId: number) => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: number) => void;
  onCreateHost: (groupId: number) => void;
  onEditHost: (host: Host) => void;
  onDeleteHost: (id: number) => void;
  onConnectHost: (hostId: number) => void;
  onCreatePort: (groupId: number, hostId?: number) => void;
  onCreatePortV2?: (groupId: number, portType: PortType) => void;
  onEditPort: (port: PortForward) => void;
  onEditPortV2?: (port: Port) => void;
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
  onCreatePortV2,
  onEditPort,
  onEditPortV2,
  onDeletePort,
  onTogglePort,
}: ResourceViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');

  // 计算统计数据
  const groupCount = project.groups?.length || 0;
  const hostCount = project.groups?.reduce((total, group) => total + (group.hosts?.length || 0), 0) || 0;
  const portCount = project.groups?.reduce((total, group) => total + (group.port_forwards?.length || 0), 0) || 0;

  const viewModeConfig = {
    canvas: { icon: Layers3, label: '画布视图', description: '可视化的画布界面' },
    list: { icon: List, label: '列表视图', description: '传统的列表界面' },
    grid: { icon: Grid3X3, label: '网格视图', description: '卡片式网格界面' },
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              {project.name} - 资源管理
            </CardTitle>
            <CardDescription>
              管理项目中的画布、主机和端口转发配置
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onCreateGroup(project.id)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              新建画布
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Folder className="w-3 h-3" />
              {groupCount} 画布
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Server className="w-3 h-3" />
              {hostCount} 主机
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {portCount} 端口转发
            </Badge>
          </div>
        </div>

        {/* 视图模式切换 */}
        <div className="flex items-center gap-2 mt-4">
          {Object.entries(viewModeConfig).map(([mode, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode as ViewMode)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="h-full flex-1 min-h-0">
        {viewMode === 'canvas' && (
          <div className="h-full border-t">
            <ProjectCanvas
              project={project}
              onCreateGroup={onCreateGroup}
              onCreateHost={onCreateHost}
              onEditHost={onEditHost}
              onDeleteHost={onDeleteHost}
              onConnectHost={onConnectHost}
              onCreatePort={onCreatePort}
              onCreatePortV2={onCreatePortV2}
              onEditPort={onEditPort}
              onEditPortV2={onEditPortV2}
              onDeletePort={onDeletePort}
              onTogglePort={onTogglePort}
            />
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">列表视图</h3>
              <p>传统的层级列表视图正在开发中...</p>
            </div>
          </div>
        )}
        
        {viewMode === 'grid' && (
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">网格视图</h3>
              <p>卡片式网格视图正在开发中...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
