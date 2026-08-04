# 🚀 部署指南（Render 免费 + TiDB Serverless 免费数据库）

> 电商管理系统（Vue3 + Koa2 + MySQL）免费部署方案
> 零成本：Render 免费 Web Service + TiDB Cloud Serverless 免费 MySQL 兼容库

## 架构总览

```
浏览器
  │  https://<你的>.onrender.com
  ▼
┌─────────────────────────────────────┐
│ Render 单容器（一个 Web Service）    │
│ ┌─────────┐  /api/、/uploads/  ┌────┐│
│ │ Nginx   │ ─────────────────► │Node││  ← 同容器，无跨域
│ │ 托管前端 │   127.0.0.1:3000  │Koa2││
│ └─────────┘                    └─┬──┘│
└──────────────────────────────────┼───┘
                                   ▼  MySQL 协议 + TLS
                            ┌──────────────┐
                            │ TiDB Cloud   │
                            │ Serverless   │
                            │ （免费 5GB）  │
                            └──────────────┘
```

**为什么是单容器**：Render 免费层每月只有 750 小时，一个常开的 Web Service 就用满。把 Nginx（前端）和 Node（后端）装进同一容器，只部署一个服务，同源访问无跨域。数据库用 TiDB Serverless——真免费、MySQL 兼容、无需信用卡。

## 第 1 步：创建免费数据库（TiDB Cloud）

1. 打开 [tidbcloud.com](https://tidbcloud.com) → 注册（**无需信用卡**）
2. 创建一个 **Serverless 集群**（免费档：5GB 存储 + 每月 5000 万 RUs，够用）
3. 集群页点 **Connect**，记下：
   - Host（形如 `xxx.ap-southeast-1.prod.aws.tidbcloud.com`）
   - Port：**4000**
   - 用户名（形如 `xxx.root`，注意带前缀）+ 密码
4. **记好这些值**，下一步填进 Render

## 第 2 步：部署到 Render

1. 打开 [render.com](https://render.com) → 用 **GitHub** 登录（**无需信用卡**）
2. **New → Web Service** → 连接你的 GitHub → 选仓库 `fengping3038/node`
3. 关键配置：
   - **Name**：随意（如 `ecommerce-admin`）
   - **Environment**：`Docker`（Render 会自动用根目录的 `Dockerfile`）
   - **Region**：选 `Singapore`（靠近国内）
   - **Plan**：`Free`
   - **Health Check Path**：`/api/products`（可省，免费层用默认）
4. **Environment Variables** 填这些：

   | 变量 | 值 |
   |------|-----|
   | `PORT` | `10000` |
   | `DB_HOST` | TiDB 的 Host |
   | `DB_PORT` | `4000` |
   | `DB_USER` | TiDB 的用户名（含前缀） |
   | `DB_PASSWORD` | TiDB 的密码 |
   | `DB_NAME` | `test`（TiDB 默认库名） |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | 一长串随机字符 |
   | `JWT_EXPIRES_IN` | `7d` |

5. 点 **Create Web Service**，等构建部署（首次约 5-8 分钟）
6. 完成后访问 `https://<你的名字>.onrender.com` → 看到登录页即成功

> **为什么 `PORT=10000`**：Render 会给每个 Web 服务注入 `PORT`（默认 10000），我们的启动脚本会把 Nginx 监听端口改成它，配合 Render 的端口路由。

## 第 3 步：验证

1. **注册新账号**（数据库是空的）→ 登录
2. 上传一张头像 → 确认能显示
3. 添加一个商品、一个客户 → 确认能保存（数据存进 TiDB）

## 免费层的两个注意点

| 限制 | 说明 | 影响 |
|------|------|------|
| **休眠** | 15 分钟无请求，服务进入休眠 | 下次访问需冷启动约 30-60 秒，属正常 |
| **文件系统是临时的** | 上传的图片存在容器里，重启/重新部署会清空 | 头像会丢；图片属于演示用途可接受。正式要持久化需对象存储 |

## 常见问题

| 症状 | 原因 | 解决 |
|------|------|------|
| 后端日志 "ECONNREFUSED" | 数据库连不上 | 核对 `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD` |
| 数据库 "SSL required" | TiDB 强制 TLS | 确认 `DB_SSL=true` |
| 用户名带前缀报错 | TiDB 用户名含前缀 | 用 `xxx.root` 全名 |
| 页面 500 | 可能是 RUs 用尽 | 看 TiDB 用量，免费额度月重置 |
| 图片上传后打不开 | 文件系统临时 | 属免费层限制，重启即清空 |

## 本地开发（不变）

```bash
# 后端（连本地 MySQL）
cd koa2 && npm run dev        # :3000
# 前端
cd web && npm run dev         # :5174
```

## 其他部署选项

如果你以后愿意花点小钱（¥38-99/年新用户促销），**阿里云/腾讯云轻量服务器**体验更好（不休眠、国内快、可绑域名备案）。仓库里的 `docker-compose.yml` 就是为此准备的，照着跑即可。

## 部署文件清单

| 文件 | 作用 |
|------|------|
| [Dockerfile](Dockerfile) | Render 单容器镜像（Nginx+Node+supervisord） |
| [nginx.conf](nginx.conf) | Nginx 配置（静态 + `/api`、`/uploads` 反代） |
| [supervisord.conf](supervisord.conf) | 进程管理（同时拉起 nginx 和 node） |
| [render/entrypoint.sh](render/entrypoint.sh) | 启动脚本（处理 Render 的 PORT 变量） |
| [render/render.yaml](render/render.yaml) | Render Blueprint（可选） |
