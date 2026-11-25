import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout.tsx'
import { LandingPage } from '@/features/public-site/LandingPage.tsx'
import { ServicesPage } from '@/features/public-site/ServicesPage.tsx'
import { PsychologistsPage } from '@/features/public-site/PsychologistsPage.tsx'
import { PsychologistDetailPage } from '@/features/public-site/PsychologistDetailPage.tsx'
import { FaqPage } from '@/features/public-site/FaqPage.tsx'
import { ContactPage } from '@/features/public-site/ContactPage.tsx'
import { LoginPage } from '@/features/auth/LoginPage.tsx'
import { RegisterPage } from '@/features/auth/RegisterPage.tsx'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage.tsx'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage.tsx'
import { UnauthorizedPage } from '@/features/auth/UnauthorizedPage.tsx'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute.tsx'
import { BookingPage } from '@/features/booking/BookingPage.tsx'
import { OrderStatusPage } from '@/features/payments/OrderStatusPage.tsx'
import { CustomerDashboardPage } from '@/features/customer/CustomerDashboardPage.tsx'
import { PsychologistDashboardPage } from '@/features/psychologist/PsychologistDashboardPage.tsx'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage.tsx'
import { NotFoundPage } from '@/features/public-site/NotFoundPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'psychologists', element: <PsychologistsPage /> },
      { path: 'psychologists/:id', element: <PsychologistDetailPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'booking', element: <BookingPage /> },
      { path: 'order/:id', element: <OrderStatusPage /> },
      {
        path: 'dashboard/*',
        element: (
          <ProtectedRoute allowedRoles={['customer', 'super_admin']}>
            <CustomerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'psychologist/*',
        element: (
          <ProtectedRoute allowedRoles={['psychologist', 'super_admin']}>
            <PsychologistDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/*',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
