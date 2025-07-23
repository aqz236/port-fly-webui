// GroupNodeContent.tsx - 组节点内容组件
import { memo } from 'react';
import { CardContent } from '~/shared/components/ui/card';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';
import { HostItemEventHandlers, PortItemEventHandlers } from './types';
import { HostList } from './HostList';
import { PortForwardList } from './PortForwardList';
import { EmptyState } from './EmptyState';

interface GroupNodeContentProps {
  hosts: Host[];
  portForwards: PortForward[];
  groupId: number;
  onAddHost: (groupId: number) => void;
  onAddPort: (groupId: number) => void;
  hostHandlers: HostItemEventHandlers;
  portHandlers: PortItemEventHandlers;
}

export const GroupNodeContent = memo<GroupNodeContentProps>(({ 
  hosts, 
  portForwards, 
  groupId, 
  onAddHost, 
  onAddPort, 
  hostHandlers, 
  portHandlers 
}) => {
  const hasHosts = hosts.length > 0;
  const hasPortForwards = portForwards.length > 0;

  return (
    <CardContent className="pt-0 space-y-3">
      {/* 主机列表 */}
      <HostList 
        hosts={hosts} 
        onAddHost={onAddHost} 
        groupId={groupId} 
        handlers={hostHandlers} 
      />

      {/* 端口转发列表 */}
      <PortForwardList 
        portForwards={portForwards} 
        onAddPort={onAddPort} 
        groupId={groupId} 
        handlers={portHandlers} 
      />

      {/* 空状态和添加按钮 */}
      <EmptyState 
        hasHosts={hasHosts}
        hasPortForwards={hasPortForwards}
        groupId={groupId}
        onAddHost={onAddHost}
        onAddPort={onAddPort}
      />
    </CardContent>
  );
});
