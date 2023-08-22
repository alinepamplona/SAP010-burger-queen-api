const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    freezeTableName: true
});

module.exports = User;