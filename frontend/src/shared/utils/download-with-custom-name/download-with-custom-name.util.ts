export const downloadWithCustomName = async (
    url: string,
    customFileName: string
): Promise<void> => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
    }

    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = customFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}