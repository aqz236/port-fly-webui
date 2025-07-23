// 重新导出API类型，避免重复定义
export type { Group, Project, GroupStats, ProjectStats } from './api';
import type { Group, Project } from './api';

// 标签页相关类型
export interface GroupTab {
  id: string;
  groupId: number;
  title: string;
  group: Group;
  type: 'group';
}

export interface ProjectTab {
  id: string;
  projectId: number;
  title: string;
  project: Project;
  type: 'project';
}

export type Tab = GroupTab | ProjectTab;
