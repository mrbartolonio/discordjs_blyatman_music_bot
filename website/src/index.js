import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import createWebSocketClient from './websocket'

const wsClient = createWebSocketClient()
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App wsClient={wsClient} />
  </React.StrictMode>,
)

serviceWorkerRegistration.unregister()
