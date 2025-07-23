// ProjectDataView.tsx - 项目数据展示组件
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Button } from "~/shared/components/ui/button";
import { Copy } from "lucide-react";
import { Project } from "~/shared/types/project";

interface ProjectDataViewProps {
  project: Project;
}

export function ProjectDataView({ project }: ProjectDataViewProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
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
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
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
                    <dt className="text-muted-foreground">层级:</dt>
                    <dd>{project.level}</dd>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
