import { Activity, Settings } from "lucide-react";
import {
  CustomSidebarGroup,
  CustomSidebarGroupContent,
  CustomSidebarMenu,
  CustomSidebarMenuButton,
  CustomSidebarMenuItem,
} from "./CustomSidebar";

export function SidebarFooter() {
  return (
    <CustomSidebarGroup className="mt-auto border-t border-border">
      <CustomSidebarGroupContent>
        <CustomSidebarMenu>
          <CustomSidebarMenuItem>
            <CustomSidebarMenuButton>
              <Activity className="w-4 h-4" />
              <span>活跃会话</span>
            </CustomSidebarMenuButton>
          </CustomSidebarMenuItem>
          <CustomSidebarMenuItem>
            <CustomSidebarMenuButton>
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </CustomSidebarMenuButton>
          </CustomSidebarMenuItem>
        </CustomSidebarMenu>
      </CustomSidebarGroupContent>
    </CustomSidebarGroup>
  );
}
