# 🚀 部署指南

> 电商管理系统（Vue3 + Koa2 + MySQL）部署方案

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

- 前端 `npm run build` 产物由 Nginx 托管；Nginx 把 `/api/`、`/uploads/` 反代给后端，**前端代码无需改动**
- 后端启动时自动建表（`sequelize.sync`），无需手动建表
- Nginx 的后端上游地址通过环境变量 `BACKEND_UPSTREAM` 配置（默认 `backend`）

## 方案 A：Zeabur 部署（免费，推荐国内访问）

Zeabur 不依赖 docker-compose，按"一个服务一个部署"的方式，共 3 个服务。**全程网页操作，无需命令行。**

### 第 1 步：注册并授权 GitHub

1. 打开 [zeabur.com](https://zeabur.com) → 注册（支持邮箱 / GitHub / 微信登录）
2. 新建项目（New Project）

### 第 2 步：创建数据库服务

1. 项目里 **添加服务（Add Service）→ 模板（Template）→ 搜索 MySQL**，选 Zeabur 官方的 **MySQL**
2. 部署完成后，它会自动注入环境变量：`MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`、`MYSQL_ROOT_PASSWORD`
3. 数据库是平台托管的**持久化**存储，重启不丢数据 ✅

### 第 3 步：创建后端服务

1. **添加服务 → GitHub** → 首次需授权 GitHub（可只授权 `fengping3038/node` 仓库）→ 选择该仓库
2. **Root Directory 填 `koa2`**（让 Zeabur 用它目录里的 Dockerfile 构建）
3. 在服务 **Variables（环境变量）** 里配置（Zeabur 里变量名用下划线）：

   | 变量 | 值 |
   |------|-----|
   | `PORT` | `3000` |
   | `DB_HOST` | `${MYSQL_HOST}` |
   | `DB_PORT` | `${MYSQL_PORT}` |
   | `DB_USER` | `${MYSQL_USER}` |
   | `DB_PASSWORD` | `${MYSQL_PASSWORD}` |
   | `DB_NAME` | `${MYSQL_DATABASE}` |
   | `JWT_SECRET` | 一长串随机字符（见文末"生成密钥"） |
   | `JWT_EXPIRES_IN` | `7d` |

   > 若 MySQL 服务的变量未自动可见，去 MySQL 服务把相关变量打开 **Expose**（暴露给同项目服务）。

4. 该服务**不需要公网访问**，保持内网即可

### 第 4 步：创建前端服务

1. **添加服务 → GitHub** → 同一仓库，**Root Directory 填 `web`**
2. 在服务 **Variables** 里把后端地址指过去：
   - `BACKEND_UPSTREAM` = 后端服务的内网地址。默认格式：`<后端服务名>.zeabur.internal`，例如后端服务名是 `backend`，则填 `backend.zeabur.internal`
3. 该服务**需要公网访问**：进入 **Networking / Domains**，添加端口 **80（HTTP）** → 生成免费 `xxx.zeabur.app` 域名（自动 HTTPS，国内可访问）

### 第 5 步：验证

1. 打开生成的域名，看到登录页即成功
2. 先**注册一个新账号**（数据库是空的），再登录
3. 上传一张图片测试 `/uploads` 是否正常

> ⚠️ 免费额度：服务闲置一段时间会休眠，首次访问会慢几秒（冷启动），属正常现象。正式使用或要稳定可用建议升级付费档（很便宜）。

## 方案 B：支持 Docker Compose 的平台 / 自有服务器

适用于 Railway、自有 VPS 等能用 `docker compose` 的场景。仓库根目录的 [docker-compose.yml](docker-compose.yml) 一键编排 MySQL + 后端 + 前端。

自有服务器（需已装 Docker）：
```bash
git clone https://github.com/fengping3038/node.git
cd node
cp .env.example .env   # 改掉所有 please-change 开头的值
docker compose up -d --build
# 访问 http://服务器IP
```

更新代码：`git pull && docker compose up -d --build`

## 生成密钥

```bash
# Linux / macOS
openssl rand -hex 32
# Windows PowerShell
[System.Text.Encoding]::UTF8.GetString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) | Out-Null; (1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) }) -join ''
```

## 上线后必做

1. **改默认密码**：注册后如系统有初始管理员账号，及时修改
2. **备份数据库**（自有服务器）：`docker compose exec db mysqldump -u root -p nuxt_app > backup.sql`
3. 以后绑定自己域名：Zeabur 的 Domains 里绑定并自动配 HTTPS

## 常见问题

| 症状 | 原因 | 解决 |
|------|------|------|
| 页面能打开但登录报错 | 后端没连上数据库 | 看后端日志；确认 `DB_HOST`/`DB_USER` 等变量正确 |
| 前端请求 /api 404 | Nginx 反代指向错误 | 确认 `BACKEND_UPSTREAM` 是后端内网地址 |
| 后端日志 "ETIMEDOUT" 连库失败 | 数据库变量未注入 | 确认 MySQL 服务变量 Expose 打开 |
| 图片上传后打不开 | `/uploads` 没反代 | 已内置该反代规则，检查 `BACKEND_UPSTREAM` |
| 重启后数据丢失 | 数据库无持久化 | Zeabur 用托管 MySQL（自带持久化）；自建则加 volume |

## 部署文件清单

| 文件 | 作用 |
|------|------|
| [docker-compose.yml](docker-compose.yml) | 编排 MySQL + 后端 + 前端（方案 B 用） |
| [koa2/Dockerfile](koa2/Dockerfile) | 后端镜像（Node 20），构建目录 `koa2` |
| [web/Dockerfile](web/Dockerfile) | 前端镜像（构建 + Nginx），构建目录 `web` |
| [web/nginx.conf.template](web/nginx.conf.template) | Nginx 配置模板（`${BACKEND_UPSTREAM}` 可配置） |
| [.env.example](.env.example) | 环境变量模板（方案 B 复制为 `.env`） |
