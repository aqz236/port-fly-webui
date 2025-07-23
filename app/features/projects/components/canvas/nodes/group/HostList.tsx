// HostList.tsx - 主机列表组件
import { memo } from 'react';
import { Button } from '~/shared/components/ui/button';
import { Plus, Server, Edit, Trash2 } from 'lucide-react';
import { Host } from '~/shared/types/host';
import { HostItemEventHandlers } from './types';
import { getStatusColor, createEventHandler } from './utils';

interface HostListProps {
  hosts: Host[];
  onAddHost: (groupId: number) => void;
  groupId: number;
  handlers: HostItemEventHandlers;
}

export const HostList = memo<HostListProps>(({ 
  hosts, 
  onAddHost, 
  groupId, 
  handlers 
}) => {
  const { onHostEdit, onHostDelete, onHostConnect } = handlers;

  if (hosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">主机</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onAddHost, groupId)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          添加
        </Button>
      </div>
      <div className="space-y-1">
        {hosts.map((host) => (
          <HostItem 
            key={host.id} 
            host={host} 
            handlers={handlers} 
          />
        ))}
      </div>
    </div>
  );
});

interface HostItemProps {
  host: Host;
  handlers: HostItemEventHandlers;
}

const HostItem = memo<HostItemProps>(({ host, handlers }) => {
  const { onHostEdit, onHostDelete, onHostConnect } = handlers;

  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(host.status)}`} />
        <span className="font-medium">{host.name}</span>
        <span className="text-muted-foreground">
          {host.username}@{host.hostname}:{host.port}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onHostConnect, host.id)}
          className="h-6 w-6 p-0"
          disabled={host.status === 'connecting'}
        >
          <Server className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onHostEdit, host)}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onHostDelete, host.id)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});
