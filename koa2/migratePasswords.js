const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('开始迁移密码...\n');
    
    // 获取所有用户
    const users = await User.findAll();
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    if (users.length === 0) {
      console.log('数据库中没有用户，无需迁移');
      await sequelize.close();
      process.exit(0);
    }
    
    console.log(`找到 ${users.length} 个用户，开始检查...\n`);
    
    for (const user of users) {
      try {
        // 检查密码是否已经是bcrypt哈希（以$2a、$2b或$2y开头）
        if (user.password.startsWith('$2a') || user.password.startsWith('$2b') || user.password.startsWith('$2y')) {
          console.log(`✓ 跳过用户 "${user.username}" - 密码已加密`);
          skippedCount++;
          continue;
        }
        
        // 加密明文密码
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        
        console.log(`✓ 迁移用户 "${user.username}" 成功`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ 迁移用户 "${user.username}" 失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n========================================');
    console.log('迁移完成！');
    console.log('========================================');
    console.log(`总用户数: ${users.length}`);
    console.log(`已迁移: ${migratedCount} 个用户`);
    console.log(`已跳过: ${skippedCount} 个用户`);
    console.log(`失败: ${errorCount} 个用户`);
    console.log('========================================\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
})();
