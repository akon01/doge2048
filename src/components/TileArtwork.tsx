import {
  imageTileValues,
  reversedOverflowImages,
  usImageExtensions,
} from '../game/tileImages'
import type { TileMode } from '../game/tileImages'

export function TileArtwork({
  value,
  mode,
  customImages,
}: {
  value: number
  mode: TileMode
  customImages: Record<number, string>
}) {
  let artworkMode = mode
  let artworkValue = value

  if (value > 2048) {
    const overflowIndex = Math.log2(value) - 12
    artworkValue = reversedOverflowImages[overflowIndex]
    artworkMode = mode === 'doge' ? 'us' : 'doge'
  }

  if (artworkMode === 'custom' && customImages[artworkValue]) {
    return <img src={customImages[artworkValue]} alt="" draggable={false} />
  }

  if (artworkMode === 'custom') artworkMode = 'doge'
  const extension =
    artworkMode === 'us' ? usImageExtensions[artworkValue] : 'gif'

  if (!imageTileValues.has(artworkValue) || !extension) return value

  return (
    <>
      <img
        src={`${import.meta.env.BASE_URL}/images/${artworkMode}-${artworkValue}.${extension}`}
        alt=""
        draggable={false}
      />
      {value > 2048 && (
        <span className="overflow-value">{value.toLocaleString()}</span>
      )}
    </>
  )
}
