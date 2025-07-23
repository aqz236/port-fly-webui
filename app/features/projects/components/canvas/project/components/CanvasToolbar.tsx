// 画布工具栏组件
import { Panel } from '@xyflow/react';
import { Button } from '~/shared/components/ui/button';
import { 
  Plus, 
  LayoutGrid, 
  Maximize2, 
  Download, 
  Upload,
  Circle,
  Grid3X3,
  TreePine
} from 'lucide-react';

interface CanvasToolbarProps {
  onCreateGroup: () => void;
  onAutoLayout: () => void;
  onGridLayout: () => void;
  onCircularLayout: () => void;
  onFitView: () => void;
  onExportLayout: () => void;
  onImportLayout: () => void;
}

export function CanvasToolbar({
  onCreateGroup,
  onAutoLayout,
  onGridLayout,
  onCircularLayout,
  onFitView,
  onExportLayout,
  onImportLayout,
}: CanvasToolbarProps) {
  return (
    <>
      {/* 主要工具面板 */}
      <Panel position="top-left" className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateGroup}
          title="创建新组"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建组
        </Button>
        
        <div className="flex gap-1 bg-background border rounded-md p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoLayout}
            title="自动网格布局"
            className="h-8 px-2"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGridLayout}
            title="网格布局"
            className="h-8 px-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCircularLayout}
            title="圆形布局"
            className="h-8 px-2"
          >
            <Circle className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onFitView}
          title="适应窗口"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          适应窗口
        </Button>
      </Panel>

      {/* 导入导出面板 */}
      <Panel position="top-right" className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportLayout}
          title="导出布局配置"
        >
          <Download className="h-4 w-4 mr-2" />
          导出布局
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onImportLayout}
          title="导入布局配置"
        >
          <Upload className="h-4 w-4 mr-2" />
          导入布局
        </Button>
      </Panel>
    </>
  );
}
