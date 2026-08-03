const { sequelize } = require('./config/db');
const User = require('./models/User');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！\n');
    
    const users = await User.findAll();
    console.log('用户列表:');
    console.log('='.repeat(80));
    
    users.forEach(u => {
      console.log(`ID: ${u.id}`);
      console.log(`用户名: ${u.username}`);
      console.log(`密码前缀: ${u.password.substring(0, 10)}`);
      console.log(`邮箱: ${u.email || '无'}`);
      console.log(`头像: ${u.avatar || '无'}`);
      console.log('-'.repeat(80));
    });
    
    console.log(`\n总共 ${users.length} 个用户`);
    
    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
})();
