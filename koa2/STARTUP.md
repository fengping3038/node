# 🚀 快速启动指南

## 第一步：初始化数据库

在运行后端服务之前，需要先创建数据库并初始化数据。

### 1. 创建数据库
在 MySQL 中执行以下命令创建数据库：

```sql
CREATE DATABASE nuxt_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 初始化数据表和数据
在项目根目录（koa2文件夹）运行：

```bash
npm run init-db
```

这将：
- ✅ 创建 users 和 products 表
- ✅ 创建测试用户（用户名: admin, 密码: 123456）
- ✅ 创建3个测试商品

## 第二步：启动后端服务

```bash
npm run dev
```

后端服务将在 http://localhost:3000 启动

## 第三步：启动前端服务

在前端项目目录（web文件夹）运行：

```bash
npm run dev
```

前端服务将在 http://localhost:5173 启动（或其他端口）

## 第四步：测试系统

1. 打开浏览器访问前端地址
2. 使用测试账号登录：
   - 用户名：`admin`
   - 密码：`123456`
3. 登录后可以查看、添加、编辑、删除商品

## API 测试

你也可以直接使用 Postman 或 curl 测试 API：

### 登录测试
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 获取商品列表
```bash
curl http://localhost:3000/api/products
```

## 常见问题

### 1. 数据库连接失败
- 检查 MySQL 服务是否已启动
- 检查 `.env` 文件中的数据库配置是否正确
- 确认数据库 `nuxt_app` 已创建

### 2. 跨域问题
- 后端已配置 CORS，应该不会出现跨域问题
- 如果仍有问题，检查浏览器控制台错误信息

### 3. Token 认证失败
- 确保登录成功后 token 已保存
- 检查请求头中是否包含 `Authorization: Bearer <token>`

## 项目结构

```
node/
├── koa2/              # 后端项目
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器
│   ├── middleware/    # 中间件
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── app.js         # 主应用
│   ├── initDB.js      # 数据库初始化脚本
│   └── .env           # 环境变量
└── web/               # 前端项目
    ├── src/
    │   ├── stores/    # Pinia状态管理
    │   ├── views/     # 页面组件
    │   ├── utils/     # 工具函数
    │   └── ...
    └── ...
```
