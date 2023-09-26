const {
  fetch,
  fetchAsTestUser,
  fetchAsAdmin,
} = process;

describe('POST /orders', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders', { method: 'POST' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 400 when bad props', () => (
    fetchAsTestUser('/orders', { method: 'POST', body: {} })
      .then((resp) => expect(resp.status).toBe(400))
  ));

  it('should fail with 400 when empty items', () => (
    fetchAsTestUser('/orders', {
      method: 'POST',
      body: { products: [] },
    })
      .then((resp) => {
        expect(resp.status).toBe(400);
      })
  ));

  it('should create order as user (own order)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-0`, price: 10, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => {
        return fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 5 }], client: 'test-client', userId: user.id },
      })})
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json.id).toBe('number');
        expect(json.client).toBe('test-client');
        expect(typeof json.dateEntry).toBe('string');
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('TestOrder-0');
        expect(json.products[0].product.price).toBe('10.00');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));

  it('should create order as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-1`, price: 25, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsAdmin('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 25 }], client: 'test-client', userId: user.id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json.id).toBe('number');
        expect(json.client).toBe('test-client');
        expect(typeof json.dateEntry).toBe('string');
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('TestOrder-1');
        expect(json.products[0].product.price).toBe('25.00');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));
});

describe('GET /orders', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders')
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should get orders as user', () => {
    let productId = -1
    let orderId1 = -1
    let orderId2 = -1
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 10, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => (
        Promise.all([
          fetchAsTestUser('/orders', {
            method: 'POST',
            body: { products: [{ product: { id: product.id }, qty: 50 }], client: 'test-client-test', userId: user.id },
          }),
          fetchAsAdmin('/orders', {
            method: 'POST',
            body: { products: [{ product: { id: product.id }, qty: 25 }], client: 'test-client-admin', userId: user.id },
          }),
        ])
          .then((responses) => {
            expect(responses[0].status).toBe(200);
            expect(responses[1].status).toBe(200);
            return Promise.all([responses[0].json(), responses[1].json()])
          })
          .then(([order1, order2]) => {
            orderId1 = order1.id
            orderId2 = order2.id
            productId = order1.products[0].product.id
            return fetchAsTestUser('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      ))
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (
          (memo.indexOf(order.userId) === -1)
            ? [...memo, order.userId]
            : memo
        ), []);
        expect(userIds.length >= 1).toBe(true);
        fetchAsAdmin(`/products/${productId}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId1}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId2}`, { method: 'DELETE' })
      })
    });

  it('should get orders as admin', () => {
    let productId = -1
    let orderId1 = -1
    let orderId2 = -1
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 10, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => (
        Promise.all([
          fetchAsTestUser('/orders', {
            method: 'POST',
            body: { products: [{ product: { id: product.id }, qty: 50 }], client: `test-client-test-${Date.now()}`, userId: user.id },
          }),
          fetchAsAdmin('/orders', {
            method: 'POST',
            body: { products: [{ product: { id: product.id }, qty: 25 }], client: `test-client-admin-${Date.now()}`, userId: user.id },
          }),
        ])
          .then((responses) => {
            expect(responses[0].status).toBe(200);
            expect(responses[1].status).toBe(200);
            return Promise.all([responses[0].json(), responses[1].json()])
          })
          .then(([order1, order2]) => {
            orderId1 = order1.id
            orderId2 = order2.id
            productId = order1.products[0].product.id
            return fetchAsAdmin('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      ))
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (
          (memo.indexOf(order.userId) === -1)
            ? [...memo, order.userId]
            : memo
        ), []);
        expect(userIds.length >= 1).toBe(true);
        fetchAsAdmin(`/products/${productId}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId1}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId2}`, { method: 'DELETE' })
      })
  });
});

