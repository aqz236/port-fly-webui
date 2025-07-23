// 画布信息面板组件
import { Panel } from '@xyflow/react';
import { Project } from '~/shared/types/project';

interface CanvasInfoPanelProps {
  project: Project;
}

export function CanvasInfoPanel({ project }: CanvasInfoPanelProps) {
  const totalGroups = project.groups?.length || 0;
  const totalHosts = project.groups?.reduce((acc, g) => acc + (g.hosts?.length || 0), 0) || 0;
  const totalPorts = project.groups?.reduce((acc, g) => acc + (g.port_forwards?.length || 0), 0) || 0;
  
  // 计算连接状态统计
  const connectedHosts = project.groups?.reduce((acc, g) => {
    return acc + (g.hosts?.filter(h => h.status === 'connected').length || 0);
  }, 0) || 0;
  
  const activePorts = project.groups?.reduce((acc, g) => {
    return acc + (g.port_forwards?.filter(p => p.status === 'active').length || 0);
  }, 0) || 0;

  return (
    <Panel position="bottom-center">
      <div className="bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-sm mb-2">{project.name}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>组:</span>
            <span className="font-medium">{totalGroups}</span>
          </div>
          <div className="flex justify-between">
            <span>主机:</span>
            <span className="font-medium">
              {connectedHosts}/{totalHosts}
            </span>
          </div>
          <div className="flex justify-between">
            <span>端口:</span>
            <span className="font-medium">
              {activePorts}/{totalPorts}
            </span>
          </div>
          <div className="flex justify-between">
            <span>状态:</span>
            <span className={`font-medium ${connectedHosts > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {connectedHosts > 0 ? '活跃' : '待连接'}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
