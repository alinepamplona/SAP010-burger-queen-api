const {
  fetch,
  fetchAsTestUser,
  fetchAsAdmin,
} = process;

describe('POST /products', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/products', { method: 'POST' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 403 when not admin', () => (
    fetchAsTestUser('/products', { method: 'POST' })
      .then((resp) => expect(resp.status).toBe(403))
  ));

  it('should fail with 400 when bad props', () => (
    fetchAsAdmin('/products', { method: 'POST' })
      .then((resp) => expect(resp.status).toBe(400))
  ));

  it('should create product as admin', () => (
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-0`, price: 5, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json.id).toBe('number');
        expect(typeof json.name).toBe('string');
        expect(typeof json.price).toBe('number');
        expect(typeof json.image).toBe('string');
        expect(typeof json.type).toBe('string');
        expect(typeof json.dateEntry).toBe('string');
        return json.id
      })
      .then((id) => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' }))
  ));
});

describe('GET /products', () => {
  it('should get products with Auth', () => (
    fetchAsTestUser('/products')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        json.forEach((product) => {
          expect(typeof product.id).toBe('number');
          expect(typeof product.name).toBe('string');
          expect(typeof product.price).toBe('string');
          expect(typeof product.image).toBe('string');
          expect(typeof product.type).toBe('string');
          expect(typeof product.dateEntry).toBe('string');
        });
      })
  ));
});

describe('GET /products/:productid', () => {
  it('should fail with 404 when not found', () => (
    fetchAsTestUser('/products/notarealproduct')
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should get product with Auth', () => (
    fetchAsTestUser('/products')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(Array.isArray(json)).toBe(true);
        expect(json.length > 0).toBe(true);
        json.forEach((product) => {
          expect(typeof product.id).toBe('number');
          expect(typeof product.name).toBe('string');
          expect(typeof product.price).toBe('string');
          expect(typeof product.image).toBe('string');
          expect(typeof product.type).toBe('string');
          expect(typeof product.dateEntry).toBe('string');
        });
        return fetchAsTestUser(`/products/${json[0].id}`)
          .then((resp) => ({ resp, product: json[0] }));
      })
      .then(({ resp, product }) => {
        expect(resp.status).toBe(200);
        return resp.json().then((json) => ({ json, product }));
      })
      .then(({ json, product }) => {
        expect(json).toEqual(product);
      })
  ));
});

describe('PUT /products/:productid', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/products/xxx', { method: 'PUT' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 403 when not admin', () => {
    let id = -1
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-1`, price: 5, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        id = json.id
        return fetchAsTestUser(`/products/${json.id}`, {
        method: 'PUT',
        body: { price: 20 },
      })})
      .then((resp) => expect(resp.status).toBe(403))
      .then(() => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' }))
  });

  it('should fail with 404 when admin and not found', () => (
    fetchAsAdmin('/products/12345678901234567890', {
      method: 'PUT',
      body: { price: 1 },
    })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should fail with 400 when bad props', () => {
    let id = -1
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-2`, price: 5, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        id = json.id
        return fetchAsAdmin(`/products/${json.id}`, {
        method: 'PUT',
        body: { price: 'abc' },
      })})
      .then((resp) => expect(resp.status).toBe(400))
      .then(() => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' }))
  });

  it('should update product as admin', () => (
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-3`, price: 10, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsAdmin(`/products/${json.id}`, {
        method: 'PUT',
        body: { price: 20 },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.price).toBe(20)
        return json.id
      })
      .then((id) => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' }))
  ));
});

describe('DELETE /products/:productid', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/products/xxx', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 403 when not admin', () => {
    let id = -1
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-4`, price: 5, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        id = json.id
        return fetchAsTestUser(`/products/${json.id}`, { method: 'DELETE' })
      })
      .then((resp) => expect(resp.status).toBe(403))
      .then(() => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' }))
  });

  it('should fail with 404 when admin and not found', () => (
    fetchAsAdmin('/products/12345678901234567890', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should delete other product as admin', () => (
    fetchAsAdmin('/products', {
      method: 'POST',
      body: { name: `Test-5`, price: 5, image: 'image', type: 'type', dateEntry:'2023-09-11T18:23:38' },
    })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then(
        ({ id }) => fetchAsAdmin(`/products/${id}`, { method: 'DELETE' })
          .then((resp) => ({ resp, id })),
      )
      .then(({ resp, id }) => {
        expect(resp.status).toBe(200);
        return fetchAsAdmin(`/products/${id}`);
      })
      .then((resp) => expect(resp.status).toBe(404))
  ));
});
