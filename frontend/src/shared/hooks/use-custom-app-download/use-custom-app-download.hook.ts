import { useCallback } from 'react'

import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'

/**
 * Проверяет, нужно ли применять прокси для данного URL
 * Условие: имя файла должно быть .exe И содержать "bypasser" И "web"
 */
export const shouldUseProxy = (url: string): boolean => {
    const fileName = url.split('/').pop() || ''
    const lowerFileName = fileName.toLowerCase()

    return (
        lowerFileName.endsWith('.exe') &&
        lowerFileName.includes('bypasser') &&
        lowerFileName.includes('web')
    )
}

export const useCustomAppDownload = () => {
    const { subscription } = useSubscriptionInfoStoreInfo()

    const getDownloadUrl = useCallback(
        (buttonLink: string): string => {
            if (!shouldUseProxy(buttonLink)) {
                return buttonLink
            }

            const shortUuid = subscription?.user?.shortUuid
            if (!shortUuid) {
                return buttonLink
            }

            return `/api/download?url=${encodeURIComponent(buttonLink)}&filename=${encodeURIComponent(`Bypasser-${shortUuid}-web.exe`)}`
        },
        [subscription]
    )

    return {
        getDownloadUrl
    }
}
