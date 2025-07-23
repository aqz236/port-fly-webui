// PortForwardList.tsx - 端口转发列表组件
import { memo } from 'react';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { Plus, Network, Edit, Trash2 } from 'lucide-react';
import { PortForward } from '~/shared/types/port-forward';
import { PortItemEventHandlers } from './types';
import { getStatusColor, createEventHandler } from './utils';

interface PortForwardListProps {
  portForwards: PortForward[];
  onAddPort: (groupId: number) => void;
  groupId: number;
  handlers: PortItemEventHandlers;
}

export const PortForwardList = memo<PortForwardListProps>(({ 
  portForwards, 
  onAddPort, 
  groupId, 
  handlers 
}) => {
  const { onPortEdit, onPortDelete, onPortToggle } = handlers;

  if (portForwards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">端口转发</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onAddPort, groupId)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          添加
        </Button>
      </div>
      <div className="space-y-1">
        {portForwards.map((port) => (
          <PortForwardItem 
            key={port.id} 
            port={port} 
            handlers={handlers} 
          />
        ))}
      </div>
    </div>
  );
});

interface PortForwardItemProps {
  port: PortForward;
  handlers: PortItemEventHandlers;
}

const PortForwardItem = memo<PortForwardItemProps>(({ port, handlers }) => {
  const { onPortEdit, onPortDelete, onPortToggle } = handlers;

  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(port.status)}`} />
        <span className="font-medium">{port.name}</span>
        <Badge variant="outline" className="text-xs">
          {port.type.toUpperCase()}
        </Badge>
        <span className="text-muted-foreground font-mono">
          :{port.local_port} → {port.remote_host}:{port.remote_port}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onPortToggle, port.id)}
          className="h-6 w-6 p-0"
        >
          <Network className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onPortEdit, port)}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={createEventHandler(onPortDelete, port.id)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});
