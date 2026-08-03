const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    field: 'first_name',
    allowNull: false,
    comment: '姓'
  },
  lastName: {
    type: DataTypes.STRING(50),
    field: 'last_name',
    allowNull: false,
    comment: '名'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '邮箱（按用户唯一，由控制器校验）'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '电话'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '地址'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '城市'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '省份'
  },
  postalCode: {
    type: DataTypes.STRING(20),
    field: 'postal_code',
    allowNull: true,
    comment: '邮政编码'
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '中国',
    comment: '国家'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'vip'),
    allowNull: true,
    defaultValue: 'active',
    comment: '状态'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_spent',
    allowNull: true,
    defaultValue: 0.00,
    comment: '总消费金额'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '创建者ID'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

module.exports = Customer;