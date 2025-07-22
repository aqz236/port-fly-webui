/**
 * Project Tree Data Adapter
 * 
 * 负责将 Project 数据转换为树组件使用的格式
 */

import type { Project } from "~/types/api";
import type { TreeDataAdapter, ProjectTreeNode } from "./types";

/**
 * 项目树数据适配器
 */
export class ProjectTreeAdapter implements TreeDataAdapter<Project> {
  /**
   * 将项目数据转换为树节点
   */
  toTreeNodes(projects: Project[]): ProjectTreeNode[] {
    const nodeMap = new Map<string, ProjectTreeNode>();
    const rootChildren: string[] = [];

    // 第一步：创建所有节点
    projects.forEach(project => {
      const nodeId = project.id.toString();
      const hasChildren = projects.some(p => p.parent_id === project.id);
      
      const node: ProjectTreeNode = {
        id: nodeId,
        name: project.name,
        isFolder: hasChildren,
        children: [],
        canMove: true,
        canRename: true,
        sort: project.sort,
        parentId: project.parent_id?.toString(),
        level: project.level,
        project,
        type: 'project',
      };
      
      nodeMap.set(nodeId, node);
    });

    // 第二步：建立父子关系
    projects.forEach(project => {
      const nodeId = project.id.toString();
      const node = nodeMap.get(nodeId);
      if (!node) return;

      if (project.parent_id) {
        const parentId = project.parent_id.toString();
        const parentNode = nodeMap.get(parentId);
        if (parentNode) {
          parentNode.children.push(nodeId);
          parentNode.isFolder = true; // 确保有子节点的父节点被标记为文件夹
        }
      } else {
        // 根级节点
        rootChildren.push(nodeId);
      }
    });

    // 第三步：对每个节点的子节点按 sort 排序
    nodeMap.forEach(node => {
      if (node.children.length > 0) {
        node.children.sort((a, b) => {
          const nodeA = nodeMap.get(a);
          const nodeB = nodeMap.get(b);
          return (nodeA?.sort || 0) - (nodeB?.sort || 0);
        });
      }
    });

    // 创建根节点
    const rootNode = this.createRootNode();
    rootNode.children = rootChildren.sort((a, b) => {
      const nodeA = nodeMap.get(a);
      const nodeB = nodeMap.get(b);
      return (nodeA?.sort || 0) - (nodeB?.sort || 0);
    });

    return [rootNode, ...Array.from(nodeMap.values())];
  }

  /**
   * 乐观更新树节点 - 在API调用之前立即更新本地状态
   */
  optimisticUpdateNodes(
    nodes: ProjectTreeNode[],
    movedNodeId: string,
    newParentId: string | undefined,
    position: number
  ): ProjectTreeNode[] {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [...node.children] }]));
    const movedNode = nodeMap.get(movedNodeId);
    
    if (!movedNode) return nodes;

    // 从原父节点中移除
    if (movedNode.parentId) {
      const oldParent = nodeMap.get(movedNode.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== movedNodeId);
        // 如果原父节点没有子节点了，更新其 isFolder 状态
        oldParent.isFolder = oldParent.children.length > 0;
      }
    } else {
      // 从根节点移除
      const rootNode = nodeMap.get('root');
      if (rootNode) {
        rootNode.children = rootNode.children.filter(id => id !== movedNodeId);
      }
    }

    // 添加到新父节点
    movedNode.parentId = newParentId;
    
    if (newParentId) {
      const newParent = nodeMap.get(newParentId);
      if (newParent) {
        // 在指定位置插入
        const insertIndex = Math.min(position, newParent.children.length);
        newParent.children.splice(insertIndex, 0, movedNodeId);
        // 确保新父节点被标记为文件夹
        newParent.isFolder = true;
      }
    } else {
      // 添加到根节点
      const rootNode = nodeMap.get('root');
      if (rootNode) {
        const insertIndex = Math.min(position, rootNode.children.length);
        rootNode.children.splice(insertIndex, 0, movedNodeId);
      }
    }

    return Array.from(nodeMap.values());
  }

  /**
   * 将树节点转换回项目数据格式
   */
  fromTreeNode(node: ProjectTreeNode): Project {
    if (!node.project) {
      throw new Error(`Node ${node.id} does not have associated project data`);
    }
    return node.project;
  }

  /**
   * 创建根节点
   */
  createRootNode(): ProjectTreeNode {
    return {
      id: 'root',
      name: 'Projects',
      isFolder: true,
      children: [],
      canMove: false,
      canRename: false,
      sort: 0,
      level: 0,
      type: 'root',
    };
  }

  /**
   * 从节点数组中构建映射表
   */
  buildNodeMap(nodes: ProjectTreeNode[]): Map<string, ProjectTreeNode> {
    const map = new Map<string, ProjectTreeNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }

  /**
   * 获取节点的所有祖先节点ID
   */
  getAncestorIds(nodeId: string, nodeMap: Map<string, ProjectTreeNode>): string[] {
    const ancestors: string[] = [];
    let currentNode = nodeMap.get(nodeId);
    
    while (currentNode?.parentId) {
      ancestors.unshift(currentNode.parentId);
      currentNode = nodeMap.get(currentNode.parentId);
    }
    
    return ancestors;
  }

  /**
   * 获取节点的所有后代节点ID
   */
  getDescendantIds(nodeId: string, nodeMap: Map<string, ProjectTreeNode>): string[] {
    const descendants: string[] = [];
    const node = nodeMap.get(nodeId);
    
    if (!node) return descendants;
    
    const traverse = (currentNodeId: string) => {
      const currentNode = nodeMap.get(currentNodeId);
      if (!currentNode) return;
      
      currentNode.children.forEach(childId => {
        descendants.push(childId);
        traverse(childId);
      });
    };
    
    traverse(nodeId);
    return descendants;
  }

  /**
   * 检查节点是否可以移动到目标位置
   */
  canMoveNode(
    nodeId: string, 
    targetParentId: string | undefined, 
    nodeMap: Map<string, ProjectTreeNode>
  ): boolean {
    const node = nodeMap.get(nodeId);
    if (!node?.canMove) return false;

    // 不能移动到自己
    if (nodeId === targetParentId) return false;

    // 不能移动到自己的后代节点
    if (targetParentId) {
      const descendants = this.getDescendantIds(nodeId, nodeMap);
      if (descendants.includes(targetParentId)) return false;
    }

    return true;
  }

  /**
   * 计算移动后的新位置
   */
  calculateNewPosition(
    parentId: string | undefined,
    position: number,
    nodeMap: Map<string, ProjectTreeNode>
  ): number {
    if (!parentId) {
      // 移动到根级别
      const rootNode = nodeMap.get('root');
      return Math.max(0, Math.min(position, rootNode?.children.length || 0));
    }

    const parentNode = nodeMap.get(parentId);
    if (!parentNode) return 0;
    
    return Math.max(0, Math.min(position, parentNode.children.length));
  }
}
