const Order  = require('../model/orders');
const Product = require('../model/products');

module.exports = {
  createOrder: async (req, resp, next) => {
    try {
      console.log(req.body)

      const order = await Order.create(req.body)

      const { products } = order

      const productsModel = []
      for(const productOrder of products) {
        const { qty, id } = productOrder
        const product = await Product.findByPk(id)
        productsModel.push({ qty, product })
      }

      order.products = productsModel

      return resp.json(order)
    } catch (error) {
      return next(error)
    }
  }
}
