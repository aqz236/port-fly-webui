// EmptyState.tsx - 空状态组件
import { memo } from 'react';
import { Button } from '~/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { createEventHandler } from './utils';

interface EmptyStateProps {
  hasHosts: boolean;
  hasPortForwards: boolean;
  groupId: number;
  onAddHost: (groupId: number) => void;
  onAddPort: (groupId: number) => void;
}

export const EmptyState = memo<EmptyStateProps>(({ 
  hasHosts, 
  hasPortForwards, 
  groupId, 
  onAddHost, 
  onAddPort 
}) => {
  // 完全空状态
  if (!hasHosts && !hasPortForwards) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground">暂无资源</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={createEventHandler(onAddHost, groupId)}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加主机
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={createEventHandler(onAddPort, groupId)}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加端口
          </Button>
        </div>
      </div>
    );
  }

  // 只有端口转发，没有主机
  if (!hasHosts && hasPortForwards) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={createEventHandler(onAddHost, groupId)}
        className="w-full h-8 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        添加主机
      </Button>
    );
  }

  // 只有主机，没有端口转发
  if (hasHosts && !hasPortForwards) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={createEventHandler(onAddPort, groupId)}
        className="w-full h-8 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        添加端口转发
      </Button>
    );
  }

  return null;
});
