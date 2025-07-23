import { Activity, Settings } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter as ShadcnSidebarFooter,
} from "~/shared/components/ui/sidebar";

export function SidebarFooter() {
  return (
    <ShadcnSidebarFooter className="mt-auto border-t border-border">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>活跃会话</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </ShadcnSidebarFooter>
  );
}
