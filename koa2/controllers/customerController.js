const { Op } = require('sequelize');
const Customer = require('../models/Customer');

// 获取客户列表（仅当前用户创建的）
const getCustomers = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { page = 1, limit = 10, status, keyword } = ctx.query;
    
    const where = { userId };
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${keyword}%` } },
        { lastName: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
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

// 获取单个客户（验证归属权）
const getCustomerById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    const customer = await Customer.findOne({
      where: { id, userId }
    });
    
    if (!customer) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '客户不存在或无权访问',
        data: null
      };
      return;
    }

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: customer
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

// 创建客户（自动关联当前用户）
const createCustomer = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const customerData = ctx.request.body;
    
    // 验证必填字段
    if (!customerData.firstName || !customerData.lastName || !customerData.email) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '姓、名和邮箱不能为空',
        data: null
      };
      return;
    }

    // 检查邮箱是否已存在（仅在当前用户范围内）
    const existingCustomer = await Customer.findOne({ 
      where: { 
        email: customerData.email,
        userId
      } 
    });
    if (existingCustomer) {
      ctx.status = 409;
      ctx.body = {
        code: 409,
        message: '该邮箱已被注册',
        data: null
      };
      return;
    }

    const customer = await Customer.create({
      ...customerData,
      userId
    });

    ctx.status = 201;
    ctx.body = {
      code: 201,
      message: '创建成功',
      data: customer
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

// 更新客户（验证归属权）
const updateCustomer = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    const customerData = ctx.request.body;
    
    const customer = await Customer.findOne({
      where: { id, userId }
    });
    
    if (!customer) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '客户不存在或无权操作',
        data: null
      };
      return;
    }

    // 如果更新了邮箱，检查是否与当前用户的其他客户重复
    if (customerData.email && customerData.email !== customer.email) {
      const existingCustomer = await Customer.findOne({ 
        where: { 
          email: customerData.email,
          userId,
          id: { [Op.ne]: id }
        } 
      });
      if (existingCustomer) {
        ctx.status = 409;
        ctx.body = {
          code: 409,
          message: '该邮箱已被其他客户使用',
          data: null
        };
        return;
      }
    }

    await customer.update(customerData);

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: customer
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

// 删除客户（验证归属权）
const deleteCustomer = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    const customer = await Customer.findOne({
      where: { id, userId }
    });
    
    if (!customer) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '客户不存在或无权操作',
        data: null
      };
      return;
    }

    await customer.destroy();

    ctx.body = {
      code: 200,
      message: '删除成功',
      data: null
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
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
};