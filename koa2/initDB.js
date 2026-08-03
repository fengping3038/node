const { sequelize } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 同步数据库表结构
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构创建成功');

    // 创建测试用户（密码明文存储）
    await User.create({
      username: 'admin',
      password: '123456',
      email: 'admin@example.com'
    });
    console.log('✅ 测试用户创建成功 (用户名: admin, 密码: 123456)');

    // 创建测试商品
    const products = [
      {
        name: 'iPhone 15 Pro',
        category: '手机',
        price: 7999.00,
        stock: 100,
        description: '苹果最新旗舰手机，搭载A17 Pro芯片',
        image: 'https://via.placeholder.com/200'
      },
      {
        name: 'MacBook Pro 14',
        category: '电脑',
        price: 14999.00,
        stock: 50,
        description: '专业级笔记本电脑，M3 Pro芯片',
        image: 'https://via.placeholder.com/200'
      },
      {
        name: 'AirPods Pro 2',
        category: '配件',
        price: 1899.00,
        stock: 200,
        description: '主动降噪无线耳机',
        image: 'https://via.placeholder.com/200'
      }
    ];

    await Product.bulkCreate(products);
    console.log('✅ 测试商品创建成功');

    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
