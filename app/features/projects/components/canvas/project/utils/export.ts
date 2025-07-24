// 数据导入导出相关的工具函数 - 新架构版本
import { Node, Edge } from '@xyflow/react';

const LAYOUT_VERSION = '2.0.0';

/**
 * 布局导出数据接口
 */
interface LayoutExportData {
  projectId: number;
  nodes: Node[];
  edges: Edge[];
  timestamp: string;
  version: string;
  metadata?: {
    projectName?: string;
    nodeCount: number;
    edgeCount: number;
  };
}

/**
 * 文件名净化函数
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * 导出布局数据
 * @param projectId 项目ID
 * @param projectName 项目名称
 * @param nodes ReactFlow 节点数组
 * @param edges ReactFlow 边数组
 */
export function exportLayoutData(
  projectId: number,
  projectName: string,
  nodes: Node[],
  edges: Edge[] = []
): void {
  const layoutData: LayoutExportData = {
    projectId,
    nodes,
    edges,
    timestamp: new Date().toISOString(),
    version: LAYOUT_VERSION,
    metadata: {
      projectName,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
  };
  
  const dataStr = JSON.stringify(layoutData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(projectName)}-layout-v2.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * 导入布局数据
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export function importLayoutData(
  onSuccess: (nodes: Node[], edges: Edge[]) => void,
  onError?: (error: string) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as LayoutExportData;
        
        // 验证数据格式
        if (!validateLayoutData(data)) {
          throw new Error('无效的布局数据格式');
        }
        
        // 向后兼容性检查
        if (data.version === '1.0.0') {
          onError?.('这是旧版本的布局文件，请使用新架构重新导出');
          return;
        }
        
        onSuccess(data.nodes, data.edges);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '导入失败';
        onError?.(errorMessage);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

/**
 * 验证布局数据
 */
function validateLayoutData(data: any): data is LayoutExportData {
  return (
    data &&
    typeof data.projectId === 'number' &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges) &&
    typeof data.timestamp === 'string' &&
    typeof data.version === 'string'
  );
}

/**
 * 导出节点位置数据（轻量级）
 */
export function exportNodePositions(
  projectId: number,
  projectName: string,
  nodes: Node[]
): void {
  const positionData = {
    projectId,
    positions: nodes.reduce((acc, node) => {
      acc[node.id] = node.position;
      return acc;
    }, {} as Record<string, { x: number; y: number }>),
    timestamp: new Date().toISOString(),
    version: LAYOUT_VERSION,
  };
  
  const dataStr = JSON.stringify(positionData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(projectName)}-positions.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * 导入节点位置数据
 */
export function importNodePositions(
  onSuccess: (positions: Record<string, { x: number; y: number }>) => void,
  onError?: (error: string) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!data.positions || typeof data.positions !== 'object') {
          throw new Error('无效的位置数据格式');
        }
        
        onSuccess(data.positions);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '导入失败';
        onError?.(errorMessage);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}
