const Order  = require('../model/orders');
const Product = require('../model/products');
const OrderProducts = require('../model/orderProducts');

module.exports = {
  createOrder: async (req, resp, next) => {
    try {
      console.log(req.body)

      const { userId, client, status, dateEntry, products } = req.body;

      // Cria a ordem sem os produtos associados
      const order = await Order.create({
        userId,
        client,
        status,
        dateEntry
      });

      // Cria os registros na tabela intermediária (OrderProducts) associados à ordem
      const orderProductPromises = products.map(product => {
        return OrderProducts.create({
          orderId: order.id,
          productId: product.product.id,
          qty: product.qty
        });
      });

      // Aguarda a criação de todos os registros na tabela intermediária
      await Promise.all(orderProductPromises);

      // Constrói o objeto de resposta
      const response = {
        id: order.id,
        userId,
        client,
        products/*: products.map(product => ({
          qty: product.qty,
          product: {
            ...product.product
          }
        }))*/,
        status,
        dateEntry
      };

      resp.json(response);
    } catch (error) {
      return next(error)
    }
  }
}
