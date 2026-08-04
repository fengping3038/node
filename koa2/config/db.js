const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQL_DATABASE,
  process.env.DB_USER || process.env.MYSQL_USER,
  process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  {
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: process.env.DB_PORT || process.env.MYSQL_PORT,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: false, // 生产环境关闭日志
    // TiDB Cloud Serverless 强制 TLS；设置 DB_SSL=true 启用（本地 MySQL 无需）
    dialectOptions:
      process.env.DB_SSL === 'true'
        ? { ssl: { rejectUnauthorized: false } }
        : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
};

module.exports = { sequelize, testConnection };
