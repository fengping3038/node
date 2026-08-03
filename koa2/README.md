# Koa2 电商后端 API

## 项目简介
基于 Koa2 + MySQL + Sequelize 的电商后端 API 服务，提供用户认证和商品管理功能。

## 技术栈
- **框架**: Koa2
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs

## 安装依赖
```bash
npm install
```

## 配置环境变量
复制 `.env` 文件并修改配置：
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=fengping123
DB_NAME=nuxt_app
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## 启动项目

### 开发模式（自动重启）
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

## API 接口文档

### 用户接口

#### 1. 用户注册
- **URL**: `POST /api/register`
- **参数**:
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com"
  }
  ```
- **响应**:
  ```json
  {
    "code": 201,
    "message": "注册成功",
    "data": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
  ```

#### 2. 用户登录
- **URL**: `POST /api/login`
- **参数**:
  ```json
  {
    "username": "testuser",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
      }
    }
  }
  ```

### 商品接口

#### 1. 获取所有商品（公开）
- **URL**: `GET /api/products`
- **响应**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [...]
  }
  ```

#### 2. 获取单个商品（公开）
- **URL**: `GET /api/products/:id`

#### 3. 创建商品（需认证）
- **URL**: `POST /api/products`
- **Headers**: `Authorization: Bearer <token>`
- **参数**:
  ```json
  {
    "name": "iPhone 15 Pro",
    "category": "手机",
    "price": 7999,
    "stock": 100,
    "description": "苹果最新旗舰手机",
    "image": "https://example.com/image.jpg"
  }
  ```

#### 4. 更新商品（需认证）
- **URL**: `PUT /api/products/:id`
- **Headers**: `Authorization: Bearer <token>`

#### 5. 删除商品（需认证）
- **URL**: `DELETE /api/products/:id`
- **Headers**: `Authorization: Bearer <token>`

## 项目结构
```
koa2/
├── config/
│   └── db.js              # 数据库配置
├── controllers/
│   ├── userController.js  # 用户控制器
│   └── productController.js # 商品控制器
├── middleware/
│   └── auth.js            # JWT认证中间件
├── models/
│   ├── User.js            # 用户模型
│   └── Product.js         # 商品模型
├── routes/
│   ├── userRoutes.js      # 用户路由
│   └── productRoutes.js   # 商品路由
├── .env                   # 环境变量
├── .gitignore
├── app.js                 # 主应用文件
└── package.json
```

## 注意事项
1. 首次运行前请确保 MySQL 服务已启动
2. 数据库 `nuxt_app` 需要预先创建
3. JWT_SECRET 在生产环境中务必修改为强密钥
4. 开发环境使用 `sequelize.sync({ alter: true })` 会自动创建/更新表结构
