import { Project, ProjectStats } from "~/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Copy, 
  Edit, 
  Settings, 
  Plus,
  Folder,
  Users, 
  Server, 
  Activity,
  Clock,
  Database,
  TreePine
} from "lucide-react";
import { useState } from "react";
import { Group } from "~/types/api";

interface ProjectDetailProps {
  project: Project;
  stats?: ProjectStats;
  onGroupClick?: (group: Group) => void;
  onAddGroup?: () => void;
}

export function ProjectDetail({ project, stats, onGroupClick, onAddGroup }: ProjectDetailProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 项目基本信息 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: project.color }}
          >
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">ID: {project.id}</Badge>
              {project.is_default && (
                <Badge variant="default">默认项目</Badge>
              )}
              <Badge variant="outline">层级: {project.level}</Badge>
              {project.parent_id && (
                <Badge variant="outline">父项目: {project.parent_id}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">组数量</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_groups}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">主机数量</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">端口数量</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_ports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃隧道</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_tunnels}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 组列表 */}
      {project.groups && project.groups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>组列表</CardTitle>
                <CardDescription>
                  此项目包含 {project.groups.length} 个组
                </CardDescription>
              </div>
              {onAddGroup && (
                <Button onClick={onAddGroup} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加组
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.groups.map((group) => (
                <Card 
                  key={group.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onGroupClick && onGroupClick(group)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: group.color }}
                      >
                        <Database className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{group.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 flex-wrap">
                      {group.tags && group.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {group.tags && group.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 项目数据展示 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>项目数据</CardTitle>
              <CardDescription>
                {showRawJson ? '原始JSON数据' : '格式化数据视图'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                {showRawJson ? '格式化视图' : '原始JSON'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(project, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showRawJson ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(project, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">基本信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ID:</dt>
                      <dd>{project.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">名称:</dt>
                      <dd>{project.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">颜色:</dt>
                      <dd className="flex items-center gap-2">
                        {project.color}
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: project.color }}
                        />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">图标:</dt>
                      <dd>{project.icon}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">层级:</dt>
                      <dd>{project.level}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">排序:</dt>
                      <dd>{project.sort}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">时间信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">创建时间:</dt>
                      <dd>{new Date(project.created_at).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">更新时间:</dt>
                      <dd>{new Date(project.updated_at).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {project.description && (
                <div>
                  <h4 className="font-semibold mb-2">描述</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}
              
              {project.path && (
                <div>
                  <h4 className="font-semibold mb-2">路径</h4>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{project.path}</code>
                </div>
              )}
              
              {project.metadata && Object.keys(project.metadata).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">元数据</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(project.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
