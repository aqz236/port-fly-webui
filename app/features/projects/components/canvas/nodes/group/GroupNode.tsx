// GroupNode.tsx - 重构后的主要组节点组件
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '~/shared/components/ui/card';

import { GroupNodeHeader } from './GroupNodeHeader';
import { GroupNodeContent } from './GroupNodeContent';
import { GroupNodeData } from './types';

/**
 * 组节点主组件
 */
export const GroupNode = memo(function GroupNode({ data }: NodeProps) {
  const { 
    group, 
    hosts, 
    portForwards, 
    isExpanded = true,
    onEdit,
    onDelete,
    onAddHost,
    onAddPort,
    onToggleExpand,
    onHostEdit,
    onHostDelete,
    onHostConnect,
    onPortEdit,
    onPortDelete,
    onPortToggle
  } = data as unknown as GroupNodeData;

  const groupHandlers = {
    onEdit,
    onDelete,
    onAddHost,
    onAddPort,
    onToggleExpand
  };

  const hostHandlers = {
    onHostEdit,
    onHostDelete,
    onHostConnect
  };

  const portHandlers = {
    onPortEdit,
    onPortDelete,
    onPortToggle
  };

  return (
    <div className="min-w-[320px] max-w-[400px]">
      {/* 连接点 */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!bg-gray-400 border-2 border-white"
        style={{ width: '12px', height: '12px' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 border-2 border-white"
        style={{ width: '12px', height: '12px' }}
      />

      <Card className="shadow-lg border-2 hover:border-primary/20 transition-colors">
        <GroupNodeHeader
          group={group}
          hosts={hosts}
          portForwards={portForwards}
          isExpanded={isExpanded}
          handlers={groupHandlers}
        />

        {isExpanded && (
          <GroupNodeContent
            hosts={hosts}
            portForwards={portForwards}
            groupId={group.id}
            onAddHost={onAddHost}
            onAddPort={onAddPort}
            hostHandlers={hostHandlers}
            portHandlers={portHandlers}
          />
        )}
      </Card>
    </div>
  );
});

export default GroupNode;
