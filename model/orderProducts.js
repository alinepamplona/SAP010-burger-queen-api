const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OrderProducts = sequelize.define('order_products', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true
});

module.exports = OrderProducts;