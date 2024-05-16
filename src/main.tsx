import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Products } from './pages/products'
import { Product } from './pages/product'

import './index.css'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Products />,
  },
  {
    path: "/product/:slug",
    element: <Product />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)