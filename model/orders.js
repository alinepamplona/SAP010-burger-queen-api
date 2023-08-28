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

// Associação N:M com quantidade usando a tabela intermediária
Order.associate = (models) => {
  Order.belongsToMany(models.Product, {
    through: models.OrderProducts,
    foreignKey: 'orderId',
  });
};

module.exports = Order;