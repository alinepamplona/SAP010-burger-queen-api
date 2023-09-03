const User = require('../model/users');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');

/**
 * Interface responsavel por pegar os dados do DB
 * e passar para quem fez a requisição HTTP
 */
module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      console.log(req.query)
      const users = await User.findAll(); // SELECT * FROM users

      return resp.json(users);
    } catch (error) {
      return next(error);
    }
  },
  getUserById: async (req, resp, next) => {
    try {
      const { uid } = req.params

      const user = await User.findAll({
        where: {
          [Op.or]: [
            { id: uid },
            { email: uid }
          ]
        }
      })

      return resp.json(user);
    } catch (error) {
      return next(error);
    }
  },
  createUser: async (req, resp, next) => {
    try {
      const { email, password, role } = req.body
      const user = await User.create({
        email,
        password: bcrypt.hashSync(password, 10),
        role
      })

      return resp.status(200).json(user)
    } catch (error) {
      console.log(error.message)
      
      if(error.message.includes("notNull Violation")){
        return next({statusCode: "400", message:"Email e password não podem ser vazios"})
      }

      return next(error);
    }
  },
  updateUser: async (req, resp, next) => {
    try {
      // uid = quem?
      // body = o que?
      const { uid } = req.params
      const { email, password, role } = req.body

      await User.update({
        email,
        password: bcrypt.hashSync(password, 10),
        role
      }, {
        where: {
          id: uid
        }
      })

      const user = await User.findByPk(uid)

      return resp.json(user)
    } catch (error) {
      return next(error);
    }
  },
  userDelete: async (req, resp, next) =>{
    try {
      const { uid } = req.params

      const user = await User.findByPk(uid)

      if (!user) {
        return next({statusCode: "404", message:"Usuário não encontrado"})
      }

      await User.destroy({
        where: {
          id: uid
        }
      });

      return resp.json(user)
    } catch (error) {
      return next(error);
    }
  }
};
