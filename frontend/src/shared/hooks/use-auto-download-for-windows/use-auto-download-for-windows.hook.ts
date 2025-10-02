import { useEffect, useRef } from 'react'
import { useOs } from '@mantine/hooks'

// eslint-disable-next-line import/named
import { shouldUseProxy, useCustomAppDownload } from '@shared/hooks/use-custom-app-download'
import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'

export const useAutoDownloadForWindows = (appsConfig: {
    windows?: Array<{ installationStep: { buttons: Array<{ buttonLink: string }> } }>
}) => {
    const os = useOs()
    const { subscription } = useSubscriptionInfoStoreInfo()
    const { getDownloadUrl } = useCustomAppDownload()
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
                if (shouldUseProxy(button.buttonLink)) {
                    targetUrl = button.buttonLink
                    break
                }
            }
            if (targetUrl) break
        }

        if (!targetUrl) return

        // Все проверки пройдены - скачиваем!
        hasTriedDownload.current = true

        // Получаем URL с прокси
        const downloadUrl = getDownloadUrl(targetUrl)

        // Программное скачивание через создание ссылки
        const link = document.createElement('a')
        link.href = downloadUrl
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [os, subscription, appsConfig, getDownloadUrl])
}
