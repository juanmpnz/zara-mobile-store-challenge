# Zara Mobile Store Challenge

Responsive mobile phone store built for the Zara frontend technical challenge.

The application includes a real API-backed catalog, search, product configuration, similar products, and a persistent shopping cart.

**Live demo:** `ADD_PRODUCTION_URL_HERE`

## Features

- Responsive product catalog using the challenge REST API.
- Search by product name or brand with debounced API requests.
- Animated catalog reflow when search results change.
- Product detail with storage and color selection.
- Dynamic image and price based on the selected variant.
- Horizontally scrollable and draggable similar-products rail.
- Persistent cart using `localStorage`.
- Accessible keyboard navigation and reduced-motion support.
- Typed and shareable product URLs.
- Development design-system preview at `/dsystem`.

## Tech stack

- React 18
- TypeScript
- Vite 6
- TanStack Router
- TanStack Query
- React Context for cart state
- Radix UI behind project-owned UI components
- SCSS Modules
- Vitest
- React Testing Library
- MSW
- ESLint
- Prettier

Dependencies are pinned to exact versions for reproducible installs and Node 18 compatibility.

## Requirements

- Node.js **18.20.8**
- npm **10.8.2**

The repository includes an `.nvmrc`.

```sh
nvm use
```

The project has been validated against Node 18.20.8. Using another Node major may cause tooling incompatibilities.

## Getting started

```sh
git clone https://github.com/juanmpnz/zara-mobile-store-challenge.git
cd zara-mobile-store-challenge

nvm use
npm ci

cp .env.example .env.local
```

Configure `.env.local`:

```dotenv
VITE_API_BASE_URL=https://prueba-tecnica-api-tienda-moviles.onrender.com
VITE_API_KEY=<challenge-api-key>
```

Start the application:

```sh
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

> `VITE_` variables are embedded in the browser bundle. The challenge requires the frontend to send the API key, so it must not be considered a server-side secret.

## Development and production modes

### Development

```sh
npm run dev
```

Runs the Vite development server with development assets and HMR.

### Production

```sh
npm run build
```

Type-checks the application and creates the optimized production build in `dist/`.

Vite/Rollup bundles, tree-shakes and minifies JavaScript and CSS. Route-level code splitting is preserved, so production may contain multiple optimized chunks instead of one monolithic JavaScript file.

Preview the production build locally with:

```sh
npm run preview
```

## Available commands

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server                       |
| `npm run build`        | Type-check and build production assets                  |
| `npm run preview`      | Preview the production build                            |
| `npm run typecheck`    | Run TypeScript validation                               |
| `npm run lint`         | Run ESLint with zero warnings allowed                   |
| `npm run format:check` | Verify Prettier formatting                              |
| `npm run test`         | Run the test suite                                      |
| `npm run test:watch`   | Run tests in watch mode                                 |
| `npm run check`        | Run formatting, lint, types, tests and production build |

Before submitting changes:

```sh
npm run check
```

## Routes

| Route                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `/`                    | Product catalog and search                 |
| `/products/:productId` | Product detail and variant selection       |
| `/cart`                | Persistent shopping cart                   |
| `/dsystem`             | Development visual reference for shared UI |

Product identity belongs to the URL rather than React state, so product pages support direct links, refreshes and browser navigation.

## Architecture

The application follows a feature-based modular architecture with explicit ownership of each type of state. Routes define navigation, pages compose screens, and components build pages.

```text
Route / UI
    ↓
TanStack Query hook
    ↓
Product API
    ↓
DTO validation + mapping
    ↓
Central HTTP client
    ↓
External REST API
```

### Server state

TanStack Query owns:

- product catalog data;
- product details;
- caching;
- loading and error states;
- retries;
- request cancellation.

Remote data is not duplicated in React Context.

### Client state

React Context is limited to the shopping cart.

Cart persistence is isolated behind a versioned `localStorage` boundary that validates persisted data before using it.

Cart count and total are derived rather than persisted.

### Routing

TanStack Router owns URL declarations, typed route parameters, links, route-level code splitting and not-found handling.

Route files remain thin and compose feature pages. Feature `pages/` own complete route-level screen composition, while feature `components/` contain focused or reusable UI.

### API boundary

The centralized HTTP client owns:

- base URL construction;
- `x-api-key`;
- JSON decoding;
- normalized HTTP errors.

API responses enter the application as `unknown`, are validated as external DTOs and mapped into internal domain models before reaching UI components.

### UI

Shared primitives live in:

```text
src/components/ui/
```

Radix primitives are wrapped behind project-owned interfaces so feature code does not depend directly on the third-party library.

Component styles are colocated using SCSS Modules.

Imperative browser behavior such as catalog FLIP animation and similar-products drag/scroll logic is isolated in focused hooks so rendering components remain declarative.

## Project structure

```text
src/
├── app/                 # Application shell and design-system page
├── assets/              # Static assets
├── components/ui/       # Shared UI primitives
├── config/              # Environment configuration
├── features/
│   ├── cart/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── model/
│   │   └── storage/
│   └── products/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── model/
│       ├── presentation/
│       └── queries/
├── lib/api/             # Shared HTTP transport
├── providers/
├── routes/
├── styles/              # Global reset and design tokens
└── test/                # Test setup and MSW
```

Cross-directory imports use the `@/` alias.

## Testing and quality

The test strategy includes:

- unit tests for pure domain logic;
- component tests with React Testing Library and `user-event`;
- integration tests for routes, Context and TanStack Query;
- MSW for API behavior;
- manual browser validation for responsive behavior and critical flows.

Final audit status:

- **103 tests passing**
- **18 test files**
- TypeScript passing
- ESLint passing with **0 warnings**
- Production build passing
- Critical browser flows validated with **0 console errors and 0 warnings**

## Accessibility and design

The interface follows the supplied mobile, tablet and desktop designs.

The implementation includes:

- semantic navigation;
- keyboard-accessible controls;
- visible focus states;
- accessible product/color selection;
- reduced-motion handling;
- semantic links instead of click-driven navigation;
- responsive layouts without page-level horizontal overflow.

The application uses the required font stack:

```css
font-family: Helvetica, Arial, sans-serif;
```

## Security notes

- Real environment files are not committed.
- API responses are treated as untrusted input.
- Persisted cart data is validated before use.
- The API key header is added only by the centralized HTTP client.
- The frontend API key is necessarily visible in the browser because this is a client-side challenge application.

## Additional documentation

More detailed implementation notes are available under `docs/`, including:

- product requirements;
- API contract;
- architecture decisions;
- visual contract;
- component inventory;
- quality gates.
