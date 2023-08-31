const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const OrderProducts = require('./orderProducts');
const Order = require('./orders');

const Product = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateEntry: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  freezeTableName: true
});

// Associação N:M com quantidade usando a tabela intermediária
Product.associate = (models) => {
  Product.belongsToMany(Order, {
    through: OrderProducts,
    foreignKey: 'productId',
    as: 'orders'
  });
};

module.exports = Product;