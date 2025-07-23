import { useLocation, useNavigate } from "@remix-run/react";
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";
import { Button } from "~/shared/components/ui/button";
import { X, FileText, Folder, Terminal, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjects } from "~/shared/api/hooks";
import { useLayoutStore } from "~/store/slices/layoutStore";

interface TabItem {
  id: string;
  title: string;
  path: string;
  type: 'overview' | 'project' | 'group' | 'terminal';
  color?: string;
  closable?: boolean;
}

interface RemixTabBrowserProps {
  children: React.ReactNode;
}

export function RemixTabBrowser({ children }: RemixTabBrowserProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  
  const { data: projects = [] } = useProjects();
  const { getProjectById, getGroupById } = useLayoutStore();

  // 根据当前路径解析标签页信息
  const parseCurrentPath = (): TabItem | null => {
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
        title: `终端 ${hostId}`, // 简化处理，暂时不获取主机名
        path: pathname,
        type: 'terminal',
        color: '#8b5cf6',
        closable: true
      };
    }
    
    return null;
  };

  // 更新标签页状态
  useEffect(() => {
    const currentTab = parseCurrentPath();
    if (!currentTab) return;

    setActiveTab(currentTab.id);

    setTabs(prevTabs => {
      // 检查标签页是否已存在
      const existingTabIndex = prevTabs.findIndex(tab => tab.id === currentTab.id);
      if (existingTabIndex !== -1) {
        // 更新现有标签页的信息（比如名称可能变了）
        const newTabs = [...prevTabs];
        newTabs[existingTabIndex] = currentTab;
        return newTabs;
      }

      // 添加新标签页
      return [...prevTabs, currentTab];
    });
  }, [location.pathname, projects]); // 简化依赖项

  // 获取标签页图标
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

  // 关闭标签页
  const closeTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // 如果关闭的是当前活动标签页，导航到其他标签页或概览
      if (activeTab === tabId) {
        if (newTabs.length > 0) {
          const currentIndex = prevTabs.findIndex(tab => tab.id === tabId);
          let nextTab;
          if (currentIndex > 0) {
            nextTab = newTabs[currentIndex - 1];
          } else {
            nextTab = newTabs[0];
          }
          navigate(nextTab.path);
        } else {
          navigate('/app');
        }
      }
      
      return newTabs;
    });
  };

  // 切换标签页
  const switchTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  };

  if (tabs.length === 0) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 标签页栏 */}
      <div className="border-b bg-background">
        <div className="flex items-center px-2 py-1">
          <Tabs value={activeTab} onValueChange={switchTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative group flex items-center">
                  <TabsTrigger
                    value={tab.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground hover:bg-muted/50 transition-colors rounded-md border-l-2"
                    style={{ 
                      borderLeftColor: tab.color || '#e5e7eb'
                    }}
                  >
                    {getTabIcon(tab.type)}
                    <span className="max-w-32 truncate">{tab.title}</span>
                  </TabsTrigger>
                  {tab.closable && (
                    <button
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground ml-1 rounded flex items-center justify-center transition-opacity"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
