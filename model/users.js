const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Order = require('./orders');

/**
 * Cria a classe user que vai representar a tabela users no DB
 *
 * User = {
 *  id (INT) - gerado automaticamente pelo MySQL
 *  email (STRING)
 *  password (STRING)
 *  role (STRING) [ admin, waiter, chef ]
 *  createdAt (DATE) - gerado automaticamente pelo Sequelize
 *  updatedAt (DATE) - gerado automaticamente pelo Sequelize
 * }
 * */
const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'waiter', 'chef'),
      allowNull: false,
    },
  }, {
    freezeTableName: true
});

// Relação 1:M
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User);

module.exports = User;