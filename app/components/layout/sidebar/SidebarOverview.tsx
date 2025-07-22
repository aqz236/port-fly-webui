import { Home } from "lucide-react";
import {
  CustomSidebarGroup,
  CustomSidebarGroupContent,
  CustomSidebarMenu,
  CustomSidebarMenuButton,
  CustomSidebarMenuItem,
} from "./CustomSidebar";
import type { SelectedItem } from "../AppSidebar";

interface SidebarOverviewProps {
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
}

export function SidebarOverview({ selected, onSelect }: SidebarOverviewProps) {
  return (
    <CustomSidebarGroup>
      <CustomSidebarGroupContent>
        <CustomSidebarMenu>
          <CustomSidebarMenuItem>
            <CustomSidebarMenuButton
              onClick={() => onSelect({ type: 'overview' })}
              isActive={selected.type === 'overview'}
            >
              <Home className="w-4 h-4" />
              <span>概览</span>
            </CustomSidebarMenuButton>
          </CustomSidebarMenuItem>
        </CustomSidebarMenu>
      </CustomSidebarGroupContent>
    </CustomSidebarGroup>
  );
}
