import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sender from './pages/Sender';
import Recipient from './pages/Recipient';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster theme="dark" position="top-center" />
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const senderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sender',
  component: Sender,
});

const recipientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipient',
  component: Recipient,
});

const routeTree = rootRoute.addChildren([homeRoute, senderRoute, recipientRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
