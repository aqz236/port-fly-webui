// EmptyProjectNode.tsx - 空项目状态节点
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Plus, Folder } from 'lucide-react';

export interface EmptyProjectNodeData {
  projectName: string;
  onCreateGroup: () => void;
}

export default memo(function EmptyProjectNode({ data }: NodeProps) {
  const { projectName, onCreateGroup } = data as unknown as EmptyProjectNodeData;

  return (
    <div className="min-w-[320px] max-w-[400px]">
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      <Card className="shadow-lg border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <Folder className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">开始构建 {projectName}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            创建第一个组来组织您的主机和端口转发规则
          </p>
          
          <Button onClick={onCreateGroup} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            创建第一个组
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 提示：</p>
            <p>• 组可以包含多台主机和端口转发</p>
            <p>• 支持拖拽调整布局</p>
            <p>• 可以导出/导入布局配置</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
