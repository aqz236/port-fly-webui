// 节点生成器Hook
import { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Project } from '~/shared/types/project';
import { GroupNodeData } from '../../nodes/group';
import { CanvasHandlers, GroupNodeState } from '../types';
import { calculateGridLayout, DEFAULT_LAYOUT_CONFIG } from '../utils/layout';

/**
 * 节点生成器Hook
 * @param project 项目数据
 * @param groupStates 组状态
 * @param handlers 操作处理器
 * @param handleToggleExpand 展开/收起处理器
 * @returns ReactFlow节点数组
 */
export function useNodeGenerator(
  project: Project,
  groupStates: GroupNodeState,
  handlers: CanvasHandlers,
  handleToggleExpand: (groupId: number) => void
): Node[] {
  return useMemo(() => {
    if (!project.groups || project.groups.length === 0) {
      return [];
    }

    const positions = calculateGridLayout(project.groups, DEFAULT_LAYOUT_CONFIG);

    return project.groups.map((group, index) => {
      const nodeState = groupStates[group.id] || { 
        isExpanded: true, 
        position: positions[index] 
      };
      
      // 获取该组的主机和端口转发
      const groupHosts = group.hosts || [];
      const groupPorts = group.port_forwards || [];

      const nodeData: GroupNodeData = {
        group,
        hosts: groupHosts,
        portForwards: groupPorts,
        isExpanded: nodeState.isExpanded,
        onEdit: handlers.handleEditGroup,
        onDelete: handlers.handleDeleteGroup,
        onAddHost: handlers.handleAddHost,
        onAddPort: handlers.handleAddPort,
        onToggleExpand: handleToggleExpand,
        onHostEdit: handlers.handleHostEdit,
        onHostDelete: handlers.handleHostDelete,
        onHostConnect: handlers.handleHostConnect,
        onPortEdit: handlers.handlePortEdit,
        onPortDelete: handlers.handlePortDelete,
        onPortToggle: handlers.handlePortToggle,
      };

      const node: Node = {
        id: `group-${group.id}`,
        type: 'groupNode',
        position: nodeState.position,
        data: nodeData as any,
        draggable: true,
        selectable: true,
      };

      return node;
    });
  }, [
    project.groups, 
    groupStates, 
    handlers.handleEditGroup,
    handlers.handleDeleteGroup,
    handlers.handleAddHost,
    handlers.handleAddPort,
    handleToggleExpand,
    handlers.handleHostEdit,
    handlers.handleHostDelete,
    handlers.handleHostConnect,
    handlers.handlePortEdit,
    handlers.handlePortDelete,
    handlers.handlePortToggle,
  ]);
}
