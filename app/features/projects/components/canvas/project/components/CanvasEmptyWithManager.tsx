// 画布内嵌节点管理器空状态组件
import React, { useState } from 'react';
import { CanvasNodeManager } from '../../nodes/manager';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Plus, Grid } from 'lucide-react';

interface CanvasEmptyWithManagerProps {
  projectName: string;
  onNodeCreate?: (type: string, position: { x: number; y: number }) => void;
  onCreateGroup?: () => void;
}

/**
 * 带有内嵌节点管理器的空状态组件
 * 当项目没有groups时，提示用户先创建画布（Group）
 */
export function CanvasEmptyWithManager({
  projectName,
  onNodeCreate,
  onCreateGroup,
}: CanvasEmptyWithManagerProps) {
  const [showNodeManager, setShowNodeManager] = useState(false);

  const handleCreateCanvas = () => {
    onCreateGroup?.();
  };

  const handleStartWithNodes = () => {
    setShowNodeManager(true);
  };

  if (showNodeManager) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl w-full mx-4">
          {/* 返回选择 */}
          <div className="text-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowNodeManager(false)}
              className="mb-4"
            >
              ← 返回选择
            </Button>
          </div>

          {/* 项目信息 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              选择节点类型 - {projectName}
            </h1>
            <p className="text-muted-foreground">
              选择要创建的节点类型，系统将自动为您创建画布
            </p>
          </div>

          {/* 内嵌节点管理器 */}
          <CanvasNodeManager
            onNodeCreate={onNodeCreate}
            onClose={() => setShowNodeManager(false)}
            className="max-w-3xl mx-auto"
          />

          {/* 帮助提示 */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>💡 提示：选择节点后，系统将自动创建画布并添加节点</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4">
        {/* 项目信息 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            欢迎使用 {projectName}
          </h1>
          <p className="text-muted-foreground">
            开始您的 SSH 连接和端口转发项目
          </p>
        </div>

        {/* 选择创建方式 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 创建空画布 */}
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Grid className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">创建空画布</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                创建一个空的画布，稍后手动添加节点
              </p>
              <Button onClick={handleCreateCanvas} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                创建画布
              </Button>
            </CardContent>
          </Card>

          {/* 从节点开始 */}
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-secondary/50 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-lg">从节点开始</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                直接选择节点类型，系统自动创建画布
              </p>
              <Button onClick={handleStartWithNodes} variant="secondary" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                选择节点
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 概念说明 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">💡 概念说明</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>画布（Group）</strong>：一个独立的工作区域，用于组织相关的 SSH 连接</li>
            <li><strong>节点</strong>：画布上的具体元素，如主机连接、端口转发等</li>
            <li><strong>项目</strong>：可以包含多个画布，用于不同的环境或用途</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
