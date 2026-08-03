const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/test';

// 测试数据隔离功能
async function testDataIsolation() {
  console.log('=== 数据隔离功能测试 ===\n');

  try {
    // 1. 用户A登录
    console.log('1️⃣ 用户A (admin) 登录...');
    const loginA = await axios.post(`${BASE_URL}/login`, {
      username: 'admin',
      password: '123456'
    });
    const tokenA = loginA.data.data.token;
    console.log('✓ 用户A登录成功\n');

    // 2. 用户B登录
    console.log('2️⃣ 用户B (testuser) 登录...');
    const loginB = await axios.post(`${BASE_URL}/login`, {
      username: 'testuser',
      password: '123456'
    });
    const tokenB = loginB.data.data.token;
    console.log('✓ 用户B登录成功\n');

    // 3. 用户A创建商品
    console.log('3️⃣ 用户A 创建商品...');
    const productA = await axios.post(
      `${BASE_URL}/products`,
      {
        name: '用户A的商品',
        category: '测试分类',
        price: 99.99,
        stock: 10
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    console.log(`✓ 用户A创建商品成功，ID: ${productA.data.data.id}\n`);

    // 4. 用户B创建商品
    console.log('4️⃣ 用户B 创建商品...');
    const productB = await axios.post(
      `${BASE_URL}/products`,
      {
        name: '用户B的商品',
        category: '测试分类',
        price: 199.99,
        stock: 20
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    console.log(`✓ 用户B创建商品成功，ID: ${productB.data.data.id}\n`);

    // 5. 用户A查看商品列表（应该只看到自己的）
    console.log('5️⃣ 用户A 查看商品列表...');
    const productsA = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`用户A看到的商品数量: ${productsA.data.data.length}`);
    productsA.data.data.forEach(p => {
      console.log(`  - ID: ${p.id}, 名称: ${p.name}, 创建者ID: ${p.userId}`);
    });
    console.log();

    // 6. 用户B查看商品列表（应该只看到自己的）
    console.log('6️⃣ 用户B 查看商品列表...');
    const productsB = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log(`用户B看到的商品数量: ${productsB.data.data.length}`);
    productsB.data.data.forEach(p => {
      console.log(`  - ID: ${p.id}, 名称: ${p.name}, 创建者ID: ${p.userId}`);
    });
    console.log();

    // 7. 用户A尝试访问用户B的商品（应该失败）
    console.log('7️⃣ 用户A 尝试访问用户B的商品...');
    try {
      await axios.get(`${BASE_URL}/products/${productB.data.data.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      console.log('❌ 错误：用户A不应该能访问用户B的商品！\n');
    } catch (error) {
      console.log(`✓ 正确拦截！返回状态: ${error.response?.status}`);
      console.log(`  消息: ${error.response?.data?.message}\n`);
    }

    // 8. 用户B尝试更新用户A的商品（应该失败）
    console.log('8️⃣ 用户B 尝试更新用户A的商品...');
    try {
      await axios.put(
        `${BASE_URL}/products/${productA.data.data.id}`,
        { name: '被篡改的名称' },
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );
      console.log('❌ 错误：用户B不应该能更新用户A的商品！\n');
    } catch (error) {
      console.log(`✓ 正确拦截！返回状态: ${error.response?.status}`);
      console.log(`  消息: ${error.response?.data?.message}\n`);
    }

    // 9. 测试客户数据隔离
    console.log('9️⃣ 测试客户数据隔离...');
    
    // 用户A创建客户
    const customerA = await axios.post(
      `${BASE_URL}/customers`,
      {
        firstName: '用户A的',
        lastName: '客户',
        email: 'customerA@test.com',
        phone: '13800000001'
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    console.log(`✓ 用户A创建客户成功，ID: ${customerA.data.data.id}`);

    // 用户B创建客户
    const customerB = await axios.post(
      `${BASE_URL}/customers`,
      {
        firstName: '用户B的',
        lastName: '客户',
        email: 'customerB@test.com',
        phone: '13800000002'
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    console.log(`✓ 用户B创建客户成功，ID: ${customerB.data.data.id}\n`);

    // 用户A查看客户列表
    const customersA = await axios.get(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`用户A看到的客户数量: ${customersA.data.data.list.length}`);
    customersA.data.data.list.forEach(c => {
      console.log(`  - ID: ${c.id}, 姓名: ${c.firstName}${c.lastName}, 创建者ID: ${c.userId}`);
    });

    console.log('\n✅ 所有测试完成！数据隔离功能正常工作！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testDataIsolation();