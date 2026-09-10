import React from 'react'
import App from '@/App'
import { store } from '@/store'
import { createRoot } from 'react-dom/client'

// style + assets
import '@/assets/scss/style.scss'

// third party
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'
import { ConfigProvider } from '@/store/context/ConfigContext'
import { ErrorProvider } from '@/store/context/ErrorContext'

const container = document.getElementById('root')
const root = createRoot(container)

// Hosts (Projecto /apps/agent-workspace/flows, Ideas canvas-island) set this
// before the bundle runs. Keep config.basename empty — RR 6.3 useRoutes(routes,
// config.basename) treats a non-empty string as the location and blanks the canvas.
const routerBasename = typeof window !== 'undefined' ? window.__FLOWISE_BASENAME__ || '' : ''

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter basename={routerBasename}>
                <SnackbarProvider>
                    <ConfigProvider>
                        <ErrorProvider>
                            <ConfirmContextProvider>
                                <ReactFlowContext>
                                    <App />
                                </ReactFlowContext>
                            </ConfirmContextProvider>
                        </ErrorProvider>
                    </ConfigProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
