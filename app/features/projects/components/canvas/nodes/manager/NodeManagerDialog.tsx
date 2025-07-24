// 节点管理器对话框组件
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/shared/components/ui/dialog';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/shared/components/ui/card';
import { Search, Plus, Settings, Grid } from 'lucide-react';
import { useNodeManagerStore } from './store';
import { NodeConfig, BaseNodeData } from './types';

interface NodeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNodeCreate?: (type: string, position: { x: number; y: number }) => void;
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
      className="cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
      onClick={() => onSelect(config)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(config);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`选择 ${config.displayName} 节点`}
    >
      <CardHeader className="pb-2">
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
 * 节点创建面板
 */
function CreateNodePanel({ 
  onNodeCreate 
}: { 
  onNodeCreate?: (type: string, position: { x: number; y: number }) => void;
}) {
  const { 
    getFilteredConfigs, 
    filters, 
    setSearchTerm 
  } = useNodeManagerStore();
  
  const [selectedConfig, setSelectedConfig] = useState<NodeConfig | null>(null);
  const filteredConfigs = getFilteredConfigs();

  const handleNodeSelect = (config: NodeConfig) => {
    setSelectedConfig(config);
  };

  const handleCreateNode = () => {
    if (selectedConfig && onNodeCreate) {
      // 默认位置，实际应该根据画布当前视图计算
      const position = { x: 100, y: 100 };
      onNodeCreate(selectedConfig.type, position);
      setSelectedConfig(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索节点类型..."
          value={filters.searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
          autoFocus={false}
          tabIndex={0}
        />
      </div>

      {/* 类别筛选 */}
      <CategoryFilter />

      {/* 节点列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredConfigs.map((config) => (
          <NodeCard
            key={config.type}
            config={config}
            onSelect={handleNodeSelect}
          />
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

      {/* 选中的节点详情 */}
      {selectedConfig && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>创建 {selectedConfig.displayName}</span>
              <Button onClick={handleCreateNode}>
                <Plus className="w-4 h-4 mr-2" />
                创建节点
              </Button>
            </CardTitle>
            <CardDescription>
              {selectedConfig.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

/**
 * 节点管理面板
 */
function ManageNodesPanel() {
  const { 
    nodes, 
    getNodeConfigs, 
    getCategoryById,
    deleteNode,
    duplicateNode 
  } = useNodeManagerStore();
  
  const nodeConfigs = getNodeConfigs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    return nodes.filter(node => {
      const nodeData = node.data as BaseNodeData;
      return (
        nodeData.label?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        nodeData.description?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [nodes, searchTerm]);

  const getNodeConfig = (type: string) => 
    nodeConfigs.find(config => config.type === type);

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索现有节点..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
          autoFocus={false}
          tabIndex={0}
        />
      </div>

      {/* 节点列表 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNodes.map((node) => {
          const config = node.type ? getNodeConfig(node.type) : null;
          const category = config ? getCategoryById(config.categoryId) : null;
          const nodeData = node.data as BaseNodeData;
          
          return (
            <Card key={node.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {config?.icon && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        {config.icon}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{nodeData.label || 'Untitled'}</div>
                      <div className="text-sm text-muted-foreground">
                        {nodeData.description || config?.description || 'No description'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                        {category && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: category.color + '20', 
                              color: category.color 
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                        {nodeData.status && (
                          <Badge 
                            variant={nodeData.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {String(nodeData.status)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateNode(node.id)}
                    >
                      复制
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteNode(node.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? '没有找到匹配的节点' : '画布中暂无节点'}
        </div>
      )}
    </div>
  );
}

/**
 * 统计面板
 */
function StatsPanel() {
  const { 
    nodes, 
    getCategories, 
    getNodeConfigs,
    getCategoryById 
  } = useNodeManagerStore();
  
  const categories = getCategories();
  const nodeConfigs = getNodeConfigs();

  // 统计各类别的节点数量
  const categoryStats = useMemo(() => {
    const stats: Record<string, { category: any; count: number }> = {};
    
    categories.forEach(category => {
      stats[category.id] = { category, count: 0 };
    });

    nodes.forEach(node => {
      const config = nodeConfigs.find(c => c.type === node.type);
      if (config && stats[config.categoryId]) {
        stats[config.categoryId].count++;
      }
    });

    return Object.values(stats);
  }, [nodes, categories, nodeConfigs]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">总节点数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{nodes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">节点类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{nodeConfigs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>各类别统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryStats.map(({ category, count }) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 节点管理器对话框主组件
 */
export function NodeManagerDialog({
  open,
  onOpenChange,
  onNodeCreate
}: NodeManagerDialogProps) {
  // 当对话框关闭时重置状态
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-hidden focus:outline-none"
        onInteractOutside={(e) => {
          // 允许点击外部关闭，但确保焦点管理正确
          e.preventDefault();
          handleOpenChange(false);
        }}
        aria-labelledby="node-manager-title"
        aria-describedby="node-manager-description"
      >
        <DialogHeader>
          <DialogTitle id="node-manager-title" className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            节点管理器
          </DialogTitle>
          <DialogDescription id="node-manager-description">
            创建、管理和配置画布节点
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="create" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="create">创建节点</TabsTrigger>
              <TabsTrigger value="manage">管理节点</TabsTrigger>
              <TabsTrigger value="stats">统计信息</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 overflow-auto flex-1">
              <TabsContent 
                value="create" 
                className="mt-0 h-full focus:outline-none"
                tabIndex={-1}
              >
                <CreateNodePanel onNodeCreate={onNodeCreate} />
              </TabsContent>
              
              <TabsContent 
                value="manage" 
                className="mt-0 h-full focus:outline-none"
                tabIndex={-1}
              >
                <ManageNodesPanel />
              </TabsContent>
              
              <TabsContent 
                value="stats" 
                className="mt-0 h-full focus:outline-none"
                tabIndex={-1}
              >
                <StatsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
