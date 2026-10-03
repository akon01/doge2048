import { useEffect, useRef, useState } from 'react'

const preloadedImages: HTMLImageElement[] = []

export function usePreloadedImages(paths: string[]) {
  const imagesReadyRef = useRef(false)
  const [imagesReady, setImagesReady] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all(
      paths.map(
        (path) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image()
            preloadedImages.push(image)
            image.onload = () => resolve()
            image.onerror = () => reject(new Error(`Unable to preload ${path}`))
            image.src = path
          }),
      ),
    )
      .then(() => {
        if (active) {
          imagesReadyRef.current = true
          setImagesReady(true)
        }
      })
      .catch((error: unknown) => {
        console.error(error)
        if (active) setImageLoadError(true)
      })

    return () => {
      active = false
    }
  }, [paths])

  return { imagesReady, imagesReadyRef, imageLoadError }
}
