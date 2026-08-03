const Koa = require('koa');
const koaBody = require('koa-body').default;
const cors = require('@koa/cors');
const mimeTypes = require('mime-types');
const path = require('path');
const fs = require('fs');
const { testConnection, sequelize } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
require('dotenv').config();

const app = new Koa();

// 确保头像上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件
app.use(cors()); // 跨域支持
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  }
})); // 请求体解析（支持 JSON / form 数据 / 文件上传）

// 静态文件服务 - 提供上传的头像文件
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/uploads/')) {
    const filename = path.basename(ctx.path);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      ctx.type = mimeTypes.lookup(filename) || 'application/octet-stream';
      ctx.body = fs.createReadStream(filePath);
    } else {
      ctx.status = 404;
      ctx.body = { code: 404, message: '文件不存在', data: null };
    }
  } else {
    await next();
  }
});

// 路由
console.log('注册用户路由...');
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
console.log('注册用户路由完成');

console.log('注册商品路由...');
app.use(productRoutes.routes());
app.use(productRoutes.allowedMethods());
console.log('注册商品路由完成');

console.log('注册客户路由...');
app.use(customerRoutes.routes());
app.use(customerRoutes.allowedMethods());
console.log('注册客户路由完成');

// 错误处理
app.on('error', (err) => {
  console.error('服务器错误:', err);
});

// 启动服务器
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 设置SQL模式以允许零日期值（解决MySQL严格模式问题）
    await sequelize.query("SET SESSION sql_mode = 'NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
    console.log('✅ SQL模式已更新');

    // 同步数据库模型（开发环境使用，生产环境建议使用迁移）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库模型同步成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📊 API文档:`);
      console.log(`   - POST http://localhost:${PORT}/api/register (注册)`);
      console.log(`   - POST http://localhost:${PORT}/api/login (登录)`);
      console.log(`   - GET  http://localhost:${PORT}/api/products (获取商品列表)`);
      console.log(`   - GET  http://localhost:${PORT}/api/products/:id (获取单个商品)`);
      console.log(`   - POST http://localhost:${PORT}/api/products (创建商品，需认证)`);
      console.log(`   - PUT  http://localhost:${PORT}/api/products/:id (更新商品，需认证)`);
      console.log(`   - DELETE http://localhost:${PORT}/api/products/:id (删除商品，需认证)`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
