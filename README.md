# Zara Mobile Store Challenge

A responsive mobile phone catalog frontend challenge. This repository currently establishes the minimal application and quality toolchain before product functionality is implemented.

## Stack

React 18, TypeScript, Vite 6, TanStack Router v1, TanStack Query v5, SCSS Modules, ESLint 9, Prettier, Vitest 3, React Testing Library with jsdom, and MSW for API tests.

## Setup

Use Node **18.20.8** and npm **10.8.2**.

```sh
nvm use
npm ci
npm run dev
```

## Scripts

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the development server.                           |
| `npm run build`        | Validate TypeScript and build production assets.        |
| `npm run preview`      | Preview the production build.                           |
| `npm run typecheck`    | Validate application and configuration types.           |
| `npm run lint`         | Lint with zero warnings allowed.                        |
| `npm run lint:fix`     | Apply available lint fixes.                             |
| `npm run format`       | Format files.                                           |
| `npm run format:check` | Check formatting without writing.                       |
| `npm test`             | Run tests once.                                         |
| `npm run test:watch`   | Run tests in watch mode.                                |
| `npm run check`        | Run formatting, lint, types, tests, and build in order. |

## Architecture and status

`src/main.tsx` composes the TanStack Query provider, cart provider, and typed router. API configuration, transport, external DTO validation, domain mapping, and feature query hooks have explicit boundaries. The cart uses isolated React Context state with defensive versioned localStorage persistence. Component styles and tests are colocated, and document defaults live in `src/styles/global.scss`. The current UI still contains neutral catalog, product-detail, and cart placeholders.
