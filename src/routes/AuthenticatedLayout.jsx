import React, { Suspense, lazy } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { NotificationProvider } from '../context/NotificationContext'
import { InvoiceProvider } from '../context/InvoiceContext'
import { PaymentProvider } from '../context/PaymentContext'
import { InventoryProvider } from '../context/InventoryContext'
import { UserProvider } from '../context/UserContext'
import { AccountProvider } from '../context/AccountContext'
import { resolveAuthUser } from '../utils/userDisplay'

const LiveChatWrapper = lazy(() => import('../components/livechat/LiveChatWrapper'))

const AuthenticatedLayout = () => {
  const authState = useSelector((state) => state.auth || {})
  const authUser = resolveAuthUser(authState.user)
  const sessionIdentity = authUser?._id || authUser?.id || authUser?.email || 'guest'
  const sessionKey = `${authState.isAuthenticated ? 'auth' : 'guest'}:${sessionIdentity}`

  return (
    <NotificationProvider key={sessionKey}>
      <AccountProvider>
        <UserProvider>
          <InventoryProvider>
            <InvoiceProvider>
              <PaymentProvider>
                <Suspense fallback={null}>
                  <LiveChatWrapper />
                </Suspense>
                <Outlet />
              </PaymentProvider>
            </InvoiceProvider>
          </InventoryProvider>
        </UserProvider>
      </AccountProvider>
    </NotificationProvider>
  )
}

export default AuthenticatedLayout
