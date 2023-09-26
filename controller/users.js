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
      const limit = parseInt(req.query.limit) || 10;
      const offset = (req.query.page - 1) * limit || 0;

      const users = await User.findAll({
        limit,
        offset
      }); // SELECT * FROM users

      return resp.json(users);
    } catch (error) {
      return next(error);
    }
  },
  getUserById: async (req, resp, next) => {
    try {
      const { uid } = req.params

      const users = await User.findAll({
        where: {
          [Op.or]: [
            { id: uid },
            { email: uid }
          ]
        }
      })

      // Usuario não existe no banco de dados
      if (!users || users.length === 0) {
        return next(404)
      }

      const user = users[0]

      // Usuario que fez a requisição não é admin e nem esta buscando ele mesmo
      if(req.user.role === 'admin' || req.user.id === user.id) {
        return resp.status(200).json(user);
      } else {
        return next(403)
      }
    } catch (error) {
      return next(error);
    }
  },
  createUser: async (req, resp, next) => {
    try {
      const { email, password, role } = req.body

      if (!email || !password || password === "") {
        return resp.status(400).json({message:"Email e password não podem ser vazios"})
      }

      const users = await User.findAll({
        where: {
          email: email
        }
      })

      if (users.length > 0) {
        return resp.status(403).json({message:"Email já cadastrado"})
      }

      const user = await User.create({
        email,
        password: bcrypt.hashSync(password, 10),
        role
      })

      return resp.status(200).json(user)
    } catch (error) {
      console.log(error.message)
      
      if(error.message.includes("notNull Violation")){
        return resp.status(400).json({message:"Nenhum campo pode ser vazios"})
      }

      if (error.message.includes("Data truncated for column 'role'")) {
        return resp.status(400).json({message:"Role só pode ser admin, waiter ou chef"})
      }

      return next(error);
    }
  },
  updateUser: async (req, resp, next) => {
    try {
      // uid = quem?
      // body = o que?
      const { uid } = req.params

      const users = await User.findAll({
        where: {
          [Op.or]: [
            { id: uid },
            { email: uid }
          ]
        }
      })

      if (users.length === 0) {
        if (req.user.role === 'admin') {
          return next(404)
        } else {
          return next(403)
        }
      }

      const user = users[0]

      // Usuario que fez a requisição não é admin e nem esta buscando ele mesmo
      if(req.user.role === 'admin') {
        if (Object.keys(req.body).length === 0) {
          return resp.status(400).json({message:"Nada para atualizar."});
        }
        const { email, password, role } = req.body
        if (password) {
          user.password = bcrypt.hashSync(password, 10)
        }
        if (email) {
          user.email = email
        }
        if (role) {
          user.role = role
        }
        user.save()
        return resp.status(200).json(user);
      } else if (req.user.id === user.id) {
        if (Object.keys(req.body).length === 0) {
          return resp.status(400).json({message:"Nada para atualizar."});
        }
        const { email, password, role } = req.body
        if (role) {
          return next(403)
        }
        if (password) {
          user.password = bcrypt.hashSync(password, 10)
        }
        if (email) {
          user.email = email
        }
        user.save()
        return resp.status(200).json(user);
      } else {
        return next(403)
      }
    } catch (error) {
      return next(error);
    }
  },
  userDelete: async (req, resp, next) =>{
    try {
      const { uid } = req.params

      const users = await User.findAll({
        where: {
          [Op.or]: [
            { id: uid },
            { email: uid }
          ]
        }
      })

      if (users.length === 0) {
        if (req.user.role === 'admin') {
          return next(404)
        } else {
          return next(403)
        }
      }

      const user = users[0]

      if(req.user.role === 'admin' || req.user.id === user.id) {

        user.destroy()

        return resp.status(200).json(user);
      } else {
        return next(403)
      }
    } catch (error) {
      return next(error);
    }
  }
};
