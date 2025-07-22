import { Zap } from "lucide-react";
import { SidebarHeader as ShadcnSidebarHeader } from "~/components/ui/sidebar";

export function SidebarHeader() {
  return (
    <ShadcnSidebarHeader className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">PortFly</span>
      </div>
    </ShadcnSidebarHeader>
  );
}
