import { useCallback, useEffect, useState } from 'react'
import {
  clearCustomImages,
  loadCustomImages,
  saveCustomImage,
} from '../game/customImages'

export function useCustomImages() {
  const [customImages, setCustomImages] = useState<Record<number, string>>({})

  useEffect(() => {
    let active = true
    const urls: string[] = []
    loadCustomImages()
      .then((images) => {
        if (!active) return
        const next = Object.fromEntries(
          Object.entries(images).map(([value, blob]) => {
            const url = URL.createObjectURL(blob)
            urls.push(url)
            return [value, url]
          }),
        )
        setCustomImages(next)
      })
      .catch((error: unknown) => console.error(error))
    return () => {
      active = false
      urls.forEach(URL.revokeObjectURL)
    }
  }, [])

  const setCustomImage = useCallback(async (value: number, file: File) => {
    await saveCustomImage(value, file)
    const url = URL.createObjectURL(file)
    setCustomImages((current) => {
      if (current[value]) URL.revokeObjectURL(current[value])
      return { ...current, [value]: url }
    })
  }, [])

  const resetCustomImages = useCallback(async () => {
    await clearCustomImages()
    Object.values(customImages).forEach(URL.revokeObjectURL)
    setCustomImages({})
  }, [customImages])

  return { customImages, setCustomImage, resetCustomImages }
}
