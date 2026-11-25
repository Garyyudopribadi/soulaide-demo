import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers/AppProviders.tsx'
import { router } from '@/app/router/index.tsx'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
