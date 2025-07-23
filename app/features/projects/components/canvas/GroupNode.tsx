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
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-48 hover:shadow-xl transition-shadow">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-white" 
      />
      
      <div className="flex items-center gap-3">
        <div 
          className="rounded-full w-12 h-12 flex justify-center items-center text-white text-xl shadow-md"
          style={{ backgroundColor: group.color || '#10b981' }}
        >
          📁
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold text-gray-900 truncate">{group.name}</div>
          <div className="text-gray-500 text-sm truncate">{group.description || '这是一个测试组'}</div>
          {stats && (
            <div className="text-xs text-gray-400 mt-1">
              主机: {stats.hostCount} | 端口: {stats.portCount}
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-white" 
      />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
