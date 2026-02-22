import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import components
import HomePage from './routes/home'
import Dashboard from './routes/dashboard/Dashboard'
import InvoiceList from './routes/invoices/InvoiceList'
import CreateInvoice from './routes/invoices/CreateInvoice'
import RecurringInvoices from './routes/invoices/RecurringInvoices'
import InvoiceTemplates from './routes/invoices/Templates'
import Receipts from './routes/receipts/Receipts'
import Inventory from './routes/inventory/Inventory'
import Customers from './routes/customers/Customers'
import Products from './routes/inventory/Products'
import Categories from './routes/inventory/Categories'
import StockAdjustments from './routes/inventory/StockAdjustments'
import Suppliers from './routes/inventory/Suppliers'
import Reports from './routes/reports/Reports'
import Payments from './routes/payments/Payments'
import Settings from './routes/settings/Settings'
import Notifications from './routes/notifications/Notifications'
import Support from './routes/support/Support'
import LiveChatWrapper from './components/livechat/LiveChatWrapper'
import SuperAdmin from './routes/super-admin/SuperAdmin'
import RequireAuth from './components/auth/RequireAuth'

// Import context providers
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import { InvoiceProvider } from './context/InvoiceContext'
import { PaymentProvider } from './context/PaymentContext'
import { InventoryProvider } from './context/InventoryContext'
import { UserProvider } from './context/UserContext'
import { AccountProvider } from './context/AccountContext'
import Drafts from './routes/invoices/Draft'
import EditInvoice from './routes/invoices/EditInvoice'
import ViewInvoice from './routes/invoices/ViewInvoice'
import CustomerProfile from './routes/customers/CustomerProfile'
import LoginPage from './auth/login/Login'
import SignupPage from './auth/register/SignUp'
import ProcessPayment from './routes/payments/ProcessPayment'
import PaymentCallback from './routes/payments/PaymentCallback'
import ForgotPassword from './auth/forgot-password/ForgotPassword'
import ResetPassword from './auth/reset-password/ResetPassword'
import NewCategory from './routes/inventory/NewCategory'
import NewProduct from './routes/inventory/NewProduct'
import EditProduct from './routes/inventory/EditProduct'
import NewSupplier from './routes/inventory/NewSupplier'
import NewStockAdjustment from './routes/inventory/NewStockAdjustment'
import AcceptInvite from './routes/team/AcceptInvite'
import Documents from './routes/documents/Documents'
import SearchPage from './routes/search/Search'

const App = () => {
  const businessRoles = ['admin', 'accountant', 'staff']
  const clientRoles = ['client']
  const appRoles = [...businessRoles, ...clientRoles]
  const paymentsRoles = ['admin', 'accountant', 'client', 'super_admin']
  const reportsRoles = ['admin', 'accountant']
  const inventoryManageRoles = ['admin', 'accountant']
  const settingsRoles = ['admin']
  const documentsRoles = ['admin', 'accountant', 'staff']

  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <AccountProvider>
              <UserProvider> {/* Only add UserProvider, no route protection */}
                <InventoryProvider>
                  <InvoiceProvider>
                    <PaymentProvider>
                      {/* Live Chat Component - Positioned globally */}
                      <LiveChatWrapper />

                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/team/accept-invite/:token" element={<AcceptInvite />} />

                        {/* Dashboard & Main App Routes */}
                        <Route
                          path="/dashboard"
                          element={
                            <RequireAuth allowedRoles={appRoles}>
                              <Dashboard />
                            </RequireAuth>
                          }
                        />

                        {/* Invoice Management Routes */}
                        <Route
                          path="/invoices"
                          element={
                            <RequireAuth allowedRoles={appRoles}>
                              <InvoiceList />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/create"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <CreateInvoice />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/view/:id"
                          element={
                            <RequireAuth allowedRoles={appRoles}>
                              <ViewInvoice />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/drafts"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Drafts />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/edit/:id"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <EditInvoice />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/recurring"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <RecurringInvoices />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/invoices/templates"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <InvoiceTemplates />
                            </RequireAuth>
                          }
                        />

                        {/* Receipts Route */}
                        <Route
                          path="/receipts"
                          element={
                            <RequireAuth allowedRoles={reportsRoles}>
                              <Receipts />
                            </RequireAuth>
                          }
                        />

                        {/* Inventory Routes */}
                        <Route
                          path="/inventory"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Inventory />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/products"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Products />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/products/edit/:id"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <EditProduct />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/products/new"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <NewProduct />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/categories"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Categories />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/categories/new"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <NewCategory />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/stock-adjustments"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <StockAdjustments />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/suppliers"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Suppliers />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/suppliers/new"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <NewSupplier />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/inventory/stock-adjustments/new"
                          element={
                            <RequireAuth allowedRoles={inventoryManageRoles}>
                              <NewStockAdjustment />
                            </RequireAuth>
                          }
                        />

                        {/* Customer Management */}
                        <Route
                          path="/customers"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <Customers />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/customers/:id"
                          element={
                            <RequireAuth allowedRoles={businessRoles}>
                              <CustomerProfile />
                            </RequireAuth>
                          }
                        />

                        {/* Payments Routes */}
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

                        {/* Reports & Analytics */}
                        <Route
                          path="/reports"
                          element={
                            <RequireAuth allowedRoles={reportsRoles}>
                              <Reports />
                            </RequireAuth>
                          }
                        />

                        {/* Support & Settings */}
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
                            <RequireAuth allowedRoles={settingsRoles}>
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
                            <RequireAuth allowedRoles={appRoles}>
                              <SearchPage />
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

                        {/* 404 Page (optional) */}
                        {/* <Route path="*" element={<NotFound />} /> */}
                      </Routes>
                    </PaymentProvider>
                  </InvoiceProvider>
                </InventoryProvider>
              </UserProvider>
            </AccountProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
