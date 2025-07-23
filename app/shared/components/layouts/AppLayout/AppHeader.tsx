import { SidebarTrigger } from "~/shared/components/ui/sidebar";
import { Separator } from "~/shared/components/ui/separator";
import { Button } from "~/shared/components/ui/button";
import { Search, Bell, User } from "lucide-react";

interface AppHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function AppHeader({ 
  title, 
  children
}: AppHeaderProps) {
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
      
      {children}
    </div>
  );
}
