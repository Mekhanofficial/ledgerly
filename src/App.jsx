import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import RequireAuth from './components/auth/RequireAuth'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import RouteLoadingSpinner from './components/ui/RouteLoadingSpinner'
import HomePage from './routes/home'

const ReduxLayout = lazy(() => import('./routes/ReduxLayout'))
const AuthenticatedLayout = lazy(() => import('./routes/AuthenticatedLayout'))
const Dashboard = lazy(() => import('./routes/dashboard/Dashboard'))
const InvoiceList = lazy(() => import('./routes/invoices/InvoiceList'))
const CreateInvoice = lazy(() => import('./routes/invoices/CreateInvoice'))
const RecurringInvoices = lazy(() => import('./routes/invoices/RecurringInvoices'))
const InvoiceTemplates = lazy(() => import('./routes/invoices/Templates'))
const Receipts = lazy(() => import('./routes/receipts/Receipts'))
const Inventory = lazy(() => import('./routes/inventory/Inventory'))
const Customers = lazy(() => import('./routes/customers/Customers'))
const Products = lazy(() => import('./routes/inventory/Products'))
const Categories = lazy(() => import('./routes/inventory/Categories'))
const StockAdjustments = lazy(() => import('./routes/inventory/StockAdjustments'))
const Suppliers = lazy(() => import('./routes/inventory/Suppliers'))
const Reports = lazy(() => import('./routes/reports/Reports'))
const Payments = lazy(() => import('./routes/payments/Payments'))
const Settings = lazy(() => import('./routes/settings/Settings'))
const Notifications = lazy(() => import('./routes/notifications/Notifications'))
const Support = lazy(() => import('./routes/support/Support'))
const SuperAdmin = lazy(() => import('./routes/super-admin/SuperAdmin'))
const Drafts = lazy(() => import('./routes/invoices/Draft'))
const EditInvoice = lazy(() => import('./routes/invoices/EditInvoice'))
const ViewInvoice = lazy(() => import('./routes/invoices/ViewInvoice'))
const CustomerProfile = lazy(() => import('./routes/customers/CustomerProfile'))
const LoginPage = lazy(() => import('./auth/login/Login'))
const SignupPage = lazy(() => import('./auth/register/SignUp'))
const ProcessPayment = lazy(() => import('./routes/payments/ProcessPayment'))
const PaymentCallback = lazy(() => import('./routes/payments/PaymentCallback'))
const ForgotPassword = lazy(() => import('./auth/forgot-password/ForgotPassword'))
const ResetPassword = lazy(() => import('./auth/reset-password/ResetPassword'))
const NewCategory = lazy(() => import('./routes/inventory/NewCategory'))
const NewProduct = lazy(() => import('./routes/inventory/NewProduct'))
const EditProduct = lazy(() => import('./routes/inventory/EditProduct'))
const NewSupplier = lazy(() => import('./routes/inventory/NewSupplier'))
const NewStockAdjustment = lazy(() => import('./routes/inventory/NewStockAdjustment'))
const AcceptInvite = lazy(() => import('./routes/team/AcceptInvite'))
const Team = lazy(() => import('./routes/team/Team'))
const Documents = lazy(() => import('./routes/documents/Documents'))
const SearchPage = lazy(() => import('./routes/search/Search'))
const PricingPage = lazy(() => import('./routes/payments/Pricing'))
const PublicInvoicePay = lazy(() => import('./routes/public/PublicInvoicePay'))
const PublicInvoicePaymentResult = lazy(() => import('./routes/public/PublicInvoicePaymentResult'))
const ContactPage = lazy(() => import('./routes/contact/Contact'))

