import type { CSSProperties, ReactNode, RefObject, TouchEvent } from 'react'
import type { SettledCells } from '../hooks/useGame'
import type { TileMode } from '../game/tileImages'
import type { Board, TileMotion } from '../game/types'
import { TileArtwork } from './TileArtwork'

type TilePositionStyle = CSSProperties & {
  '--row': number
  '--column': number
}

type MovingTileStyle = CSSProperties & {
  '--from-row': number
  '--from-column': number
  '--to-row': number
  '--to-column': number
}

export function GameBoard({
  board,
  boardRef,
  movingTiles,
  settledCells,
  tileMode,
  customImages,
  imagesReady,
  imageLoadError,
  onTouchStart,
  onTouchEnd,
  children,
}: {
  board: Board
  boardRef: RefObject<HTMLElement | null>
  movingTiles: TileMotion[] | null
  settledCells: SettledCells
  tileMode: TileMode
  customImages: Record<number, string>
  imagesReady: boolean
  imageLoadError: boolean
  onTouchStart: (event: TouchEvent) => void
  onTouchEnd: (event: TouchEvent) => void
  children?: ReactNode
}) {
  return (
    <section
      className={`board ${imagesReady ? '' : 'board-loading'}`}
      ref={boardRef}
      aria-label="2048 game board"
      aria-busy={!imagesReady}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="board-grid" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <div className="board-cell" key={index} />
        ))}
      </div>

      <div className="tile-layer">
        {movingTiles
          ? movingTiles.map((tile, index) => (
            <div
              className={`tile tile-${tile.value} tile-moving`}
              key={`${tile.from.row}-${tile.from.column}-${index}`}
              style={
                {
                  '--from-row': tile.from.row,
                  '--from-column': tile.from.column,
                  '--to-row': tile.to.row,
                  '--to-column': tile.to.column,
                } as MovingTileStyle
              }
              aria-label={String(tile.value)}
            >
              <TileArtwork value={tile.value} mode={tileMode} customImages={customImages} />
            </div>
          ))
          : board.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => {
                if (!value) return null
                const key = `${rowIndex}-${columnIndex}`
                const animationClass =
                  settledCells.spawned === key
                    ? 'tile-new'
                    : settledCells.merged.has(key)
                      ? 'tile-merged'
                      : ''

                return (
                  <div
                    className={`tile tile-${value} ${animationClass}`}
                    key={key}
                    style={
                      {
                        '--row': rowIndex,
                        '--column': columnIndex,
                      } as TilePositionStyle
                    }
                    aria-label={String(value)}
                  >
                    <TileArtwork value={value} mode={tileMode} customImages={customImages} />
                  </div>
                )
              }),
            )}
      </div>

      {!imagesReady && (
        <div className="image-loader" role="status" aria-live="polite">
          <span aria-hidden="true" />
          {imageLoadError
            ? 'Tile artwork failed to load. Please refresh.'
            : 'Loading tile artwork…'}
        </div>
      )}

      {children}
    </section>
  )
}
