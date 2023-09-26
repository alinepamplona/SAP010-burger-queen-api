const Product = require('../model/products');
const { Op } = require("sequelize");

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const limit = req.query._limit
      const offset = (req.query._page - 1)*limit

      const products = await Product.findAll()//{ offset, limit } // SELECT * FROM users

      return resp.json(products);
    } catch (error) {
      return next(error);
    }
  },
  getProductById: async (req, resp, next) => {
    try {
      const { productId } = req.params

      const product = await Product.findByPk(productId)

      if (!product) {
        return next(404)
      }

      return resp.json(product);
    } catch (error) {
      return next(error);
    }
  },
  createProduct: async (req, resp, next) => {
    try {
      const product = await Product.create(req.body) // {name: "", price:0, image:"", type:""}

      return resp.status(200).json(product)
    } catch (error) {
      
      if(error.message.includes("notNull Violation")){
        return next({statusCode: "400", message:"Nenhum campo pode ser vazio"})
      }

      return next(error);
    }
  },
  updateProduct: async (req, resp, next) => {
    try {
      const { productId } = req.params

      const product = await Product.findByPk(productId)

      if (!product) {
        return next(404)
      }

      const { name, price, image, type } = req.body

      if(name) {
        product.name = name
      }

      if(price) {
        if (typeof price !== 'number') {
          return next(400)
        }
        product.price = price
      }

      if(image) {
        product.image = image
      }

      if(type) {
        product.type = type
      }

      product.save()

      return resp.json(product)
    } catch (error) {
      return next(error)
    }
  },
  deleteProduct: async (req, resp, next) => {
    try {
      const { productId } = req.params

      const product = await Product.findByPk(productId)

      if (!product) {
        return next({statusCode: "404", message:"Produto não encontrado"})
      }

      await Product.destroy({
        where: {
          id: productId
        }
      })

      return resp.json(product)
    } catch (error) {
      return next(error)
    }
  }
}