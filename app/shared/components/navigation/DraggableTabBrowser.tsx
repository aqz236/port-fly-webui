import React, { useEffect, useMemo, useState } from "react";
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
import { X, FileText, Folder, Terminal, Home } from "lucide-react";
import { useProjects } from "~/shared/api/hooks";
import { useLayoutStore, TabItem } from "~/store/slices/layoutStore";
import { cn } from "~/lib/utils";
import { SidebarTrigger } from "~/shared/components/ui/sidebar";
import { Separator } from "~/shared/components/ui/separator";

interface ChromeTabProps {
  tab: TabItem;
  isActive: boolean;
  onTabClose: (id: string, event: React.MouseEvent) => void;
  onTabClick: (id: string) => void;
}

interface DraggableTabBrowserProps {
  children: React.ReactNode;
}

// Chrome 风格的标签页组件
function ChromeTab({ tab, isActive, onTabClose, onTabClick }: ChromeTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
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

  // Chrome 标签页的 SVG 路径
  const createTabPath = (width: number, height: number, isActive: boolean) => {
    const radius = 8;
    const angleOffset = 4;
    
    if (isActive) {
      return `
        M ${angleOffset},${height}
        L ${angleOffset},${radius}
        Q ${angleOffset},0 ${angleOffset + radius},0
        L ${width - radius - angleOffset},0
        Q ${width - angleOffset},0 ${width - angleOffset},${radius}
        L ${width - angleOffset},${height}
        Z
      `;
    } else {
      return `
        M ${angleOffset + 4},${height}
        L ${angleOffset + 4},${radius + 2}
        Q ${angleOffset + 4},2 ${angleOffset + radius + 4},2
        L ${width - radius - angleOffset - 4},2
        Q ${width - angleOffset - 4},2 ${width - angleOffset - 4},${radius + 2}
        L ${width - angleOffset - 4},${height}
        Z
      `;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group select-none chrome-tab-width-transition",
        isDragging ? "opacity-60 z-50 chrome-tab-dragging" : isActive ? "z-10" : "z-0",
        "transition-all duration-200"
      )}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chrome 风格的标签页背景 */}
      <div className={cn(
        "relative h-10 chrome-tab",
        "w-48 max-w-48 min-w-24"
      )}>
        {/* SVG 背景 */}
        <svg
          className={cn(
            "absolute inset-0 w-full h-full chrome-tab-shape",
            isDragging && "scale-105"
          )}
          viewBox="0 0 192 40"
          preserveAspectRatio="none"
        >
          <defs>
            {/* 活动标签页渐变 */}
            <linearGradient id={`active-gradient-${tab.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(255, 255, 255)" />
              <stop offset="100%" stopColor="rgb(248, 250, 252)" />
            </linearGradient>
            
            {/* 非活动标签页渐变 */}
            <linearGradient id={`inactive-gradient-${tab.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(241, 245, 249)" />
              <stop offset="100%" stopColor="rgb(226, 232, 240)" />
            </linearGradient>
            
            {/* 悬停状态渐变 */}
            <linearGradient id={`hover-gradient-${tab.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(248, 250, 252)" />
              <stop offset="100%" stopColor="rgb(241, 245, 249)" />
            </linearGradient>
          </defs>
          
          {/* 标签页形状 */}
          <path
            d={createTabPath(192, 40, isActive)}
            fill={
              isActive 
                ? `url(#active-gradient-${tab.id})` 
                : isHovered 
                  ? `url(#hover-gradient-${tab.id})` 
                  : `url(#inactive-gradient-${tab.id})`
            }
            stroke="transparent"
            strokeWidth="0"
            className="chrome-tab-shape"
          />
          
          {/* 活动状态的顶部高亮线 */}
          {isActive && (
            <line
              x1="12"
              y1="0"
              x2="180"
              y2="0"
              stroke={tab.color || "#3b82f6"}
              strokeWidth="3"
              strokeLinecap="round"
              className="chrome-tab-highlight"
            />
          )}
        </svg>

        {/* 标签页内容 */}
        <div
          className={cn(
            "absolute inset-0 flex items-center px-4 py-2 cursor-pointer",
            "chrome-tab-content",
            isDragging && "cursor-grabbing"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          {/* 图标 */}
          <div className={cn(
            "flex-shrink-0 chrome-tab-content",
            isActive ? "text-slate-700" : "text-slate-500",
            isHovered && !isActive && "text-slate-600"
          )}>
            {getTabIcon(tab.type)}
          </div>
          
          {/* 标题 */}
          <span className={cn(
            "ml-2 mr-1 text-sm font-medium truncate flex-1 min-w-0",
            "chrome-tab-content chrome-tab-title",
            isActive ? "text-slate-800" : "text-slate-600",
            isHovered && !isActive && "text-slate-700"
          )}>
            {tab.title}
          </span>

          {/* 关闭按钮 */}
          {tab.closable && (
            <button
              className={cn(
                "flex-shrink-0 h-6 w-6 p-0 ml-1 rounded-full",
                "chrome-tab-close flex items-center justify-center",
                "opacity-0 group-hover:opacity-100",
                "hover:bg-slate-200 dark:hover:bg-slate-600",
                "text-slate-500 hover:text-slate-700",
                isActive && "opacity-60 hover:opacity-100"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabClose(tab.id, e);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
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
        distance: 10,
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
          nextTab = sortedTabs[1] || sortedTabs[0];
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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Chrome 风格标签页栏 */}
      <div className="relative chrome-tab-bar border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-12">
          {/* 侧边栏切换按钮 */}
          <div className="flex items-center px-3">
            <SidebarTrigger className="h-8 w-8" />
            <Separator orientation="vertical" className="ml-3 h-6" />
          </div>
          
          {/* 标签页滚动区域 */}
          <div className="flex-1 overflow-x-auto chrome-tab-scrollbar">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedTabs.map(tab => tab.id)} 
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex items-end min-w-max pl-2 pr-2 pt-2">
                  {sortedTabs.map((tab) => (
                    <ChromeTab
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onTabClose={handleTabClose}
                      onTabClick={handleTabClick}
                    />
                  ))}
                  
                  {/* 新标签页按钮 */}
                  <div className="flex items-center justify-center h-10 w-10 ml-2 mb-0">
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        "text-slate-500 hover:text-slate-700 hover:bg-slate-200",
                        "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-600",
                        "chrome-new-tab-button transition-all duration-200"
                      )}
                      onClick={() => navigate('/app')}
                      title="新建标签页"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}
