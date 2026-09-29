import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { CartProvider } from './features/cart/context/CartProvider';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router';
import './styles/global.scss';

const root = document.getElementById('root');

if (!root) {
  throw new Error('The application root element is missing.');
}

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryProvider>
  </StrictMode>,
);
