const Product = require('../models/Product');

// 获取所有商品（仅当前用户创建的）
const getProducts = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    
    const products = await Product.findAll({
      where: { userId },
      order: [['created_at', 'DESC']]
    });

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: products
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

// 根据ID获取商品（验证归属权）
const getProductById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    const product = await Product.findOne({
      where: { id, userId }
    });

    if (!product) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不存在或无权访问',
        data: null
      };
      return;
    }

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: product
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

// 创建商品（自动关联当前用户）
const createProduct = async (ctx) => {
  try {
    const { name, category, price, stock, description, image } = ctx.request.body;
    const userId = ctx.state.user.id;

    console.log('DEBUG: ctx.state.user =', ctx.state.user);
    console.log('DEBUG: userId =', userId);

    // 验证必填字段
    if (!name || !category || price === undefined) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '商品名称、分类和价格为必填项',
        data: null
      };
      return;
    }

    const product = await Product.create({
      name,
      category,
      price,
      stock: stock || 0,
      description,
      image,
      userId
    });

    console.log('DEBUG: Created product with userId =', userId);

    ctx.status = 201;
    ctx.body = {
      code: 201,
      message: '创建成功',
      data: product
    };
  } catch (error) {
    console.error('ERROR in createProduct:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器错误',
      data: error.message
    };
  }
};

// 更新商品（验证归属权）
const updateProduct = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, category, price, stock, description, image } = ctx.request.body;
    const userId = ctx.state.user.id;

    const product = await Product.findOne({
      where: { id, userId }
    });

    if (!product) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不存在或无权操作',
        data: null
      };
      return;
    }

    await product.update({
      name,
      category,
      price,
      stock,
      description,
      image
    });

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: product
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

// 删除商品（验证归属权）
const deleteProduct = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    const product = await Product.findOne({
      where: { id, userId }
    });

    if (!product) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不存在或无权操作',
        data: null
      };
      return;
    }

    await product.destroy();

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
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};