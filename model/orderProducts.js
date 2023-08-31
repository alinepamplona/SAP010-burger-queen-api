const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Order = require('./orders');
const Product = require('./products');

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

OrderProducts.associate = (models) => {
  OrderProducts.belongsTo(Product, {
    foreignKey: 'productId'
  });

  OrderProducts.belongsTo(Order, {
    foreignKey: 'orderId'
  });
};

module.exports = OrderProducts;