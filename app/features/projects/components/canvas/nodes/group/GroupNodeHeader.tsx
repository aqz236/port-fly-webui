// GroupNodeHeader.tsx - 组节点头部组件
import { memo } from 'react';
import { CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { 
  Folder, 
  Server, 
  Network,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';
import { GroupNodeEventHandlers } from './types';
import { createEventHandler } from './utils';

interface GroupNodeHeaderProps {
  group: Group;
  hosts: Host[];
  portForwards: PortForward[];
  isExpanded: boolean;
  handlers: GroupNodeEventHandlers;
}

export const GroupNodeHeader = memo<GroupNodeHeaderProps>(({ 
  group, 
  hosts, 
  portForwards, 
  isExpanded, 
  handlers 
}) => {
  const {
    onEdit,
    onDelete,
    onAddHost,
    onAddPort,
    onToggleExpand
  } = handlers;

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: group.color }}
          >
            <Folder className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(group.id)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={createEventHandler(onEdit, group)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={createEventHandler(onDelete, group.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 统计信息 */}
      <div className="flex gap-2 mt-2">
        <Badge variant="secondary" className="text-xs">
          <Server className="h-3 w-3 mr-1" />
          {hosts.length} 主机
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Network className="h-3 w-3 mr-1" />
          {portForwards.length} 端口
        </Badge>
      </div>
    </CardHeader>
  );
});
