import { useParams } from "@remix-run/react";
import { GroupDetail } from "~/features/groups/components/GroupDetail";
import { useProjects } from "~/shared/api/hooks";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { useEffect } from "react";

export default function GroupPage() {
  const { groupId } = useParams();
  const { data: projects = [] } = useProjects();
  const { setSelected, getGroupById, getGroupStats } = useLayoutStore();

  const group = getGroupById(Number(groupId));
  
  // 设置选中状态
  useEffect(() => {
    if (group) {
      setSelected({ 
        type: 'group', 
        projectId: group.project_id,
        groupId: group.id 
      });
    }
  }, [group?.id]); // 只依赖 group.id，避免无限循环

  if (!group) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        组未找到
      </div>
    );
  }

  const stats = getGroupStats(group.id);

  return (
    <GroupDetail 
      group={group} 
      stats={stats}
    />
  );
}
