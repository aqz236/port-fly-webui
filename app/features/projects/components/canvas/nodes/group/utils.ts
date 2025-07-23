// utils.ts - GroupNode 工具函数
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    case 'active': return 'bg-green-500';
    case 'inactive': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

export const createEventHandler = (
  callback: (...args: any[]) => void,
  ...args: any[]
) => (e: React.MouseEvent) => {
  e.stopPropagation();
  callback(...args);
};
