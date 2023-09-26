const Order  = require('../model/orders');
const Product = require('../model/products');
const OrderProducts = require('../model/orderProducts');
const { Op } = require("sequelize");

function formatOrder(order) {
  const formattedOrder = {
    id: order.id,
    userId: order.userId,
    client: order.client,
    status: order.status,
    dateEntry: order.dateEntry,
    dateProcessed: order.dateProcessed,
    products: order.products.map(product => ({
      qty: product.order_products.qty,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        type: product.type,
        dateEntry: product.dateEntry
      }
    }))
  }
  return formattedOrder
}

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const limit = parseInt(req.query._limit) || 10;
      const offset = (req.query._page - 1) * limit || 0;

      const orders = await Order.findAll({
        limit,
        offset,
        include: [{
          model: Product,
          as: 'products'
        }]
      });

      const responseOrders = orders.map(order => formatOrder(order))
  
      return resp.status(200).json(responseOrders);
    } catch (error) {
      return next(error);
    }
  },
  getOrderById: async (req, resp, next) => {
    try {
      const { orderId } = req.params

      const order = await Order.findByPk(orderId, {
        include: [{
          model: Product,
          as: 'products'
        }]
      })

      if (!order) {
        return next(404)
      }

      const responseOrder = formatOrder(order)

      return resp.json(responseOrder);
    } catch (error) {
      return next(error);
    }
  },
  createOrder: async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;

      if (!userId || !products || products.length === 0) {
        return resp.status(400).json({ message: 'userId e products são obrigatórios e a lista de produtos não pode estar vazia.' });
      }

      // Verifica se os produtos existem no banco de dados
      const productIds = products.map(product => product.product.id);
      const existingProducts = await Product.findAll({
        where: {
          id: {
            [Op.in]: productIds, // Procura produtos cujos IDs estejam na lista
          },
        },
      });

      if (existingProducts.length !== products.length) {
        return resp.status(400).json({ message: 'Um ou mais produtos não foram encontrados no banco de dados.' });
      }

      const status = 'pending'
      const dateEntry = new Date()

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
      const responseOrder = formatOrder(await Order.findByPk(order.id, {
        include: [{
          model: Product,
          as: 'products'
        }]
      }))

      return resp.status(200).json(responseOrder);
    } catch (error) {
      return next(error)
    }
  },
  updateOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params
      const { status } = req.body;

      const order = await Order.findByPk(orderId, {
        include: [{
          model: Product,
          as: 'products'
        }]
      })

      if(!order) {
        return next(404)
      }

      const statusType = ['pending', 'canceled', 'delivering', 'delivered']
      if (!statusType.includes(status)){
        return next(400)
      }

      order.status = status;

      if (status === 'canceled' || status === 'delivered') {
        order.dateProcessed = new Date()
      }

      order.save();

      const responseOrder = formatOrder(order)
      
      return resp.json(responseOrder)
    } catch (error) {
      return next(error)
    }
  },
  deleteOrder:  async (req, resp, next) => {
    try {
      const { orderId } = req.params

      const order = await Order.findByPk(orderId, {
        include: [{
          model: Product,
          as: 'products'
        }]
      })

      if (!order) {
        return next({statusCode: "404", message:"Pedido não encontrado"})
      }

      await Order.destroy({
        where: {
          id: orderId
        }
      })

      const responseOrder = formatOrder(order)

      return resp.json(responseOrder);
    } catch (error) {
      return next(error)
    }
  }
}
