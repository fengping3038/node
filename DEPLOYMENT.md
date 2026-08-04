# 🚀 部署指南

> 电商管理系统（Vue3 + Koa2 + MySQL）一键部署方案

## 架构总览

```
浏览器
  │  https://<你的域名或平台子域名>
  ▼
┌─────────────────┐   /api/、/uploads/   ┌─────────────────┐   3306   ┌──────────┐
│ web（Nginx）    │ ────────────────────► │ backend（Koa2） │ ────────► │ MySQL 8  │
│ 托管前端静态文件 │     反向代理           │    端口 3000     │          │ nuxt_app │
└─────────────────┘                       └─────────────────┘          └──────────┘
```

- **前端** `npm run build` 产物（`web/dist`）由 Nginx 托管
- Nginx 把 `/api/` 和 `/uploads/` 反向代理给后端，前端代码**无需任何改动**
- 后端启动时自动建表（`sequelize.sync`），无需手动建表
- 三个容器全部由根目录 [docker-compose.yml](docker-compose.yml) 编排

## 方案 A：免费平台（推荐，无需自己有服务器）

适合 Zeabur / Railway 这类支持 Docker Compose 的平台。流程：

1. **确认代码已推送到 GitHub**（仓库：`github.com/fengping3038/node`）
2. 在平台注册账号：
   - **[Zeabur](https://zeabur.com)**：中文界面，支付宝/微信登录，国内访问快 ✅推荐
   - **[Railway](https://railway.app)**：英文界面，注册送 $5 额度，部署稍麻烦
3. 在平台控制台：**新建项目 → Deploy from GitHub → 选择本仓库**
4. 平台会自动识别 `docker-compose.yml`，生成 3 个服务（db / backend / web）
5. **设置环境变量**（每个服务各自的变量按 `docker-compose.yml` 里的来，值参考 [.env.example](.env.example)）：
   - `db`：`MYSQL_ROOT_PASSWORD`、`MYSQL_DATABASE`、`MYSQL_USER`、`MYSQL_PASSWORD`
   - `backend`：`DB_HOST=db`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`、`JWT_SECRET`（随机长字符串）
6. 把 **web 服务设为对外公开**（Zeabur：服务详情里开启公网访问，端口 80）
7. 等待部署完成，访问平台分配的子域名（如 `xxx.zeabur.app`），看到登录页即成功

> ⚠️ 免费平台注意：
> - 数据库数据要**持久化**需要存储卷（Zeabur 有 MySQL 模板自带持久化，或给 db 服务加 volume，通常约 ¥1-2/月）。不加卷则重启可能丢数据。
> - 免费额度下的服务闲置后会休眠，首次访问可能慢几秒（冷启动），属正常现象。

## 方案 B：自己的云服务器（Docker Compose 一键）

前提：服务器已装 Docker + Docker Compose，并放行 80 端口。

```bash
# 1. 拉取代码
git clone https://github.com/fengping3038/node.git
cd node

# 2. 配置密钥
cp .env.example .env
#    编辑 .env，改掉所有 please-change 开头的值

# 3. 一键启动（首次会构建+拉镜像，约几分钟）
docker compose up -d --build

# 4. 查看状态
docker compose ps

# 5. 访问 http://服务器IP  （登录页出现即成功）
```

后续更新代码：

```bash
git pull
docker compose up -d --build
```

## 上线后必做

1. **注册账号**：新数据库是空的，先在页面注册一个账号再登录
2. **确认头像上传**：上传一张图片，看 `/uploads/xxx` 能否正常访问
3. **备份数据库**（方案 B）：
   ```bash
   docker compose exec db mysqldump -u root -p nuxt_app > backup.sql
   ```
4. 以后绑定自己的域名：平台控制台绑域名（免费平台用自带子域名即可），需 HTTPS 时平台/服务器申请免费证书

## 常见问题

| 症状 | 原因 | 解决 |
|------|------|------|
| 页面能打开但登录报错 | 后端没连上数据库 | 看 backend 日志；确认 `DB_HOST` 在平台上是 `db` |
| 登录后商品/客户列表空 | 数据库为空 | 正常现象，新增数据即可 |
| 图片上传后打不开 | `/uploads` 没代理 | 确认 Nginx 配置了 `location /uploads/`（已内置） |
| 重启后数据丢失 | 没配存储卷 | 给 db 服务加 volume |

## 部署文件清单

| 文件 | 作用 |
|------|------|
| [docker-compose.yml](docker-compose.yml) | 编排 MySQL + 后端 + 前端 |
| [koa2/Dockerfile](koa2/Dockerfile) | 后端镜像（Node 20） |
| [web/Dockerfile](web/Dockerfile) | 前端镜像（构建 + Nginx） |
| [web/nginx.conf](web/nginx.conf) | Nginx 配置（静态文件 + `/api` 代理） |
| [.env.example](.env.example) | 环境变量模板（复制为 `.env` 使用） |
