import { http, HttpResponse } from 'msw';
import { expect, test } from 'vitest';
import { ApiError } from '@/lib/api/ApiError';
import { server } from '@/test/msw/server';
import {
  productDetailFixture,
  productSummaryFixture,
  testApiUrl,
} from '@/test/msw/handlers';
import { getProductById, getProducts } from './productsApi';

test('sends configured authentication and list parameters, and maps the response', async () => {
  let receivedRequest: Request | undefined;
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      receivedRequest = request;
      return HttpResponse.json([productSummaryFixture]);
    }),
  );

  const products = await getProducts({
    search: 'Phone & brand',
    limit: 5,
    offset: 10,
  });

  expect(receivedRequest?.headers.get('x-api-key')).toBe('test-api-key');
  expect(receivedRequest?.headers.get('accept')).toBe('application/json');
  expect(
    receivedRequest &&
      Object.fromEntries(new URL(receivedRequest.url).searchParams),
  ).toEqual({
    search: 'Phone & brand',
    limit: '5',
    offset: '10',
  });
  expect(products).toEqual([
    {
      id: 'phone-1',
      brand: 'Example',
      name: 'Example Phone',
      basePrice: 500,
      image: 'https://images.example.test/phone.webp',
    },
  ]);
});

test('requests 20 products by default without inventing search or offset', async () => {
  let query: Record<string, string> | undefined;
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      query = Object.fromEntries(new URL(request.url).searchParams);
      return HttpResponse.json([]);
    }),
  );
  expect(await getProducts()).toEqual([]);
  expect(query).toEqual({ limit: '20' });
});

test('encodes detail identity and maps variants, specifications and embedded similar products', async () => {
  let path: string | undefined;
  server.use(
    http.get(`${testApiUrl}/products/:productId`, ({ request }) => {
      path = new URL(request.url).pathname;
      return HttpResponse.json(productDetailFixture);
    }),
  );
  const product = await getProductById('phone /?#');
  expect(path).toBe('/products/phone%20%2F%3F%23');
  expect(product).toMatchObject({
    id: 'phone-1',
    description: 'A test phone',
    rating: 4.5,
    specifications: { screen: '6 inches', operatingSystem: 'Example OS' },
    colors: [
      {
        name: 'Black',
        hex: '#000000',
        image: 'https://images.example.test/phone.webp',
      },
    ],
    storageOptions: [{ capacity: '256 GB', price: 550 }],
    similarProducts: [
      {
        id: 'phone-2',
        image: 'https://images.example.test/phone.webp',
        basePrice: 500,
      },
    ],
  });
  expect(product).not.toHaveProperty('image');
  expect(product).not.toHaveProperty('colorOptions');
  expect(product).not.toHaveProperty('specs');
  expect(product.similarProducts?.[0]).not.toHaveProperty('imageUrl');
});

test('preserves unknown-product HTTP 404 as a structured ApiError', async () => {
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json(
        { error: 'NOT-FOUND', message: 'Product not found' },
        { status: 404 },
      ),
    ),
  );
  const result = getProductById('missing');
  await expect(result).rejects.toBeInstanceOf(ApiError);
  await expect(result).rejects.toMatchObject({
    status: 404,
    message: 'Product not found',
  });
});

test.each([{ products: [] }, [{ basePrice: '500' }], [null]])(
  'rejects malformed list data %#',
  async (body) => {
    server.use(
      http.get(`${testApiUrl}/products`, () => HttpResponse.json(body)),
    );
    await expect(getProducts()).rejects.toThrow('invalid shape');
  },
);

test('rejects malformed nested detail data', async () => {
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({ storageOptions: [{ price: '550' }] }),
    ),
  );
  await expect(getProductById('phone-1')).rejects.toThrow('invalid shape');
});

test('keeps omitted optional detail values absent rather than inventing defaults', async () => {
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({ id: 'minimal' }),
    ),
  );
  const product = await getProductById('minimal');
  expect(product.id).toBe('minimal');
  expect(product.basePrice).toBeUndefined();
  expect(product).not.toHaveProperty('image');
  expect(product.colors).toBeUndefined();
  expect(product.storageOptions).toBeUndefined();
  expect(product.similarProducts).toBeUndefined();
});

test.each([404, 500])(
  'preserves HTTP %s even when the error body is not JSON',
  async (status) => {
    server.use(
      http.get(`${testApiUrl}/products/:productId`, () =>
        HttpResponse.text('Upstream failure', { status }),
      ),
    );
    const result = getProductById('missing');
    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({ status });
  },
);

test('rejects malformed JSON in a successful response', async () => {
  server.use(
    http.get(`${testApiUrl}/products`, () =>
      HttpResponse.text('{invalid', {
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  await expect(getProducts()).rejects.toMatchObject({
    name: 'ApiError',
    status: 200,
  });
});
