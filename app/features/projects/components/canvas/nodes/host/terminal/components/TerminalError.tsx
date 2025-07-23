// 终端错误显示组件
import React from 'react';
import { Button } from '~/shared/components/ui/button';
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TerminalErrorProps {
  error: string;
  onRetry?: () => void;
  embedded?: boolean;
}

export function TerminalError({ error, onRetry, embedded = false }: TerminalErrorProps) {
  if (embedded) {
    return (
      <div className="absolute bottom-2 left-2 right-2 z-10">
        <Alert variant="destructive" className="p-2">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription className="text-xs flex items-center justify-between">
            <span className="flex-1 mr-2">{error}</span>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                重试
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="flex-1 mr-3">{error}</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-destructive-foreground hover:bg-destructive/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试连接
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
