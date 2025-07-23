// 空状态组件
import { Button } from '~/shared/components/ui/button';
import { Plus, Folder } from 'lucide-react';

interface CanvasEmptyStateProps {
  projectName: string;
  onCreateGroup: () => void;
}

export function CanvasEmptyState({ projectName, onCreateGroup }: CanvasEmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center bg-background/80 backdrop-blur-sm p-8 rounded-lg border shadow-sm max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
          <Folder className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">开始构建 {projectName}</h3>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          创建第一个组来组织您的主机和端口转发规则。
          组可以帮助您按环境、服务或任何逻辑方式管理资源。
        </p>
        
        <Button onClick={() => {
          onCreateGroup();
        }} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          创建第一个组
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p className="font-medium mb-2">💡 快速提示:</p>
          <p>• 拖拽节点可以调整布局</p>
          <p>• 点击展开/收起按钮控制组的显示</p>
          <p>• 使用工具栏进行自动布局</p>
          <p>• 支持导出/导入布局配置</p>
        </div>
      </div>
    </div>
  );
}
