#!/bin/sh
set -e

# Render 会给每个 Web 服务注入 PORT 变量（默认 10000）。
# 我们的服务是 Node 后端 + Nginx 单容器：Nginx 监听 80，由 Render 路由映射，
# 但端口 80 需 root 权限。这里若 PORT 被设置，则让 Nginx 直接监听该端口
# （Render 的 inbound 会把外部请求转发到容器内的这个端口）。
if [ -n "$PORT" ] && [ "$PORT" != "80" ]; then
  sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/http.d/default.conf
fi

# 上传目录（免费层为临时文件系统，重启会清空）
mkdir -p /app/koa2/uploads

# 交由 supervisord 同时拉起 Node 后端与 Nginx
exec /usr/bin/supervisord -c /etc/supervisord.conf
