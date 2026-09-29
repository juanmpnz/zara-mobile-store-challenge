# API Contract

## Base URL

`https://prueba-tecnica-api-tienda-moviles.onrender.com`

Contract source: the OpenAPI 3.1.0 document embedded in the Swagger UI (`/docs/swagger-ui-init.js`). The direct `/openapi.json` URL returned 401 during discovery; the embedded document was available.

## Authentication

Send `x-api-key: <challenge-api-key>` on API requests. OpenAPI declares a global API-key security scheme in this header. A live request without the header returned 401 with an `ErrorEntity`-shaped body.

## Endpoints

### GET `/products`

Returns product summaries. The live response is a JSON array of summaries, despite the OpenAPI 200 schema referencing a single `ProductListEntity` object.

**Parameters documented by OpenAPI**

| Name | Location | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `search` | query | string | No | Search by brand or name |
| `limit` | query | integer | No | Limit the number of products |
| `offset` | query | integer | No | Offset the products |

OpenAPI specifies no defaults, bounds, pagination envelope, or detailed matching rules. In live observations, an omitted limit returned 24 products, `limit=20` returned 20, and `limit=20&offset=20` returned 4. These counts describe the dataset at inspection time and do not establish a stable default or total-count guarantee. No separate search parameters for name and brand are documented or observed.

**Responses documented by OpenAPI**

- `200`: `ProductListEntity` (schema/list mismatch described above).
- `401`: invalid API key; the OpenAPI response has no body schema.

**Observed error behavior**

- Missing key: `401`, JSON body with string `error` and `message` properties.
- Search with no matches: `200` and an empty JSON array.

### GET `/products/{id}`

Returns the full product record for an identifier.

**Parameters**

| Name | Location | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string | Yes |

**Responses documented by OpenAPI**

- `200`: `ProductEntity`.
- `401`: invalid API key; no response body schema is declared.
- `404`: `ErrorEntity`.

**Observed error behavior**

- An unknown identifier returned `404` with `error: "NOT-FOUND"` and `message: "Product not found"`.

No separate similar-products endpoint is present in the embedded OpenAPI. The detail response embeds `similarProducts` as product summaries.

## Data models

These pseudotypes summarize the OpenAPI property types. The schemas define no `required` arrays, so every property is optional under the published schema. Their declared string, number, object, and array types do not include `null`. Whether live responses always include every property, or ever return `null`, remains unverified. Live examples below show observed values only.

```ts
type ProductListEntity = {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  imageUrl?: string;
};

type ProductEntity = {
  id?: string;
  brand?: string;
  name?: string;
  basePrice?: number;
  description?: string;
  rating?: number;
  specs?: {
    screen?: string;
    resolution?: string;
    processor?: string;
    mainCamera?: string;
    selfieCamera?: string;
    battery?: string;
    os?: string;
    screenRefreshRate?: string;
  };
  colorOptions?: Array<{
    name?: string;
    hexCode?: string;
    imageUrl?: string;
  }>;
  storageOptions?: Array<{
    capacity?: string;
    price?: number;
  }>;
  similarProducts?: ProductListEntity[];
};

type ErrorEntity = {
  error?: string;
  message?: string;
};
```

## Observed behavior

The following are live observations, not guarantees in the OpenAPI contract:

- The default product request returned HTTP 200 and a JSON array of 24 summaries.
- `limit=20` returned 20 summaries; `limit=20&offset=20` returned 4 for the observed 24-product dataset.
- `search=iPhone` and `search=Apple` both returned results, showing that the same parameter can match a product-name fragment and a brand. Lowercase `iphone` and `apple` produced the same ordered identifiers as their capitalized forms in these samples; this is limited evidence of case-insensitive matching, not a complete search specification.
- `search=` returned the same 24-product count as the default request.
- A unique no-match search returned HTTP 200 and `[]`.
- A returned product identifier produced HTTP 200 detail. That sample contained all documented detail fields, with four color options, three storage options, and six embedded similar-product summaries.
- Product/image fields use `imageUrl`; color entries use `hexCode` and their own `imageUrl`. Storage prices and `basePrice` are numeric. The sample's base price differed from the first storage option's price. No currency code or unit is present in the DTO.
- A missing key returned HTTP 401. An unknown product identifier returned HTTP 404.
- Responses observed for successful requests and errors used `application/json; charset=utf-8`.

## Future client and domain boundary

The API-specific names and nested option shapes should be translated at the API boundary into a stable application model before feature components consume them. Keep `imageUrl`, `hexCode`, raw specification labels, and other transport names out of component contracts. Preserve the storage-specific price as the selection price; do not assume it equals `basePrice`. Currency and price display rules remain unconfirmed.

The centralized HTTP client should own the base URL, `x-api-key`, common headers, JSON decoding, and transport/HTTP error normalization. API functions should own endpoint paths and DTO typing/mapping. Feature query hooks should own query keys and TanStack Query cache/loading/error lifecycle. Product responses remain server state in TanStack Query and should not be copied into React Context. The list endpoint's observed live search can serve name/brand queries through the same `search` parameter, but debounce, latency, empty-input UX, and complete case behavior remain application decisions or open contract questions. Similar products and detail variant choices are available in one detail response, so no extra request is evidenced for those fields.

## Open questions

- The live response for `GET /products` is an array, while its OpenAPI response schema is a single object. Which side is authoritative for future contract generation?
- Do live responses always include every DTO property, or ever return `null`? The OpenAPI schemas make all properties optional and declare non-null types, but runtime behavior is unverified.
- What are the stable default, maximum, and negative-value semantics for `limit` and `offset`? Is there a total count or a guaranteed ordering?
- What are the complete search rules, including whitespace, accents, token matching, and case handling? Only two casing pairs were probed.
- What currency and unit do numeric prices represent?
- Are `basePrice` and storage-option prices intentionally different, and which selection does each describe?
- Are product `imageUrl` values stable absolute URLs? The sample used plain HTTP on the API host.
- What are the complete error bodies/status codes for invalid credentials and other server failures? Only missing-key 401 and unknown-id 404 were observed live.
