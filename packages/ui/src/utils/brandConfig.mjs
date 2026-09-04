const configuredValue = (value, fallback) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : ''
    return trimmedValue || fallback
}

const getBrandConfig = () => globalThis.__FLOWISE_BRAND__ || {}

export const resolveBrandProductName = (fallback) => configuredValue(getBrandConfig().productName, fallback)

export const resolveBrandLogoUrl = (lightFallback, darkFallback, isDarkMode) => {
    const brandConfig = getBrandConfig()
    const configuredLogo = isDarkMode ? brandConfig.darkLogoUrl : brandConfig.logoUrl
    return configuredValue(configuredLogo, isDarkMode ? darkFallback : lightFallback)
}

