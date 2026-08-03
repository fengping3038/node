const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// 用户注册
const register = async (ctx) => {
  try {
    const { username, password, email } = ctx.request.body;

    // 验证必填字段
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      };
      return;
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      ctx.status = 409;
      ctx.body = {
        code: 409,
        message: '用户名已存在',
        data: null
      };
      return;
    }

    // 创建用户（明文存储密码）
    const user = await User.create({
      username,
      password,  // 直接存储明文密码
      email
    });

    ctx.status = 201;
    ctx.body = {
      code: 201,
      message: '注册成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

// 用户登录
const login = async (ctx) => {
  try {
    const { username, password } = ctx.request.body;

    // 验证必填字段
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      };
      return;
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '用户名或密码错误',
        data: null
      };
      return;
    }

    // 验证密码（明文直接比较）
    if (password !== user.password) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '用户名或密码错误',
        data: null
      };
      return;
    }

    // 生成JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

// 获取当前用户信息
const getProfile = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'avatar']
    });
    
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null
      };
      return;
    }
    
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: user
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

// 更新用户信息
const updateProfile = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { username, oldPassword, newPassword, avatar } = ctx.request.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null
      };
      return;
    }
    
    // 如果要修改密码，需要验证旧密码
    if (newPassword) {
      if (!oldPassword) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '修改密码需要提供当前密码',
          data: null
        };
        return;
      }
      
      // 验证旧密码（明文比较）
      if (oldPassword !== user.password) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '当前密码错误',
          data: null
        };
        return;
      }
      
      // 直接存储新密码（明文）
      user.password = newPassword;
    }
    
    // 更新用户名
    if (username && username !== user.username) {
      // 检查新用户名是否已被使用
      const existingUser = await User.findOne({ 
        where: { username, id: { [require('sequelize').Op.ne]: userId } } 
      });
      
      if (existingUser) {
        ctx.status = 409;
        ctx.body = {
          code: 409,
          message: '用户名已存在',
          data: null
        };
        return;
      }
      
      user.username = username;
    }
    
    // 更新头像
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    
    await user.save();
    
    ctx.body = {
      code: 200,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

// 上传头像
const uploadAvatar = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const file = ctx.request.files?.avatar;
    
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '请选择要上传的头像',
        data: null
      };
      return;
    }
    
    // 头像文件已由 koa-body 保存到 uploads 目录，这里返回可访问的URL
    // newFilename 是保存到磁盘的实际文件名（保留扩展名）
    const avatarUrl = `http://localhost:3000/uploads/${file.newFilename || file.name}`;
    
    // 更新数据库中的头像字段
    const user = await User.findByPk(userId);
    if (user) {
      user.avatar = avatarUrl;
      await user.save();
    }
    
    ctx.body = {
      code: 200,
      message: '上传成功',
      data: {
        avatar: avatarUrl
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

module.exports = { 
  register, 
  login,
  getProfile,
  updateProfile,
  uploadAvatar
};
