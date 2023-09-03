const Order  = require('../model/orders');
const Product = require('../model/products');
const OrderProducts = require('../model/orderProducts');

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
  /*getOrders2: async (req, resp, next) => {
    try {
      // TODO fazer query com paginação
      const limit = req.query._limit
      const offset = (req.query._page - 1)*limit

      // Pega todos os Orders
      const orders = await Order.findAll()

      // Percorre cada Order para adicionar os Produtos dela
      //orders.forEach(async (order) => 
      for (const order of orders) {
        // Pega todas as relações entre essa Order e os Products
        const orderProducts = await OrderProducts.findAll({
          where: {
            orderId: order.id
          }
        })

        console.log("orderProducts")

        // Para cada Order precisamos criar um array de products => orders.products = [ {qty, product}, {qty, product} ]
        const products = []
        //orderProducts.map(async (orderProduct) => 
        for(const orderProduct of orderProducts) {
          // para isso tem que pegar cada relação Order - Product e consultar o produto na tabela Product pelo productId
          const product = await Product.findByPk(orderProduct.productId)
          console.log(product)
          products.push({
            qty: orderProduct.qty,
            product: product
          })
        }//)

        console.log(products)
        order.dataValues.products = products
      }//);

      console.log(orders)
      return resp.json(orders)
    } catch (error) {
      return next(error)
    }
  },*/
  getOrders: async (req, resp, next) => {
    try {
      const limit = req.query._limit;
      const offset = (req.query._page - 1) * limit;
  
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

      const responseOrder = formatOrder(order)

      return resp.json(responseOrder);
    } catch (error) {
      return next(error);
    }
  },
  createOrder: async (req, resp, next) => {
    try {
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
        products,
        status,
        dateEntry
      };

      resp.json(response);
    } catch (error) {
      return next(error)
    }
  },
  updateOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params
      const { status } = req.body;

      const updateOrder = { status }

      if (status === 'canceled' || status === 'delivered') {
        updateOrder.dateProcessed = new Date()
      }

      await Order.update(updateOrder, {
        where: {
          id: orderId
        }
      })

      const order = await Order.findByPk(orderId, {
        include: [{
          model: Product,
          as: 'products'
        }]
      })

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
