// 画布内嵌节点管理器组件
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/shared/components/ui/card';
import {
  Button
} from '~/shared/components/ui/button';
import {
  Input
} from '~/shared/components/ui/input';
import {
  Badge
} from '~/shared/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/shared/components/ui/tabs';
import { Search, Plus, Grid, Layers } from 'lucide-react';
import { useNodeManagerStore } from './store';
import { NodeConfig } from './types';

interface CanvasNodeManagerProps {
  onNodeCreate?: (type: string, position: { x: number; y: number }) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * 节点类别选择组件
 */
function CategoryFilter() {
  const { 
    getCategories, 
    filters, 
    setSelectedCategory, 
    clearFilters 
  } = useNodeManagerStore();
  
  const categories = getCategories();
  const selectedCategoryId = filters.selectedCategoryId;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={!selectedCategoryId ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedCategory(undefined)}
      >
        全部
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(category.id)}
          style={{ 
            backgroundColor: selectedCategoryId === category.id ? category.color : undefined 
          }}
        >
          {category.name}
        </Button>
      ))}
      {(selectedCategoryId || filters.searchTerm || filters.selectedTags.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          清空筛选
        </Button>
      )}
    </div>
  );
}

/**
 * 节点卡片组件
 */
function NodeCard({ 
  config, 
  onSelect 
}: { 
  config: NodeConfig; 
  onSelect: (config: NodeConfig) => void;
}) {
  const { getCategoryById } = useNodeManagerStore();
  const category = getCategoryById(config.categoryId);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
      onClick={() => onSelect(config)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon && (
              <div className="w-6 h-6 flex items-center justify-center">
                {config.icon}
              </div>
            )}
            <CardTitle className="text-sm">{config.displayName}</CardTitle>
          </div>
          {category && (
            <Badge 
              variant="secondary"
              style={{ backgroundColor: category.color + '20', color: category.color }}
              className="text-xs"
            >
              {category.name}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {config.description}
        </CardDescription>
      </CardHeader>
      {config.tags && config.tags.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {config.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {config.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{config.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * 画布内嵌节点管理器主组件
 */
export function CanvasNodeManager({
  onNodeCreate,
  onClose,
  className = ""
}: CanvasNodeManagerProps) {
  const { 
    getFilteredConfigs, 
    filters, 
    setSearchTerm 
  } = useNodeManagerStore();
  
  const [selectedConfig, setSelectedConfig] = useState<NodeConfig | null>(null);
  const filteredConfigs = getFilteredConfigs();

  const handleNodeSelect = (config: NodeConfig) => {
    if (selectedConfig?.type === config.type) {
      // 如果点击相同的节点，取消选择
      setSelectedConfig(null);
    } else {
      setSelectedConfig(config);
    }
  };

  const handleCreateNode = () => {
    if (selectedConfig && onNodeCreate) {
      // 在画布中心位置创建节点
      const position = { x: 200, y: 200 };
      onNodeCreate(selectedConfig.type, position);
      setSelectedConfig(null);
      onClose?.();
    }
  };

  return (
    <div className={`bg-background border rounded-lg shadow-lg p-6 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">选择节点类型</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索节点类型..."
          value={filters.searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 类别筛选 */}
      <CategoryFilter />

      {/* 节点网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-64 overflow-y-auto">
        {filteredConfigs.map((config) => (
          <div key={config.type} className="relative">
            <NodeCard
              config={config}
              onSelect={handleNodeSelect}
            />
            {selectedConfig?.type === config.type && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {filteredConfigs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {filters.searchTerm || filters.selectedCategoryId || filters.selectedTags.length > 0
            ? '没有找到匹配的节点类型'
            : '暂无可用的节点类型'
          }
        </div>
      )}

      {/* 底部操作区 */}
      {selectedConfig && (
        <div className="border-t pt-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedConfig.icon && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      {selectedConfig.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{selectedConfig.displayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.description}
                    </p>
                  </div>
                </div>
                <Button onClick={handleCreateNode} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  创建节点
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
