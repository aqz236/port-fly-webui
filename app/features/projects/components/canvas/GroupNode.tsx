// Group 节点组件 - 按照 ReactFlow 最佳实践
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GroupNodeData } from './types';

interface GroupNodeProps {
  data: GroupNodeData;
  selected?: boolean;
}

export const GroupNode = memo(({ data, selected }: GroupNodeProps) => {
  const { group, stats } = data;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      
      <div className="flex">
        <div 
          className="rounded-full w-12 h-12 flex justify-center items-center text-white text-lg"
          style={{ backgroundColor: group.color }}
        >
          📁
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{group.name}</div>
          <div className="text-gray-500 text-sm">{group.description || '无描述'}</div>
          {stats && (
            <div className="text-xs text-gray-400 mt-1">
              主机: {stats.hostCount} | 端口: {stats.portCount}
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
