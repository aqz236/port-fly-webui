// 画布空状态组件 - 引导用户创建节点
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Plus, Info } from 'lucide-react';

interface CanvasEmptyStateV2Props {
  projectName: string;
  onOpenNodeManager: () => void;
}

/**
 * 画布空状态组件V2 - 专注于节点创建
 */
export function CanvasEmptyStateV2({ 
  projectName, 
  onOpenNodeManager 
}: CanvasEmptyStateV2Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <Card className="max-w-md mx-4 shadow-lg border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>开始构建 {projectName}</CardTitle>
          <CardDescription>
            您的项目画布是空的。让我们开始添加一些节点来构建您的SSH连接架构。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">什么是节点？</p>
                <p className="text-muted-foreground">
                  节点代表您网络中的各种组件，如SSH主机、服务器、数据库等。通过连接这些节点，您可以可视化和管理整个基础设施。
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">您可以创建：</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• SSH主机节点 - 连接远程服务器</li>
              <li>• 服务节点 - 管理应用程序</li>
              <li>• 数据库节点 - 连接数据库</li>
              <li>• 自定义节点 - 满足特殊需求</li>
            </ul>
          </div>
          
          <Button 
            onClick={onOpenNodeManager}
            size="lg" 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建第一个节点
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
