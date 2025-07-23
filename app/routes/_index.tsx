import type { MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

// 重定向到新的app路由
export const loader = () => {
  return redirect("/app");
};
