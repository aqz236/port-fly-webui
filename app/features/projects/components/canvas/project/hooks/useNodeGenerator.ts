// 节点生成器Hook
import { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Project } from '~/shared/types/project';
import { GroupNodeData } from '../../nodes/group';
import { HostNodeData } from '../../nodes/host/types';
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
    const nodes: Node[] = [];

    project.groups.forEach((group, groupIndex) => {
      const nodeState = groupStates[group.id] || { 
        isExpanded: true, 
        position: positions[groupIndex] 
      };
      
      // 获取该组的主机和端口转发
      const groupHosts = group.hosts || [];
      const groupPorts = group.port_forwards || [];

      // 创建组节点
      const groupNodeData: GroupNodeData = {
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

      const groupNode: Node = {
        id: `group-${group.id}`,
        type: 'groupNode',
        position: nodeState.position,
        data: groupNodeData as any,
        draggable: true,
        selectable: true,
      };

      nodes.push(groupNode);

      // 如果组是展开的，为每个主机创建独立的主机节点
      if (nodeState.isExpanded && groupHosts.length > 0) {
        groupHosts.forEach((host, hostIndex) => {
          const hostNodeData: HostNodeData = {
            host,
            projectId: project.id,
            onEdit: handlers.handleHostEdit,
            onDelete: handlers.handleHostDelete,
            onConnect: handlers.handleHostConnect,
            onDisconnect: handlers.handleHostDisconnect,
          };

          const hostNode: Node = {
            id: `host-${host.id}`,
            type: 'hostNode',
            position: {
              x: nodeState.position.x + 50 + (hostIndex % 2) * 300,
              y: nodeState.position.y + 200 + Math.floor(hostIndex / 2) * 150,
            },
            data: hostNodeData as any,
            draggable: true,
            selectable: true,
            parentId: `group-${group.id}`,
          };

          nodes.push(hostNode);
        });
      }
    });

    return nodes;
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
