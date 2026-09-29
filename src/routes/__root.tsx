import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import styles from './-shell.module.scss';

export const Route = createRootRoute({
  component: function RootShell() {
    return (
      <div className={styles.shell}>
        <nav aria-label="Page links" className={styles.links}>
          <Link to="/">Catalog</Link>
          <Link to="/cart">Cart</Link>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    );
  },
  notFoundComponent: function NotFound() {
    return <h1>Page not found</h1>;
  },
});
