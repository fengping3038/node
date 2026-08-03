const Router = require('koa-router');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

const router = new Router({
  prefix: '/api'
});

// 以下路由需要认证（数据隔离：只能查看/操作自己创建的数据）
router.use(authMiddleware);

// 获取所有商品（仅当前用户创建的）
router.get('/test/products', getProducts);

// 根据ID获取商品（验证归属权）
router.get('/test/products/:id', getProductById);

// 创建商品
router.post('/test/products', createProduct);

// 更新商品
router.put('/test/products/:id', updateProduct);

// 删除商品
router.delete('/test/products/:id', deleteProduct);

module.exports = router;
