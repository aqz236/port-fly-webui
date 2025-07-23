import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "@remix-run/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";
import { Button } from "~/shared/components/ui/button";
import { X, FileText, Folder, Terminal, Home } from "lucide-react";
import { useProjects } from "~/shared/api/hooks";
import { useLayoutStore, TabItem } from "~/store/slices/layoutStore";
import { cn } from "~/lib/utils";

interface DraggableTabProps {
  tab: TabItem;
  isActive: boolean;
  onTabClose: (tabId: string, event: React.MouseEvent) => void;
}

function DraggableTab({ tab, isActive, onTabClose }: DraggableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // 拖拽时禁用transition，提高性能
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'overview':
        return <Home className="h-4 w-4" />;
      case 'project':
        return <Folder className="h-4 w-4" />;
      case 'group':
        return <FileText className="h-4 w-4" />;
      case 'terminal':
        return <Terminal className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center transition-all duration-200 select-none",
        isDragging && "opacity-60 z-50 shadow-lg scale-105"
      )}
      {...attributes}
      {...listeners}
    >
      {/* 标签页触发器 */}
      <TabsTrigger
        value={tab.id}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2.5 h-10 min-w-0 cursor-pointer",
          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          "hover:bg-muted/60 transition-all duration-200 rounded-t-md border-0",
          "border-b-2 border-transparent data-[state=active]:border-primary",
          isDragging && "cursor-grabbing"
        )}
        style={{
          borderBottomColor: isActive ? tab.color || '#3b82f6' : 'transparent',
        }}
      >
        {/* 图标 */}
        <div className={cn(
          "flex-shrink-0 transition-colors duration-200",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {getTabIcon(tab.type)}
        </div>
        
        {/* 标题 */}
        <span className={cn(
          "max-w-32 truncate text-sm font-medium transition-colors duration-200",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {tab.title}
        </span>
      </TabsTrigger>

      {/* 关闭按钮 */}
      {tab.closable && (
        <button
          className={cn(
            "flex-shrink-0 h-5 w-5 p-0 ml-1 mr-2 rounded-sm",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground",
            "flex items-center justify-center",
            isActive && "opacity-60 hover:opacity-100"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTabClose(tab.id, e);
          }}
          onMouseDown={(e) => e.stopPropagation()} // 防止触发拖拽
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

interface DraggableTabBrowserProps {
  children: React.ReactNode;
}

export function DraggableTabBrowser({ children }: DraggableTabBrowserProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: projects = [] } = useProjects();
  const {
    tabs,
    activeTab,
    addTab,
    removeTab,
    reorderTabs,
    setActiveTab,
    getProjectById,
    getGroupById
  } = useLayoutStore();

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 增加激活距离，减少误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 根据当前路径解析标签页信息
  const parseCurrentPath = (): Omit<TabItem, 'order'> | null => {
    const pathname = location.pathname;
    
    if (pathname === '/app' || pathname === '/app/') {
      return {
        id: 'overview',
        title: '概览',
        path: '/app',
        type: 'overview',
        color: '#3b82f6',
        closable: false
      };
    }
    
    const projectMatch = pathname.match(/^\/app\/project\/(\d+)$/);
    if (projectMatch) {
      const projectId = parseInt(projectMatch[1]);
      const project = getProjectById(projectId);
      return {
        id: `project-${projectId}`,
        title: project?.name || `项目 ${projectId}`,
        path: pathname,
        type: 'project',
        color: project?.color || '#10b981',
        closable: true
      };
    }
    
    const groupMatch = pathname.match(/^\/app\/group\/(\d+)$/);
    if (groupMatch) {
      const groupId = parseInt(groupMatch[1]);
      const group = getGroupById(groupId);
      return {
        id: `group-${groupId}`,
        title: group?.name || `组 ${groupId}`,
        path: pathname,
        type: 'group',
        color: group?.color || '#f59e0b',
        closable: true
      };
    }
    
    const terminalMatch = pathname.match(/^\/app\/terminal\/(\d+)$/);
    if (terminalMatch) {
      const hostId = parseInt(terminalMatch[1]);
      return {
        id: `terminal-${hostId}`,
        title: `终端 ${hostId}`,
        path: pathname,
        type: 'terminal',
        color: '#8b5cf6',
        closable: true
      };
    }
    
    return null;
  };

  // 监听路由变化，添加或激活标签页
  useEffect(() => {
    const currentTab = parseCurrentPath();
    if (!currentTab) return;

    addTab(currentTab);
    setActiveTab(currentTab.id);
  }, [location.pathname, projects, addTab, setActiveTab]);

  // 排序后的标签页列表
  const sortedTabs = useMemo(() => {
    return [...tabs].sort((a, b) => a.order - b.order);
  }, [tabs]);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // 恢复页面滚动
    document.body.style.overflow = '';

    if (active.id !== over?.id) {
      const oldIndex = sortedTabs.findIndex(tab => tab.id === active.id);
      const newIndex = sortedTabs.findIndex(tab => tab.id === over?.id);
      
      const newOrder = arrayMove(sortedTabs, oldIndex, newIndex);
      const newTabIds = newOrder.map(tab => tab.id);
      
      reorderTabs(newTabIds);
    }
  };

  // 切换标签页
  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  };

  // 关闭标签页
  const handleTabClose = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    removeTab(tabId);
    
    // 如果关闭的是当前活动标签页，导航到下一个标签页或概览
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        const currentIndex = sortedTabs.findIndex(t => t.id === tabId);
        let nextTab;
        if (currentIndex > 0) {
          nextTab = sortedTabs[currentIndex - 1];
        } else {
          nextTab = sortedTabs[1] || sortedTabs[0]; // 跳过当前要删除的
        }
        if (nextTab && nextTab.id !== tabId) {
          navigate(nextTab.path);
        }
      } else {
        navigate('/app');
      }
    }
  };

  if (sortedTabs.length === 0) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 标签页栏 */}
      <div className="border-b bg-background">
        <Tabs value={activeTab || ''} onValueChange={handleTabClick} className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => {
              // 拖拽开始时禁用页面滚动
              document.body.style.overflow = 'hidden';
            }}
            onDragCancel={() => {
              // 拖拽取消时恢复页面滚动
              document.body.style.overflow = '';
            }}
          >
            <SortableContext 
              items={sortedTabs.map(tab => tab.id)} 
              strategy={horizontalListSortingStrategy}
            >
              <TabsList className="h-auto p-0 bg-transparent w-full justify-start rounded-none border-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-stretch min-w-max">
                  {sortedTabs.map((tab) => (
                    <DraggableTab
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onTabClose={handleTabClose}
                    />
                  ))}
                </div>
              </TabsList>
            </SortableContext>
          </DndContext>
        </Tabs>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