describe('GET /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx')
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when admin and not found', () => (
    fetchAsAdmin('/orders/xxx')
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should get order as user', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-4`, price: 99, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 50 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/orders/${json.id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('TestOrder-4');
        expect(json.products[0].product.price).toBe('99.00');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));

  it('should get order as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-5`, price: 49, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 5 }], client: `test-client-admin-${Date.now()}`, userId: user.id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsAdmin(`/orders/${json.id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('TestOrder-5');
        expect(json.products[0].product.price).toBe('49.00');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));
});

describe('PUT /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx', { method: 'PUT' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when not found', () => (
    fetchAsAdmin('/orders/xxx', {
      method: 'PUT',
      body: { state: 'canceled' },
    })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should fail with 400 when bad props', () => {
    let orderId = -1;
    let productId = -1;
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 66, image: 'image', type: 'type', dateEntry:'2023-09-19T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => {
        productId = product.id;
        return fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 6 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      })})
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/orders/${json.id}`))
      .then((resp) => resp.json())
      .then((json) => {
        orderId = json.id;
        return fetchAsAdmin(`/orders/${json.id}`, { method: 'PUT' })
      })
      .then((resp) => expect(resp.status).toBe(400))
      .then(() => {
        fetchAsAdmin(`/products/${productId}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId}`, { method: 'DELETE' })
      })
  });

  it('should fail with 400 when bad status', () => {
    let orderId = -1;
    let productId = -1;
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 77, image: 'image', type: 'type', dateEntry:'2023-09-19T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => {
        productId = product.id;
        return fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 7 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      })})
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        orderId = json.id;
        return fetchAsAdmin(`/orders/${json.id}`, {
        method: 'PUT',
        body: { status: 'oh yeah!' },
      })})
      .then((resp) => expect(resp.status).toBe(400))
      .then(() => {
        fetchAsAdmin(`/products/${productId}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${orderId}`, { method: 'DELETE' })
      })
  });

  it('should update order (set status to canceled)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 88, image: 'image', type: 'type', dateEntry:'2023-09-19T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => {
        productId = product.id;
        return fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 8 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      })})
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json.id}`, {
          method: 'PUT',
          body: { status: 'canceled' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('canceled')
        expect(typeof json.dateProcessed).toBe('string');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));

  it('should update order (set status to delivering)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 22, image: 'image', type: 'type', dateEntry:'2023-09-19T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 2 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json.id}`, {
          method: 'PUT',
          body: { status: 'delivering' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('delivering')
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));

  it('should update order (set status to delivered)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 111, image: 'image', type: 'type', dateEntry:'2023-09-19T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ product: { id: product.id }, qty: 11 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json.id}`, {
          method: 'PUT',
          body: { status: 'delivered' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('delivered');
        expect(typeof json.dateProcessed).toBe('string');
        fetchAsAdmin(`/products/${json.products[0].product.id}`, { method: 'DELETE' })
        fetchAsAdmin(`/orders/${json.id}`, { method: 'DELETE' })
      })
  ));
});

describe('DELETE /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when not found', () => (
    fetchAsAdmin('/orders/xxx', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should delete other order as admin', () => {
    let productId = -1;
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: `TestOrder-${Date.now()}`, price: 45, image: 'image', type: 'type', dateEntry:'2023-09-18T18:23:38' },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => {
        productId = product.id
        return fetchAsTestUser('/orders', {
        method: 'POST',
          body: { products: [{ product: { id: product.id }, qty: 50 }], client: `test-client-test-${Date.now()}`, userId: user.id },
      })})
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then(
        ({ id }) => fetchAsAdmin(`/orders/${id}`, { method: 'DELETE' })
          .then((resp) => ({ resp, id })),
      )
      .then(({ resp, id }) => {
        expect(resp.status).toBe(200);
        return fetchAsAdmin(`/orders/${id}`);
      })
      .then((resp) => {
        expect(resp.status).toBe(404)
        fetchAsAdmin(`/products/${productId}`, { method: 'DELETE' })
      })
  });
});
