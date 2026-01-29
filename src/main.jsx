// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'

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

// Import context providers
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import { InvoiceProvider } from './context/InvoiceContext'
import { PaymentProvider } from './context/PaymentContext'
import { InventoryProvider } from './context/InventoryContext'
import { UserProvider } from './context/UserContext' // Import UserProvider only
import { AccountProvider } from './context/AccountContext'
import Drafts from './routes/invoices/Draft'
import EditInvoice from './routes/invoices/EditInvoice'
import ViewInvoice from './routes/invoices/ViewInvoice'
import CustomerProfile from './routes/customers/CustomerProfile'
import LoginPage from './auth/login/Login'
import SignupPage from './auth/register/SignUp'
import ProcessPayment from './routes/payments/ProcessPayment'
import NewCategory from './routes/inventory/NewCategory'
import NewProduct from './routes/inventory/NewProduct'
import EditProduct from './routes/inventory/EditProduct'
import NewSupplier from './routes/inventory/NewSupplier'
import NewStockAdjustment from './routes/inventory/NewStockAdjustment'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <AccountProvider>
              <UserProvider> {/* Only add UserProvider, no route protection */}
                <InvoiceProvider>
                  <PaymentProvider>
                    <InventoryProvider>
                      {/* Live Chat Component - Positioned globally */}
                      <LiveChatWrapper />
                      
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Dashboard & Main App Routes */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Invoice Management Routes */}
                        <Route path="/invoices" element={<InvoiceList />} />
                        <Route path="/invoices/create" element={<CreateInvoice />} />
                        <Route path="/invoices/view/:id" element={<ViewInvoice />} />
                        <Route path="/invoices/drafts" element={<Drafts />} />
                        <Route path="/invoices/edit/:id" element={<EditInvoice />} />
                        <Route path="/invoices/recurring" element={<RecurringInvoices />} />
                        <Route path="/invoices/templates" element={<InvoiceTemplates />} />

                        {/* Receipts Route */}
                        <Route path="/receipts" element={<Receipts />} />

                        {/* Inventory Routes */}
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/inventory/products" element={<Products />} />
                        <Route path="/inventory/products/edit/:id" element={<EditProduct />} />
                        <Route path="/inventory/products/new" element={<NewProduct />} />
                        <Route path="/inventory/categories" element={<Categories />} />
                        <Route path="/inventory/categories/new" element={<NewCategory />} />
                        <Route path="/inventory/stock-adjustments" element={<StockAdjustments />} />
                        <Route path="/inventory/suppliers" element={<Suppliers />} />
                        <Route path="/inventory/suppliers/new" element={<NewSupplier />} />
                        <Route path="/inventory/stock-adjustments/new" element={<NewStockAdjustment />} />

                        {/* Customer Management */}
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/customers/:id" element={<CustomerProfile />} />

                        {/* Payments Routes */}
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/payments/process" element={<ProcessPayment />} />

                        {/* Reports & Analytics */}
                        <Route path="/reports" element={<Reports />} />

                        {/* Support & Settings */}
                        <Route path="/support" element={<Support />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/notifications" element={<Notifications />} />

                        {/* 404 Page (optional) */}
                        {/* <Route path="*" element={<NotFound />} /> */}
                      </Routes>
                    </InventoryProvider>
                  </PaymentProvider>
                </InvoiceProvider>
              </UserProvider>
            </AccountProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
