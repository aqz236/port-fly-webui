// 节点生成器Hook - 新架构（彻底移除 GroupNode 概念）
import { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Project } from '~/shared/types/project';
import { Host } from '~/shared/types/host';
import { HostNodeData } from '../../nodes/host/types';

/**
 * 画布处理器接口
 */
interface CanvasHandlers {
  handleHostEdit?: (host: Host) => void;
  handleHostDelete?: (hostId: number) => void;
  handleHostConnect?: (hostId: number) => void;
  handleHostDisconnect?: (hostId: number) => void;
}

/**
 * 布局配置
 */
interface LayoutConfig {
  nodeSpacing: {
    x: number;
    y: number;
  };
  gridColumns: number;
  startPosition: {
    x: number;
    y: number;
  };
}

const DEFAULT_LAYOUT: LayoutConfig = {
  nodeSpacing: {
    x: 300,
    y: 200,
  },
  gridColumns: 3,
  startPosition: {
    x: 100,
    y: 100,
  },
};

/**
 * 计算节点位置 - 简单网格布局
 */
function calculateNodePosition(index: number, layout: LayoutConfig = DEFAULT_LAYOUT) {
  const row = Math.floor(index / layout.gridColumns);
  const col = index % layout.gridColumns;
  
  return {
    x: layout.startPosition.x + col * layout.nodeSpacing.x,
    y: layout.startPosition.y + row * layout.nodeSpacing.y,
  };
}

/**
 * 节点生成器Hook - 新架构
 * 
 * 设计理念：
 * - Group 是数据组织概念，不是可视化节点
 * - 直接从 project.groups 中提取业务对象（hosts）创建可视化节点
 * - 使用简单的网格布局
 * - 专注于业务节点：主机、端口转发等
 * 
 * @param project 项目数据
 * @param handlers 操作处理器
 * @returns ReactFlow节点数组
 */
export function useNodeGenerator(
  project: Project,
  handlers: CanvasHandlers
): Node[] {
  return useMemo(() => {
    if (!project.groups || project.groups.length === 0) {
      return [];
    }

    const nodes: Node[] = [];
    let nodeIndex = 0;

    // 遍历所有 groups，提取其中的 hosts 创建节点
    project.groups.forEach((group) => {
      const groupHosts = group.hosts || [];

      groupHosts.forEach((host) => {
        const hostNodeData: HostNodeData = {
          host,
          projectId: project.id,
          onEdit: handlers.handleHostEdit,
          onDelete: handlers.handleHostDelete,
          onConnect: handlers.handleHostConnect,
          onDisconnect: handlers.handleHostDisconnect,
        };

        const position = calculateNodePosition(nodeIndex);

        const hostNode: Node = {
          id: `host-${host.id}`,
          type: 'hostV2', // 使用新版本的 hostV2
          position,
          data: hostNodeData as any, // ReactFlow 的 Node data 类型比较宽泛
          draggable: true,
          selectable: true,
        };

        nodes.push(hostNode);
        nodeIndex++;
      });
    });

    return nodes;
  }, [
    project.groups,
    project.id,
    handlers.handleHostEdit,
    handlers.handleHostDelete,
    handlers.handleHostConnect,
    handlers.handleHostDisconnect,
  ]);
}
