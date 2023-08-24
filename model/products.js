const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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
  dataEntry: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  freezeTableName: true
});

module.exports = Product;