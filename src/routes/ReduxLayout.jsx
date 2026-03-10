import React from 'react'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { store } from '../store/store'

const ReduxLayout = () => {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  )
}

export default ReduxLayout
