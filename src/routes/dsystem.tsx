import { createFileRoute } from '@tanstack/react-router';
import { DesignSystemPage } from '@/app/design-system/DesignSystemPage';

export const Route = createFileRoute('/dsystem')({
  component: DesignSystemPage,
});
