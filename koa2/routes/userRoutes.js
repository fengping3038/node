const Router = require('koa-router');
const { register, login, getProfile, updateProfile, uploadAvatar } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = new Router({
  prefix: '/api'
});

// 公开路由（不需要认证）
router.post('/test/register', register);
router.post('/test/login', login);

// 需要认证的路由
router.get('/test/user/profile', auth, getProfile);
router.put('/test/user/profile', auth, updateProfile);
router.post('/test/upload-avatar', auth, uploadAvatar);

module.exports = router;
