import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/app/layout/Header/Header';
import { PageContainer } from '@/app/layout/PageContainer/PageContainer';

import styles from './-shell.module.scss';

export const Route = createRootRoute({
  component: function RootShell() {
    return (
      <div className={styles.shell}>
        <Header />
        <main className={styles.main}>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    );
  },
  notFoundComponent: function NotFound() {
    return <h1>Page not found</h1>;
  },
});
