# ============================================================
# Render 单容器镜像：Nginx（托管前端）+ Node（Koa2 后端）
# 同源部署，无跨域；免费层只占一个 Web Service 的额度
# ============================================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS build
WORKDIR /build

# 构建后端
COPY koa2/package*.json ./koa2/
RUN cd koa2 && npm ci --omit=dev || npm install --omit=dev
COPY koa2 ./koa2
RUN rm -f koa2/.env

# 构建前端
COPY web/package*.json ./web/
RUN cd web && npm ci || npm install
COPY web ./web
RUN cd web && npm run build

# ---------- 运行阶段 ----------
FROM node:20-alpine

# 安装 nginx 和 supervisor（supervisor 同时拉起后端与前端两个进程）
RUN apk add --no-cache nginx supervisor && \
    mkdir -p /var/lib/nginx /var/log/nginx /run/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# 后端代码与依赖
WORKDIR /app
COPY --from=build /build/koa2 ./koa2

# 前端静态文件 + 上传目录
COPY --from=build /build/web/dist /usr/share/nginx/html
RUN mkdir -p /app/koa2/uploads

# 配置文件（Alpine nginx 的主配置在 http.d/ 下加载 server 块）
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY render/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
