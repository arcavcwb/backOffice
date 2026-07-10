import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createRouter,
  RouterProvider,
  createRoute,
  createRootRoute,
  useNavigate,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { LoginForm } from './components/LoginForm'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { CreateTenantForm } from './components/CreateTenantForm'
import { EditTenantForm } from './components/EditTenantForm'
import { TenantsListPage } from './components/TenantsListPage'
import { UsersListPage } from './components/UsersListPage'
import { AcceptInviteForm } from './components/AcceptInviteForm'
import { useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function IndexComponent() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
      try {
        await logout()
        navigate({ to: '/login' })
      } catch (error) {
        console.error('Error ao fazer logout:', error)
      }
    }

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Inicio - Sistema Multi-Tenant</h1>
        <p className="mt-2">Has iniciado sesión correctamente.</p>
        <button 
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    )
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginForm,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordForm,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordForm,
})

const createTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tenants/new',
  component: CreateTenantForm,
})

const editTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tenants/$tenantId/edit',
  component: () => {
    const { tenantId } = editTenantRoute.useParams()
    return <EditTenantForm tenantId={tenantId} />
  },
})

const tenantsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tenants',
  component: TenantsListPage,
})

const usersListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: UsersListPage,
})

const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accept-invite',
  component: AcceptInviteForm,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  loginRoute, 
  forgotPasswordRoute, 
  resetPasswordRoute, 
  acceptInviteRoute,
  createTenantRoute, 
  editTenantRoute, 
  tenantsListRoute,
  usersListRoute
])

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
