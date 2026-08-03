# 🚀 快速访问指南

## 📍 当前服务状态

### ✅ 后端服务器（Koa2）
- **状态**：运行中
- **端口**：3000
- **地址**：http://localhost:3000
- **进程 ID**：18928

### ✅ 前端服务器（Vite + Vue3）
- **状态**：运行中
- **端口**：5174
- **地址**：http://localhost:5174
- **终端 ID**：4a160947-38b8-449f-bc05-b603e4cca95f

## 🎯 立即开始使用

### 步骤 1：打开浏览器
在浏览器地址栏输入：**http://localhost:5174**

### 步骤 2：登录系统
使用以下任一账号登录：

| 用户名 | 密码 | 说明 |
|--------|------|------|
| testuser | 123456 | 测试用户 |
| 电饭锅 | 123123 | 中文用户名 |
| 工地发光时代 | 111111 | 中文用户名 |
| 梵蒂冈阿萨德 | 123123 | 中文用户名 |
| testuser1 | 123456 | 测试用户 |

> ⚠️ **注意**：所有密码已经过 bcrypt 加密处理，可以正常使用

### 步骤 3：浏览功能

登录后，您将看到顶部导航栏，包含以下菜单：

#### 📦 商品管理
- 查看商品列表
- 添加/编辑/删除商品
- （当前数据库中没有商品数据，可以手动添加）

#### 👥 客户管理（新增）
- 查看客户列表（已有 20 条测试数据）
- 搜索和筛选客户
- 添加新客户
- 编辑客户信息
- 删除客户
- 查看客户详情

## 🧪 API 测试

如果想直接测试后端 API，可以：

### 方式一：使用浏览器
打开文件：**e:\pm\node\koa2\test-api.html**

这个页面提供了可视化的 API 测试界面，可以点击按钮测试：
- 获取客户列表
- 搜索客户
- 筛选 VIP 客户
- 获取客户详情
- 创建客户
- 更新客户
- 删除客户

### 方式二：使用命令行工具

#### PowerShell 示例：
```powershell
# 获取客户列表
Invoke-WebRequest -Uri "http://localhost:3000/api/customers?page=1&limit=5" | Select-Object -ExpandProperty Content

# 搜索客户
Invoke-WebRequest -Uri "http://localhost:3000/api/customers?keyword=张" | Select-Object -ExpandProperty Content

# 获取单个客户
Invoke-WebRequest -Uri "http://localhost:3000/api/customers/1" | Select-Object -ExpandProperty Content
```

#### Git Bash / WSL 示例：
```bash
# 获取客户列表
curl http://localhost:3000/api/customers?page=1^&limit=5

# 搜索客户
curl http://localhost:3000/api/customers?keyword=张

# 创建客户
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"赵\",\"lastName\":\"敏\",\"email\":\"zhao.min@example.com\",\"phone\":\"13800009999\",\"status\":\"vip\"}"
```

## 📊 数据库概览

### 表结构

| 表名 | 记录数 | 用途 | 状态 |
|------|--------|------|------|
| users | 5 | 用户登录认证 | ✅ 已完成 |
| products | 0 | 商品信息 | ✅ 已完成（无数据） |
| customers | 20 | 客户信息管理 | ✅ 新增完成 |

### 客户数据预览

前 5 条客户数据：

1. **张伟** (VIP)
   - 邮箱：zhang.wei@email.com
   - 电话：13800001111
   - 地区：北京市 北京
   - 总消费：¥25,800.50

2. **王芳** (活跃)
   - 邮箱：wang.fang@email.com
   - 电话：13900002222
   - 地区：上海市 上海
   - 总消费：¥3,200.00

3. **李娜** (活跃)
   - 邮箱：li.na@email.com
   - 电话：13700003333
   - 地区：四川省 成都
   - 总消费：¥1,500.00

4. **刘洋** (VIP)
   - 邮箱：liu.yang@email.com
   - 电话：13600004444
   - 地区：广东省 深圳
   - 总消费：¥18,900.00

5. **陈静** (活跃)
   - 邮箱：chen.jing@email.com
   - 电话：13500005555
   - 地区：浙江省 杭州
   - 总消费：¥4,500.00

## 🔍 故障排查

### 问题 1：无法访问前端页面

**症状**：浏览器显示"无法连接"或"页面不存在"

**解决方案**：
1. 检查前端服务器是否正在运行
2. 确认端口号是否正确（应该是 5174）
3. 尝试刷新页面或清除浏览器缓存

### 问题 2：登录后看不到导航栏

**症状**：登录后仍然显示登录页面

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签是否有错误
3. 查看 Application/Storage 标签，确认 localStorage 中有 'token' 项
4. 尝试清除 localStorage 后重新登录

### 问题 3：客户列表加载失败

**症状**：点击"客户管理"后页面空白或显示错误

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看 Network 标签，确认 `/api/customers` 请求是否成功
3. 如果请求失败，检查后端服务器是否在 3000 端口运行
4. 查看 Console 标签是否有 CORS 或其他错误

### 问题 4：API 返回 401 错误

**症状**：调用需要认证的接口时返回 401

**解决方案**：
1. 确认已登录并获取到 token
2. 检查请求头中是否包含 `Authorization: Bearer <token>`
3. 确认 token 未过期（默认 7 天）
4. 尝试重新登录获取新 token

### 问题 5：注册接口返回 500 错误

**症状**：注册新用户时返回 500 错误

**解决方案**：
1. 检查后端服务器日志
2. 确认数据库连接正常
3. 确认 email 字段未被其他用户占用
4. 查看浏览器控制台的详细错误信息

## 🛠️ 停止服务

如果需要停止服务器：

### 停止后端服务器
```bash
# 方法 1：在运行 npm start 的终端按 Ctrl+C

# 方法 2：查找并终止进程
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### 停止前端服务器
```bash
# 在运行 npm run dev 的终端按 Ctrl+C
```

## 📞 获取帮助

如果遇到问题，可以：

1. 查看项目文档：
   - [完成总结](./COMPLETION_SUMMARY.md)
   - [数据库表说明](./DATABASE_TABLES.md)
   - [项目概述](./PROJECT_OVERVIEW.md)

2. 检查服务器日志：
   - 后端日志在 koa2 目录的终端中
   - 前端日志在 web 目录的终端中

3. 使用浏览器开发者工具调试：
   - F12 打开开发者工具
   - 查看 Console 标签的错误信息
   - 查看 Network 标签的请求详情

##  享受使用！

现在您可以：
- ✅ 登录系统
- ✅ 浏览客户列表
- ✅ 搜索和筛选客户
- ✅ 添加、编辑、删除客户
- ✅ 查看客户详情
- ✅ 管理商品信息

祝您使用愉快！🚀
