const config = {
    // Keep empty. Subpath embedding uses BrowserRouter basename={window.__FLOWISE_BASENAME__}.
    // useRoutes(routes, config.basename) in RR 6.3 treats a non-empty string as the
    // location pathname, so a mount path here blanks /v2/agentcanvas.
    basename: '',
    defaultPath: '/chatflows',
    // You can specify multiple fallback fonts
    fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`,
    borderRadius: 12
}

export default config
