const Router = require('koa-router');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');

const router = new Router({
  prefix: '/api/test/customers'
});

// 以下路由需要认证（数据隔离：只能查看/操作自己创建的数据）
router.use(authMiddleware);

// 获取客户列表
router.get('/', getCustomers);

// 获取单个客户
router.get('/:id', getCustomerById);

// 创建客户
router.post('/', createCustomer);

// 更新客户
router.put('/:id', updateCustomer);

// 删除客户
router.delete('/:id', deleteCustomer);

module.exports = router;