const AppRoutes = ({
  appRoles,
  businessRoles,
  reportsRoles,
  paymentsRoles,
  inventoryManageRoles,
  settingsRoles,
  teamRoles,
  documentsRoles
}) => {
  const location = useLocation()
  const routeKey = `${location.pathname}${location.search}`
  const hasMountedRef = useRef(false)
  const [showRouteSpinner, setShowRouteSpinner] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [routeKey])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    setShowRouteSpinner(true)
    const timeoutId = window.setTimeout(() => {
      setShowRouteSpinner(false)
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [routeKey])

  return (
    <>
      <RouteLoadingSpinner show={showRouteSpinner} />
      <Suspense fallback={<RouteLoadingSpinner show />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team/accept-invite/:token" element={<AcceptInvite />} />
          <Route path="/invoice/pay/:slug" element={<PublicInvoicePay />} />
          <Route
            path="/invoice/success/:slug"
            element={<PublicInvoicePaymentResult mode="success" />}
          />
          <Route
            path="/invoice/failed/:slug"
            element={<PublicInvoicePaymentResult mode="failed" />}
          />

          <Route element={<ReduxLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<AuthenticatedLayout />}>
            <Route
              path="/dashboard"
              element={
                <RequireAuth allowedRoles={appRoles}>
                  <Dashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/invoices"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'read' }}>
                  <InvoiceList />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/create"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'create' }}>
                  <CreateInvoice />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/view/:id"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'read' }}>
                  <ViewInvoice />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/drafts"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'update' }}>
                  <Drafts />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/edit/:id"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'update' }}>
                  <EditInvoice />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/recurring"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'read' }}>
                  <RecurringInvoices />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/templates"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'read' }}>
                  <InvoiceTemplates />
                </RequireAuth>
              }
            />

            <Route
              path="/receipts"
              element={
                <RequireAuth allowedRoles={reportsRoles}>
                  <Receipts />
                </RequireAuth>
              }
            />

            <Route
              path="/inventory"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'read' }}>
                  <Inventory />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/products"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'read' }}>
                  <Products />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/products/edit/:id"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'update' }}>
                  <EditProduct />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/products/new"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'create' }}>
                  <NewProduct />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/categories"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'read' }}>
                  <Categories />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/categories/new"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'create' }}>
                  <NewCategory />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/stock-adjustments"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'update' }}>
                  <StockAdjustments />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/suppliers"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'read' }}>
                  <Suppliers />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/suppliers/new"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'create' }}>
                  <NewSupplier />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory/stock-adjustments/new"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'products', action: 'update' }}>
                  <NewStockAdjustment />
                </RequireAuth>
              }
            />

            <Route
              path="/customers"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'customers', action: 'read' }}>
                  <Customers />
                </RequireAuth>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'customers', action: 'read' }}>
                  <CustomerProfile />
                </RequireAuth>
              }
            />

            <Route
              path="/payments"
              element={
                <RequireAuth allowedRoles={paymentsRoles}>
                  <Payments />
                </RequireAuth>
              }
            />
            <Route
              path="/payments/callback"
              element={
                <RequireAuth allowedRoles={paymentsRoles}>
                  <PaymentCallback />
                </RequireAuth>
              }
            />
            <Route
              path="/payments/process"
              element={
                <RequireAuth allowedRoles={reportsRoles}>
                  <ProcessPayment />
                </RequireAuth>
              }
            />
            <Route
              path="/payments/pricing"
              element={
                <RequireAuth allowedRoles={['admin', 'accountant', 'super_admin']}>
                  <PricingPage />
                </RequireAuth>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'reports', action: 'view' }}>
                  <Reports />
                </RequireAuth>
              }
            />
            <Route
              path="/support"
              element={
                <RequireAuth allowedRoles={['admin', 'accountant', 'staff', 'client', 'super_admin']}>
                  <Support />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'settings', action: 'view' }}>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth allowedRoles={['admin', 'accountant', 'staff', 'client', 'super_admin']}>
                  <Notifications />
                </RequireAuth>
              }
            />
            <Route
              path="/documents"
              element={
                <RequireAuth allowedRoles={documentsRoles}>
                  <Documents />
                </RequireAuth>
              }
            />
            <Route
              path="/search"
              element={
                <RequireAuth allowedRoles={appRoles} requiredPermission={{ domain: 'invoices', action: 'read' }}>
                  <SearchPage />
                </RequireAuth>
              }
            />
            <Route
              path="/team"
              element={
                <RequireAuth allowedRoles={teamRoles}>
                  <Team />
                </RequireAuth>
              }
            />
            <Route
              path="/super-admin"
              element={
                <RequireAuth allowedRoles={['super_admin']}>
                  <SuperAdmin />
                </RequireAuth>
              }
            />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

const App = () => {
  const businessRoles = ['admin', 'accountant', 'staff', 'viewer', 'super_admin']
  const clientRoles = ['client']
  const appRoles = [...businessRoles, ...clientRoles]
  const paymentsRoles = ['admin', 'accountant', 'client', 'super_admin']
  const reportsRoles = ['admin', 'accountant', 'super_admin']
  const inventoryManageRoles = ['admin', 'accountant']
  const settingsRoles = ['admin', 'super_admin']
  const teamRoles = ['admin', 'super_admin']
  const documentsRoles = ['admin', 'accountant', 'staff', 'super_admin']

  useEffect(() => {
    const handleNumberInputFocus = (event) => {
      const target = event.target

      if (!(target instanceof HTMLInputElement) || target.type !== 'number') {
        return
      }

      if (target.disabled || target.readOnly) {
        return
      }

      const currentValue = String(target.value ?? '').trim()
      if (!/^0(?:\.0+)?$/.test(currentValue)) {
        return
      }

      window.requestAnimationFrame(() => {
        if (document.activeElement !== target) {
          return
        }

        try {
          target.select()
        } catch {
          // Some browsers can throw if the input is no longer selectable.
        }
      })
    }

    document.addEventListener('focusin', handleNumberInputFocus)

    return () => {
      document.removeEventListener('focusin', handleNumberInputFocus)
    }
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AppRoutes
            appRoles={appRoles}
            businessRoles={businessRoles}
            reportsRoles={reportsRoles}
            paymentsRoles={paymentsRoles}
            inventoryManageRoles={inventoryManageRoles}
            settingsRoles={settingsRoles}
            teamRoles={teamRoles}
            documentsRoles={documentsRoles}
          />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
