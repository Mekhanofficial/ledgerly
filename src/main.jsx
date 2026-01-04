import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'


import HomePage from './routes/home'
import Login from './auth/Login'
import Dashboard from './routes/dashboard.jsx/Dashboard'
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
import { ThemeProvider } from './context/ThemeContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        {/* Live Chat Component - Positioned globally */}
        <LiveChatWrapper />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard & Main App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Invoice Management Routes */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/recurring" element={<RecurringInvoices />} />
          <Route path="/invoices/templates" element={<InvoiceTemplates />} />
          
          {/* Receipts Route */}
          <Route path="/receipts" element={<Receipts />} />
          
          {/* Inventory Routes */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/products" element={<Products />} />
          <Route path="/inventory/categories" element={<Categories />} />
          <Route path="/inventory/stock-adjustments" element={<StockAdjustments />} />
          <Route path="/inventory/suppliers" element={<Suppliers />} />
          
          {/* Customer Management */}
          <Route path="/customers" element={<Customers />} />
          
          {/* Reports & Analytics */}
          <Route path="/reports" element={<Reports />} />
          
          {/* Payments */}
          <Route path="/payments" element={<Payments />} />
          
          {/* Support & Settings */}
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* 404 Page (optional) */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)