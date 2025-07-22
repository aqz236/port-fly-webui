/**
 * Project Tree Actions Component
 * 
 * 项目树的操作按钮组件
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { CreateProjectDialog } from '~/components/dialogs';
import type { CreateProjectData } from '~/types/api';

interface ProjectTreeActionsProps {
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
}

export function ProjectTreeActions({ onCreateProject }: ProjectTreeActionsProps) {
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">项目</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4">
              <Plus className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48" side="right">
            <DropdownMenuItem onClick={handleCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleImportProject}>
              导入项目
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportFromToby}>
              从 Toby 导入
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showCreateProjectDialog && (
        <CreateProjectDialog
          open={showCreateProjectDialog}
          onOpenChange={setShowCreateProjectDialog}
          onCreateProject={onCreateProject}
        />
      )}
    </>
  );
}
