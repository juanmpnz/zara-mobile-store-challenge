# Zara Mobile Store Challenge

A responsive mobile phone catalog frontend challenge. This repository currently establishes the minimal application and quality toolchain before product functionality is implemented.

## Stack

React 18, TypeScript, Vite 6, TanStack Router v1, SCSS Modules, ESLint 9, Prettier, Vitest 3, and React Testing Library with jsdom.

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

`src/main.tsx` mounts the typed router; `src/app/App.tsx` supplies the catalog heading. Component styles and tests are colocated, and document defaults live in `src/styles/global.scss`. The current UI contains typed catalog, product-detail, and cart routes with neutral placeholders. Product functionality, server and client state, and API access are not implemented.
