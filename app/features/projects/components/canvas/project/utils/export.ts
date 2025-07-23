// 数据导入导出相关的工具函数
import { GroupNodeState, LayoutExportData } from '../types';

const LAYOUT_VERSION = '1.0.0';

/**
 * 导出布局数据
 * @param projectId 项目ID
 * @param projectName 项目名称
 * @param groupStates 组状态
 */
export function exportLayoutData(
  projectId: number,
  projectName: string,
  groupStates: GroupNodeState
): void {
  const layoutData: LayoutExportData = {
    projectId,
    groupStates,
    timestamp: new Date().toISOString(),
    version: LAYOUT_VERSION,
  };
  
  const dataStr = JSON.stringify(layoutData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(projectName)}-layout.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * 导入布局数据
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export function importLayoutData(
  onSuccess: (groupStates: GroupNodeState) => void,
  onError?: (error: string) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const layoutData = JSON.parse(result) as LayoutExportData;
        
        // 验证数据格式
        if (!validateLayoutData(layoutData)) {
          throw new Error('无效的布局数据格式');
        }
        
        onSuccess(layoutData.groupStates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '导入布局失败';
        console.error('导入布局失败:', error);
        onError?.(errorMessage);
      }
    };
    
    reader.onerror = () => {
      const errorMessage = '读取文件失败';
      console.error(errorMessage);
      onError?.(errorMessage);
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

/**
 * 验证布局数据格式
 * @param data 布局数据
 * @returns 是否有效
 */
function validateLayoutData(data: any): data is LayoutExportData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.projectId === 'number' &&
    typeof data.groupStates === 'object' &&
    typeof data.timestamp === 'string'
  );
}

/**
 * 清理文件名，移除不安全字符
 * @param filename 原始文件名
 * @returns 清理后的文件名
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

/**
 * 获取布局数据的统计信息
 * @param groupStates 组状态
 * @returns 统计信息
 */
export function getLayoutStats(groupStates: GroupNodeState): {
  totalGroups: number;
  expandedGroups: number;
  collapsedGroups: number;
} {
  const groups = Object.values(groupStates);
  const expandedGroups = groups.filter(g => g.isExpanded).length;
  
  return {
    totalGroups: groups.length,
    expandedGroups,
    collapsedGroups: groups.length - expandedGroups,
  };
}
