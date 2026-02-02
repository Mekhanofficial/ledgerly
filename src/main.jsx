import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux' // Import Redux Provider
import { store } from './store/store' // Import Redux store
import './styles/globals.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap entire app with Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
