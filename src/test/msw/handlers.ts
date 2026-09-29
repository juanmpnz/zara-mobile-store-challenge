import { http, HttpResponse } from 'msw';

export const testApiUrl = 'https://api.example.test';

export const productSummaryFixture = {
  id: 'phone-1',
  brand: 'Example',
  name: 'Example Phone',
  basePrice: 500,
  imageUrl: 'https://images.example.test/phone.webp',
};

export const productDetailFixture = {
  id: 'phone-1',
  brand: 'Example',
  name: 'Example Phone',
  basePrice: 500,
  description: 'A test phone',
  rating: 4.5,
  specs: { screen: '6 inches', os: 'Example OS' },
  colorOptions: [
    {
      name: 'Black',
      hexCode: '#000000',
      imageUrl: productSummaryFixture.imageUrl,
    },
  ],
  storageOptions: [{ capacity: '256 GB', price: 550 }],
  similarProducts: [{ ...productSummaryFixture, id: 'phone-2' }],
};

export const handlers = [
  http.get(`${testApiUrl}/products`, () =>
    HttpResponse.json([productSummaryFixture]),
  ),
  http.get(`${testApiUrl}/products/:productId`, () =>
    HttpResponse.json(productDetailFixture),
  ),
];
