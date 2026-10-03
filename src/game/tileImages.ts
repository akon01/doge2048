export type TileMode = 'doge' | 'us' | 'custom'

export const imageTileValues = new Set([
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
])

export const reversedOverflowImages = [
  2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2,
]

export const usImageExtensions: Record<number, string> = {
  2: 'jpg',
  4: 'jpg',
  8: 'gif',
  16: 'jpg',
  32: 'jpg',
  64: 'jpg',
  128: 'jpg',
  256: 'jpg',
  512: 'jpg',
  1024: 'jpg',
  2048: 'jpg',
}

export const tileImagePaths = [...imageTileValues].flatMap((value) => [
  `${import.meta.env.BASE_URL}images/doge-${value}.gif`,
  `${import.meta.env.BASE_URL}images/us-${value}.${usImageExtensions[value]}`,
])
