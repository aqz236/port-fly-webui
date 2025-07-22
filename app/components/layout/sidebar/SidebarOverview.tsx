import { Home } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { SelectedItem } from "../AppSidebar";

interface SidebarOverviewProps {
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
}

export function SidebarOverview({ selected, onSelect }: SidebarOverviewProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSelect({ type: 'overview' })}
              isActive={selected.type === 'overview'}
            >
              <Home className="w-4 h-4" />
              <span>概览</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
