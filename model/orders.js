const { DataTypes } = require('sequelize');
const { User } = require('./users')
const sequelize = require('../db');

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
  products: {
    type: DataTypes.JSON,
    allowNull: false,
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
    type: DataTypes.STRING
  },
}, {
  freezeTableName: true
});

module.exports = Order;