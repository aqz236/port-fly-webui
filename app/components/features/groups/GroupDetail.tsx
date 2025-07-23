import { Group, GroupStats } from "~/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Copy, 
  Edit, 
  Settings, 
  Users, 
  Server, 
  Activity,
  Clock,
  Database
} from "lucide-react";
import { useState } from "react";

interface GroupDetailProps {
  group: Group;
  stats?: GroupStats;
}

export function GroupDetail({ group, stats }: GroupDetailProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 组基本信息 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: group.color }}
          >
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-muted-foreground">{group.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">ID: {group.id}</Badge>
              <Badge variant="outline">项目: {group.project_id}</Badge>
              {group.tags && group.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="default">{tag}</Badge>
              ))}
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
              <CardTitle className="text-sm font-medium">主机数量</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.connected_hosts} 已连接
              </p>
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最后使用</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.last_used ? new Date(stats.last_used).toLocaleDateString() : '从未'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* JSON 数据展示 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>组数据</CardTitle>
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
                onClick={() => copyToClipboard(JSON.stringify(group, null, 2))}
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
              {JSON.stringify(group, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">基本信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ID:</dt>
                      <dd>{group.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">名称:</dt>
                      <dd>{group.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">颜色:</dt>
                      <dd className="flex items-center gap-2">
                        {group.color}
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: group.color }}
                        />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">图标:</dt>
                      <dd>{group.icon}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">项目ID:</dt>
                      <dd>{group.project_id}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">时间信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">创建时间:</dt>
                      <dd>{new Date(group.created_at).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">更新时间:</dt>
                      <dd>{new Date(group.updated_at).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {group.description && (
                <div>
                  <h4 className="font-semibold mb-2">描述</h4>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              )}
              
              {group.tags && group.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {group.metadata && Object.keys(group.metadata).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">元数据</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(group.metadata, null, 2)}
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
