const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '未提供认证令牌',
      data: null
    };
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '无效的认证令牌',
      data: null
    };
  }
};

module.exports = authMiddleware;
