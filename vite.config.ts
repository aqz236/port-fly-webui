import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { IncomingMessage, ServerResponse } from "http";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    // 自定义插件来处理Chrome DevTools请求
    {
      name: 'chrome-devtools-handler',
      configureServer(server) {
        server.middlewares.use('/.well-known', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url?.includes('com.chrome.devtools.json')) {
            res.statusCode = 204; // No Content
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    hmr: {
      port: 24678, // 使用不同的端口避免冲突
    },
  },
});
