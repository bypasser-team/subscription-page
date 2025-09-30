import { useCallback, useState } from 'react'

import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'
import { downloadWithCustomName } from '@shared/utils/download-with-custom-name'

/**
 * Проверяет, нужно ли применять blob-логику для данного URL
 * Условие: имя файла должно быть .exe И содержать "bypasser" И "web"
 */
const shouldUseCustomDownload = (url: string): boolean => {
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
    const [downloadingUrls, setDownloadingUrls] = useState<Set<string>>(new Set())

    const handleDownload = useCallback(
        async (buttonLink: string, e: React.MouseEvent) => {
            // Проверяем, нужна ли blob-логика
            if (!shouldUseCustomDownload(buttonLink)) {
                return // Обычная ссылка, не вмешиваемся
            }

            // Применяем кастомное скачивание
            e.preventDefault()

            if (downloadingUrls.has(buttonLink)) {
                return // Уже скачивается
            }

            try {
                setDownloadingUrls(prev => new Set(prev).add(buttonLink))

                // Формируем имя файла
                const shortUuid = subscription?.user?.shortUuid || 'unknown'
                const newFileName = `Bypasser-${shortUuid}-web.exe`

                await downloadWithCustomName(buttonLink, newFileName)

            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Download failed:', error)
            } finally {
                setDownloadingUrls(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(buttonLink)
                    return newSet
                })
            }
        },
        [subscription, downloadingUrls]
    )

    const isDownloading = useCallback(
        (url: string) => downloadingUrls.has(url),
        [downloadingUrls]
    )

    return {
        handleDownload,
        isDownloading
    }
}