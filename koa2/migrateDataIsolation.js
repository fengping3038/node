const { sequelize } = require('./config/db');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

async function migrateDataIsolation() {
  console.log('开始数据隔离迁移...\n');

  try {
    // 1. 同步表结构（添加 userId 字段和索引）
    console.log('1. 同步 Products 表结构...');
    await Product.sync({ alter: true });
    console.log('✓ Products 表结构同步完成\n');

    console.log('2. 同步 Customers 表结构...');
    await Customer.sync({ alter: true });
    console.log('✓ Customers 表结构同步完成\n');

    // 2. 为现有数据分配默认用户ID（如果存在无 userId 的数据）
    console.log('3. 检查并修复现有数据...');
    
    // 查找第一个用户作为默认所有者
    const User = require('./models/User');
    const firstUser = await User.findOne();
    
    if (!firstUser) {
      console.error('❌ 错误：数据库中没有任何用户，请先注册用户！');
      return;
    }

    const defaultUserId = firstUser.id;
    console.log(`   使用用户 ID ${defaultUserId} 作为现有数据的默认所有者\n`);

    // 更新没有 userId 的 Products
    const productsWithoutUser = await Product.count({
      where: { userId: null }
    });
    
    if (productsWithoutUser > 0) {
      console.log(`   发现 ${productsWithoutUser} 条商品数据缺少 userId，正在修复...`);
      await Product.update(
        { userId: defaultUserId },
        { where: { userId: null } }
      );
      console.log('   ✓ 商品数据修复完成\n');
    } else {
      console.log('   ✓ 所有商品数据已有 userId\n');
    }

    // 更新没有 userId 的 Customers
    const customersWithoutUser = await Customer.count({
      where: { userId: null }
    });

    if (customersWithoutUser > 0) {
      console.log(`   发现 ${customersWithoutUser} 条客户数据缺少 userId，正在修复...`);
      await Customer.update(
        { userId: defaultUserId },
        { where: { userId: null } }
      );
      console.log('   ✓ 客户数据修复完成\n');
    } else {
      console.log('   ✓ 所有客户数据已有 userId\n');
    }

    // 4. 清理 customers 表重复的 email 唯一索引
    //    邮箱唯一性改为按用户范围由控制器校验，全局唯一索引与数据隔离冲突；
    //    且 sync({alter:true}) 每次重启都会重复添加该索引，导致大量重复索引堆积。
    console.log('4. 清理 customers 表的重复 email 唯一索引...');
    const [indexRows] = await sequelize.query('SHOW INDEX FROM customers');
    const emailIndexes = indexRows
      .filter(r => r.Key_name.startsWith('email'))
      .map(r => r.Key_name);

    if (emailIndexes.length > 0) {
      for (const indexName of [...new Set(emailIndexes)]) {
        await sequelize.query(`DROP INDEX \`${indexName}\` ON customers`);
        console.log(`   ✓ 已删除索引: ${indexName}`);
      }
      console.log(`   共清理 ${new Set(emailIndexes).size} 个重复 email 索引\n`);
    } else {
      console.log('   ✓ 没有需要清理的 email 索引\n');
    }

    console.log('✅ 数据隔离迁移完成！\n');
    console.log('提示：');
    console.log('- 新创建的商品和客户将自动关联当前登录用户');
    console.log('- 每个用户只能看到自己创建的数据');
    console.log('- 查询、更新、删除操作都会验证数据归属权\n');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrateDataIsolation();