const { sequelize } = require('./config/db');

async function checkTableStructure() {
  try {
    console.log('=== 检查 Products 表结构 ===');
    const productsResult = await sequelize.query('SHOW FULL COLUMNS FROM products WHERE Field = "user_id"');
    console.log(JSON.stringify(productsResult[0], null, 2));

    console.log('\n=== 检查 Customers 表结构 ===');
    const customersResult = await sequelize.query('SHOW FULL COLUMNS FROM customers WHERE Field = "user_id"');
    console.log(JSON.stringify(customersResult[0], null, 2));

    // 尝试修改字段为允许 NULL，并设置默认值
    console.log('\n=== 修复 user_id 字段 ===');
    await sequelize.query('ALTER TABLE products MODIFY COLUMN user_id INT NULL DEFAULT 1');
    console.log('✓ Products.user_id 已修复');
    
    await sequelize.query('ALTER TABLE customers MODIFY COLUMN user_id INT NULL DEFAULT 1');
    console.log('✓ Customers.user_id 已修复');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();