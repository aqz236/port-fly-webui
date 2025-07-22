import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

// Query Client 配置
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5分钟缓存时间
        staleTime: 5 * 60 * 1000,
        // 10分钟垃圾回收时间
        gcTime: 10 * 60 * 1000,
        // 重试配置
        retry: (failureCount, error) => {
          // API错误不重试
          if (error instanceof Error && error.message.includes('HTTP')) {
            return false
          }
          // 网络错误最多重试2次
          return failureCount < 2
        },
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 失焦重新获取
        refetchOnWindowFocus: false,
        // 重连时重新获取
        refetchOnReconnect: true,
      },
      mutations: {
        // 突变重试配置
        retry: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务器端: 每次都创建新的客户端
    return makeQueryClient()
  } else {
    // 浏览器端: 重用现有客户端或创建新的客户端
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  )
}
