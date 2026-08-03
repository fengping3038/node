# 数据库表展示功能完成说明

## 📊 数据库表结构

项目中包含以下 3 个数据表：

### 1. users（用户表）
- **用途**：存储系统用户信息，用于登录认证
- **字段**：id, username, email, password, created_at, updated_at
- **API 接口**：
  - POST `/api/register` - 用户注册
  - POST `/api/login` - 用户登录
- **前端页面**：Login.vue, Register.vue

### 2. products（商品表）
- **用途**：存储商品信息
- **字段**：id, name, category, price, stock, description, image, created_at, updated_at
- **API 接口**：
  - GET `/api/products` - 获取商品列表
  - GET `/api/products/:id` - 获取单个商品
  - POST `/api/products` - 创建商品（需认证）
  - PUT `/api/products/:id` - 更新商品（需认证）
  - DELETE `/api/products/:id` - 删除商品（需认证）
- **前端页面**：Products.vue
- **当前状态**：表已创建，暂无数据

### 3. customers（客户表）✅ 新增
- **用途**：存储客户详细信息
- **字段**：
  - id - 主键
  - first_name - 姓
  - last_name - 名
  - email - 邮箱（唯一）
  - phone - 电话
  - address - 地址
  - city - 城市
  - province - 省份
  - postal_code - 邮政编码
  - country - 国家（默认：中国）
  - status - 状态（active/vip/inactive）
  - total_spent - 总消费金额
  - created_at - 创建时间
  - updated_at - 更新时间
- **API 接口**：
  - GET `/api/customers` - 获取客户列表（支持分页、搜索、筛选）
  - GET `/api/customers/:id` - 获取单个客户
  - POST `/api/customers` - 创建客户
  - PUT `/api/customers/:id` - 更新客户
  - DELETE `/api/customers/:id` - 删除客户
- **前端页面**：Customers.vue ✅ 已完成
- **当前状态**：已有 20 条测试数据

## 🎯 已完成的功能

### 后端（Koa2）
1. ✅ 创建 Customer 模型（`models/Customer.js`）
2. ✅ 创建 Customer 控制器（`controllers/customerController.js`）
   - 支持分页查询
   - 支持关键词搜索（姓名、邮箱）
   - 支持状态筛选
   - 完整的 CRUD 操作
3. ✅ 创建 Customer 路由（`routes/customerRoutes.js`）
4. ✅ 在主应用中注册客户路由（`app.js`）

### 前端（Vue3 + Vite）
1. ✅ 添加客户 API 接口（`utils/api.js`）
2. ✅ 创建客户 Pinia Store（`stores/customer.js`）
   - 状态管理
   - 异步操作封装
   - 错误处理
3. ✅ 创建客户管理页面（`views/Customers.vue`）
   - 客户列表展示（表格）
   - 搜索和筛选功能
   - 分页组件
   - 新增/编辑对话框
   - 查看详情对话框
   - 删除确认
4. ✅ 更新路由配置（`router/index.js`）
5. ✅ 更新主应用布局（`App.vue`）
   - 顶部导航栏
   - 菜单项（商品管理、客户管理）
   - 用户下拉菜单（退出登录）

##  使用方法

### 启动服务

1. **启动后端服务器**（端口 3000）：
```bash
cd e:\pm\node\koa2
npm start
```

2. **启动前端开发服务器**（端口 5174）：
```bash
cd e:\pm\node\web
npm run dev
```

### 访问应用

1. 打开浏览器访问：http://localhost:5174
2. 使用已有账号登录（用户名：testuser，密码：123456）
3. 登录后可以看到顶部导航栏，包含：
   - 商品管理
   - 客户管理（新增）
4. 点击"客户管理"即可查看和管理客户数据

## 📝 API 测试示例

### 获取客户列表
```bash
GET http://localhost:3000/api/customers?page=1&limit=10
```

### 搜索客户
```bash
GET http://localhost:3000/api/customers?keyword=张&status=vip
```

### 创建客户
```bash
POST http://localhost:3000/api/customers
Content-Type: application/json

{
  "firstName": "赵",
  "lastName": "敏",
  "email": "zhao.min@example.com",
  "phone": "13800009999",
  "address": "长安街888号",
  "city": "北京",
  "province": "北京市",
  "postalCode": "100000",
  "country": "中国",
  "status": "vip",
  "totalSpent": 50000.00
}
```

### 更新客户
```bash
PUT http://localhost:3000/api/customers/1
Content-Type: application/json

{
  "phone": "13900001111",
  "status": "vip"
}
```

### 删除客户
```bash
DELETE http://localhost:3000/api/customers/1
```

##  界面特性

1. **响应式表格**：自动适配不同屏幕尺寸
2. **状态标签**：使用不同颜色区分客户状态
   - 活跃（绿色）
   - VIP（橙色）
   - 非活跃（灰色）
3. **表单验证**：必填字段、邮箱格式验证
4. **友好提示**：操作成功/失败的消息提示
5. **删除确认**：防止误操作的二次确认
6. **分页控件**：支持自定义每页显示数量
7. **搜索功能**：支持关键词和状态组合搜索

##  技术栈

### 后端
- Node.js + Koa2
- Sequelize ORM
- MySQL 数据库
- JWT 认证
- bcryptjs 密码加密

### 前端
- Vue 3（Composition API）
- Vite 构建工具
- Pinia 状态管理
- Element Plus UI 组件库
- Axios HTTP 客户端
- Vue Router 路由管理

## 🔧 后续优化建议

1. 为 Products 表添加示例数据
2. 添加图片上传功能（商品图片、客户头像）
3. 实现数据导出功能（Excel、CSV）
4. 添加数据统计图表（消费趋势、客户分布）
5. 实现权限控制（不同角色看到不同菜单）
6. 添加操作日志记录
7. 优化移动端适配
