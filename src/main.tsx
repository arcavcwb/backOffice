import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createRouter,
  RouterProvider,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { LoginForm } from './components/LoginForm'

const queryClient = new QueryClient()

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Inicio - Sistema Multi-Tenant</h1>
      <p className="mt-2">Has iniciado sesión correctamente.</p>
    </div>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginForm,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
