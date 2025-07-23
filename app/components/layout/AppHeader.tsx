import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Search, Bell, User, X } from "lucide-react";

// 本地标签页类型定义
interface GroupTab {
  id: string;
  groupId: number;
  title: string;
  type: 'group';
}

interface ProjectTab {
  id: string;
  projectId: number;
  title: string;
  type: 'project';
}

type Tab = GroupTab | ProjectTab;

interface AppHeaderProps {
  title: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  children?: React.ReactNode;
  // 添加获取实体数据的回调
  getProjectById?: (id: number) => any;
  getGroupById?: (id: number) => any;
}

export function AppHeader({ 
  title, 
  tabs = [], 
  activeTab, 
  onTabChange, 
  onTabClose,
  children,
  getProjectById,
  getGroupById
}: AppHeaderProps) {
  // 获取标签页的颜色
  const getTabColor = (tab: Tab): string => {
    if (tab.type === 'group' && getGroupById) {
      const group = getGroupById(tab.groupId);
      return group?.color || '#10b981';
    } else if (tab.type === 'project' && getProjectById) {
      const project = getProjectById(tab.projectId);
      return project?.color || '#6366f1';
    }
    return '#64748b';
  };
  return (
    <div className="flex flex-col border-b">
      {/* 顶部工具栏 */}
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* 标签页区域 */}
      {tabs.length > 0 && (
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="h-10 p-0 bg-transparent">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative flex items-center">
                  <TabsTrigger 
                    value={tab.id}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getTabColor(tab) }}
                      />
                      {tab.title}
                    </span>
                  </TabsTrigger>
                  {onTabClose && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose(tab.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </TabsList>
            {children}
          </Tabs>
        </div>
      )}
    </div>
  );
}
