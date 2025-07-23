import { useState } from "react";
import { Plus, FileText, Upload, Download } from "lucide-react";
import { Button } from "~/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "~/shared/components/ui/sidebar";
import { CreateProjectDialog } from "~/features/projects/components";
import { CreateProjectData } from "~/shared/types/project";

interface ProjectActionsMenuProps {
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
}

export function ProjectActionsMenu({ onCreateProject }: ProjectActionsMenuProps) {
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);

  const handleCreateProject = () => {
    setShowCreateProjectDialog(true);
  };

  const handleImportProject = () => {
    // TODO: 实现导入项目功能
    console.log('Import project');
  };

  const handleImportFromToby = () => {
    // TODO: 实现从Toby导入功能
    console.log('Import from Toby');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <Plus className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48" side="right">
          <DropdownMenuItem onClick={handleCreateProject}>
            <FileText className="h-4 w-4 mr-2" />
            创建项目
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportProject}>
            <Upload className="h-4 w-4 mr-2" />
            导入项目
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportFromToby}>
            <Download className="h-4 w-4 mr-2" />
            从 Toby 导入
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
        onCreateProject={onCreateProject}
      />
    </>
  );
}
