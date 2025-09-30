import { useEffect, useRef } from 'react'
import { useOs } from '@mantine/hooks'

import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'
import { downloadWithCustomName } from '@shared/utils/download-with-custom-name'

const shouldUseCustomDownload = (url: string): boolean => {
    const fileName = url.split('/').pop() || ''
    const lowerFileName = fileName.toLowerCase()

    return (
        lowerFileName.endsWith('.exe') &&
        lowerFileName.includes('bypasser') &&
        lowerFileName.includes('web')
    )
}

export const useAutoDownloadForWindows = (appsConfig: {
    windows?: Array<{ installationStep: { buttons: Array<{ buttonLink: string }> } }>
}) => {
    const os = useOs()
    const { subscription } = useSubscriptionInfoStoreInfo()
    const hasTriedDownload = useRef(false)

    useEffect(() => {
        // Проверка 1: Только один раз за lifecycle
        if (hasTriedDownload.current) return

        // Проверка 2: Только Windows
        if (os !== 'windows') return

        // Проверка 3: Есть subscription
        if (!subscription?.user?.shortUuid) return

        // Проверка 4: Есть ли bypasser+web кнопка в Windows apps?
        const windowsApps = appsConfig.windows || []
        let targetUrl: null | string = null

        for (const app of windowsApps) {
            for (const button of app.installationStep.buttons) {
                if (shouldUseCustomDownload(button.buttonLink)) {
                    targetUrl = button.buttonLink
                    break
                }
            }
            if (targetUrl) break
        }

        if (!targetUrl) return

        // Все проверки пройдены - скачиваем!
        hasTriedDownload.current = true

        // Формируем имя файла
        const newFileName = `Bypasser-${subscription.user.shortUuid}-web.exe`

        // Запускаем скачивание
        downloadWithCustomName(targetUrl, newFileName).catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Auto-download failed:', error)
        })
    }, [os, subscription, appsConfig])
}