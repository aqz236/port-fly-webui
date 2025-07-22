import { GroupCard, Group } from "./GroupCard";

interface GroupListProps {
  groups: Group[];
  onGroupClick?: (group: Group) => void;
}

export function GroupList({ groups, onGroupClick }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无组，点击右上角添加组
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onGroupClick?.(group)}
        />
      ))}
    </div>
  );
}
