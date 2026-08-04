# ---------- 构建阶段：编译 Vue 前端 ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 运行阶段：Nginx 托管静态文件 + 反向代理 /api 到后端 ----------
FROM nginx:1.27-alpine

# 后端上游地址默认值；可用环境变量覆盖（如 Zeabur 上填内网地址）
ENV BACKEND_UPSTREAM=backend

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
