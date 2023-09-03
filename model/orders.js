const { DataTypes } = require('sequelize');
const { User } = require('./users')
const sequelize = require('../db');
const Product = require('./products');
const OrderProducts = require('./orderProducts');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'canceled', 'delivering', 'delivered'),
    allowNull: false,
  },
  dateEntry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateProcessed: {
    type: DataTypes.DATE
  },
}, {
  freezeTableName: true
});

// Associação N:M com quantidade usando a tabela intermediária
//Order.associate = (models) => {
  Order.belongsToMany(Product, {
    through: OrderProducts,
    foreignKey: 'orderId',
    as: 'products'
  });
//};

module.exports = Order;