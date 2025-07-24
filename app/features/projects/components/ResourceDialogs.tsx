// ResourceDialogs.tsx - 资源对话框容器组件
import { GroupDialog } from "./dialogs/GroupDialog";
import { HostDialog } from "./dialogs/HostDialog";
import { PortForwardDialog } from "./dialogs/PortForwardDialog";
import { DialogState } from "../hooks/useResourceDialog";
import { Host } from "~/shared/types/host";
import { CreateGroupData, UpdateGroupData } from "~/shared/types/group";
import { CreateHostData, UpdateHostData } from "~/shared/types/host";

interface ResourceDialogsProps {
  dialogState: DialogState;
  hosts: Host[];
  onCloseDialog: () => void;
  onSaveGroup: (data: CreateGroupData | UpdateGroupData) => Promise<void>;
  onSaveHost: (data: CreateHostData | UpdateHostData) => Promise<void>;
  groupLoading: boolean;
  hostLoading: boolean;
}

export function ResourceDialogs({
  dialogState,
  hosts,
  onCloseDialog,
  onSaveGroup,
  onSaveHost,
  groupLoading,
  hostLoading,
}: ResourceDialogsProps) {
  
  return (
    <>
      
      {dialogState.type === 'group' && (
        <GroupDialog
          open={true}
          onOpenChange={onCloseDialog}
          projectId={dialogState.projectId!}
          group={dialogState.mode === 'edit' ? dialogState.data : undefined}
          onSave={onSaveGroup}
          loading={groupLoading}
        />
      )}

      {dialogState.type === 'host' && (
        <HostDialog
          open={true}
          onOpenChange={onCloseDialog}
          host={dialogState.mode === 'edit' ? dialogState.data : undefined}
          groupId={dialogState.groupId!}
          onSave={onSaveHost}
          loading={hostLoading}
        />
      )}

    </>
  );
}
