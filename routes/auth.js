const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const User = require('../model/users');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({message: "Email ou password vazio"});
    }

    const users = await User.findAll({
      where: {
        email: email
      }
    })

    // email não cadastrado
    if(!users || users.length === 0) {
      return resp.status(404).json({message: "Email não cadastrado"})
    }

    const user = users[0]
    const passwordCheck = await bcrypt.compare(password, user.password)
    if (!passwordCheck) {
      return resp.status(404).json({message: "Password incorreto"})
    }

    const token = jwt.sign({ user }, secret, {
      expiresIn: 3600
    })

    return resp.status(200).json({auth: true, token})
  });

  return nextMain();
};
