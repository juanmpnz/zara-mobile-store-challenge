# API Examples

These are small sanitized examples from live responses. They contain no credentials. Values identify sample catalog products and do not represent a complete response contract.

## List item

Observed as the first item in the default `GET /products` array:

```json
{
  "id": "SMG-S24U",
  "brand": "Samsung",
  "name": "Galaxy S24 Ultra",
  "basePrice": 1329,
  "imageUrl": "http://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp"
}
```

## Detailed product

Abbreviated from `GET /products/SMG-S24U`; `specs` below shows representative values, and each option array contains only one observed item:

```json
{
  "id": "SMG-S24U",
  "brand": "Samsung",
  "name": "Galaxy S24 Ultra",
  "description": "El Samsung Galaxy S24 Ultra es un smartphone de gama alta con una pantalla Dynamic AMOLED 2X de 6.8 pulgadas, procesador Qualcomm Snapdragon 8 Gen 3 for Galaxy, y un avanzado sistema de cámara con inteligencia artificial.",
  "basePrice": 1329,
  "rating": 4.6,
  "specs": {
    "screen": "6.8\" Dynamic AMOLED 2X",
    "processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy Octa-Core"
  },
  "colorOptions": [
    {
      "name": "Titanium Violet",
      "hexCode": "#8E6F96",
      "imageUrl": "http://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp"
    }
  ],
  "storageOptions": [
    {
      "capacity": "256 GB",
      "price": 1229
    }
  ],
  "similarProducts": [
    {
      "id": "XMI-14",
      "brand": "Xiaomi",
      "name": "14",
      "basePrice": 899,
      "imageUrl": "http://prueba-tecnica-api-tienda-moviles.onrender.com/images/XMI-14-negro.webp"
    }
  ]
}
```

The observed detail contained eight specification fields, four colors, three storage options, and six similar-product summaries. The example is intentionally abbreviated and does not imply that omitted specification fields are optional.

## Search result

The list-item shape was also used by `GET /products?search=iPhone`; the observed search returned two records. No distinct search-result schema was observed.

## Error responses

An unknown product identifier returned HTTP 404:

```json
{
  "error": "NOT-FOUND",
  "message": "Product not found"
}
```

A request without `x-api-key` returned HTTP 401 with the same two string fields and `message: "Invalid API key"`.
