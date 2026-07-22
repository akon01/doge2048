import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { canMove, createBoard, moveBoard } from './game/engine'
import type {
  Direction,
  GameState,
  MoveResult,
  Position,
  TileMotion,
} from './game/types'
import './App.css'

const BEST_SCORE_KEY = 'doge-2048-best-score'
const US_MODE_UNLOCKED_KEY = 'doge-2048-us-mode-unlocked'
const TILE_MODE_KEY = 'doge-2048-tile-mode'
const MOVE_DURATION = 180
const imageTileValues = new Set([
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
])
const reversedOverflowImages = [
  2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2,
]
const usImageExtensions: Record<number, string> = {
  2: 'jpg',
  4: 'jpg',
  8: 'gif',
  16: 'JPG',
  32: 'jpg',
  64: 'jpg',
  128: 'jpg',
  256: 'jpg',
  512: 'jpg',
  1024: 'jpg',
  2048: 'JPG',
}
type TileMode = 'doge' | 'us'
const directionKeys: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}

function getBestScore(): number {
  const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY))
  return Number.isFinite(saved) ? saved : 0
}

function hasUnlockedUsMode(): boolean {
  return window.localStorage.getItem(US_MODE_UNLOCKED_KEY) === 'true'
}

function getInitialTileMode(): TileMode {
  return hasUnlockedUsMode() &&
    window.localStorage.getItem(TILE_MODE_KEY) === 'us'
    ? 'us'
    : 'doge'
}

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

const cellKey = ({ row, column }: Position) => `${row}-${column}`

function TileArtwork({ value, mode }: { value: number; mode: TileMode }) {
  let artworkMode = mode
  let artworkValue = value

  if (value > 2048) {
    const overflowIndex = Math.log2(value) - 12
    artworkValue = reversedOverflowImages[overflowIndex]
    artworkMode = mode === 'doge' ? 'us' : 'doge'
  }

  const extension =
    artworkMode === 'us' ? usImageExtensions[artworkValue] : 'gif'

  if (!imageTileValues.has(artworkValue) || !extension) return value

  return (
    <>
      <img
        src={`/images/${artworkMode}-${artworkValue}.${extension}`}
        alt=""
        draggable={false}
      />
      {value > 2048 && (
        <span className="overflow-value">{value.toLocaleString()}</span>
      )}
    </>
  )
}

function App() {
  const [game, setGame] = useState<GameState>(() => ({
    board: createBoard(),
    score: 0,
    bestScore: getBestScore(),
  }))




  const gameRef = useRef(game)
  const boardRef = useRef<HTMLElement>(null)
  const scoreCardRef = useRef<HTMLDivElement>(null)
  const animationId = useRef(0)
  const moveTimer = useRef<number | null>(null)
  const isMoving = useRef(false)
  const usModeUnlockedRef = useRef(hasUnlockedUsMode())
  const [movingTiles, setMovingTiles] = useState<TileMotion[] | null>(null)
  const [settledCells, setSettledCells] = useState<{
    merged: Set<string>
    spawned: string | null
  }>({ merged: new Set(), spawned: null })
  const [scoreGain, setScoreGain] = useState<{ value: number; id: number } | null>(null)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const [usModeUnlocked, setUsModeUnlocked] = useState(hasUnlockedUsMode)
  const [justUnlockedUsMode, setJustUnlockedUsMode] = useState(false)
  const [tileMode, setTileMode] = useState<TileMode>(getInitialTileMode)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const url=window.location.toString()
  useEffect(()=>{
    console.log(url)
    if (url.includes("admin") && !usModeUnlockedRef.current) {
      usModeUnlockedRef.current = true
      window.localStorage.setItem(US_MODE_UNLOCKED_KEY, 'true')
      window.localStorage.setItem(TILE_MODE_KEY, 'us')
      setUsModeUnlocked(true)
      setJustUnlockedUsMode(true)
      setTileMode('us')
    }
  },[url])
  const hasWon = game.board.some((row) => row.some((value) => value >= 2048))
  const isGameOver = !canMove(game.board)

  const move = useCallback((direction: Direction) => {
    if (isMoving.current) return

    const current = gameRef.current
    const result = moveBoard(current.board, direction)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const offset = {
      up: [0, -7],
      down: [0, 7],
      left: [-7, 0],
      right: [7, 0],
    }[direction]

    if (!result.moved && !reduceMotion) {
      boardRef.current?.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${offset[0] / 2}px, ${offset[1] / 2}px)` },
          { transform: `translate(${-offset[0] / 3}px, ${-offset[1] / 3}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: 190, easing: 'ease-out' },
      )
    }

    if (!result.moved) return

    const finishMove = (moveResult: MoveResult) => {
      const score = current.score + moveResult.scoreGained
      const nextGame = {
        board: moveResult.board,
        score,
        bestScore: Math.max(current.bestScore, score),
      }
      gameRef.current = nextGame
      setGame(nextGame)
      setMovingTiles(null)
      setSettledCells({
        merged: new Set(moveResult.mergedCells.map(cellKey)),
        spawned: moveResult.spawnedCell ? cellKey(moveResult.spawnedCell) : null,
      })
      isMoving.current = false
      moveTimer.current = null

      const reached2048 = moveResult.board.some((row) =>
        row.some((value) => value >= 2048),
      )
      if (reached2048 && !usModeUnlockedRef.current) {
        usModeUnlockedRef.current = true
        window.localStorage.setItem(US_MODE_UNLOCKED_KEY, 'true')
        window.localStorage.setItem(TILE_MODE_KEY, 'us')
        setUsModeUnlocked(true)
        setJustUnlockedUsMode(true)
        setTileMode('us')
      }

      if (moveResult.scoreGained > 0) {
        animationId.current += 1
        setScoreGain({ value: moveResult.scoreGained, id: animationId.current })
        if (!reduceMotion) {
          scoreCardRef.current?.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.09)' },
              { transform: 'scale(1)' },
            ],
            { duration: 260, easing: 'cubic-bezier(.2,.8,.3,1.3)' },
          )
        }
      }
    }

    if (reduceMotion) {
      finishMove(result)
    } else {
      isMoving.current = true
      setMovingTiles(result.motions)
      moveTimer.current = window.setTimeout(() => finishMove(result), MOVE_DURATION)
    }
  }, [])

  const newGame = () => {
    if (moveTimer.current !== null) window.clearTimeout(moveTimer.current)
    moveTimer.current = null
    isMoving.current = false
    const nextGame = {
      board: createBoard(),
      score: 0,
      bestScore: gameRef.current.bestScore,
    }
    gameRef.current = nextGame
    setGame(nextGame)
    setMovingTiles(null)
    setSettledCells({ merged: new Set(), spawned: null })
    setScoreGain(null)
    setKeepPlaying(false)
    setJustUnlockedUsMode(false)
  }

  useEffect(() => {
    window.localStorage.setItem(BEST_SCORE_KEY, String(game.bestScore))
  }, [game.bestScore])

  useEffect(
    () => () => {
      if (moveTimer.current !== null) window.clearTimeout(moveTimer.current)
    },
    [],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = directionKeys[event.key]
      if (!direction) return
      event.preventDefault()
      move(direction)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30) return

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(deltaX > 0 ? 'right' : 'left')
    } else {
      move(deltaY > 0 ? 'down' : 'up')
    }
  }

  const overlayVisible = isGameOver || (hasWon && !keepPlaying)

  return (
    <main className="game-shell">
      <header className="game-header">
        <div className="brand">
          <div>
            <h1>DOGE 2048</h1>
          </div>
        </div>

        <div className="score-row" aria-label="Game scores">
          <div className="score-card" ref={scoreCardRef}>
            <span>Score</span>
            <strong className="score-value" key={game.score}>
              {game.score.toLocaleString()}
            </strong>
            {scoreGain && (
              <b className="score-gain" key={scoreGain.id} aria-hidden="true">
                +{scoreGain.value}
              </b>
            )}
          </div>
          <div className="score-card">
            <span>Best</span>
            <strong>{game.bestScore.toLocaleString()}</strong>
          </div>
        </div>
      </header>

      <section className="game-intro">
        {usModeUnlocked && (
          <div className="mode-switch" aria-label="Tile picture mode">
            <button
              type="button"
              className={tileMode === 'doge' ? 'active' : ''}
              aria-pressed={tileMode === 'doge'}
              onClick={() => {
                setTileMode('doge')
                window.localStorage.setItem(TILE_MODE_KEY, 'doge')
              }}
            >
              Doge
            </button>
            <button
              type="button"
              className={tileMode === 'us' ? 'active' : ''}
              aria-pressed={tileMode === 'us'}
              onClick={() => {
                setTileMode('us')
                window.localStorage.setItem(TILE_MODE_KEY, 'us')
              }}
            >
              The Boobos
            </button>
          </div>
        )}
        <button type="button" className="new-game-button" onClick={newGame}>
          New game
        </button>
      </section>

      <section
        className="board"
        ref={boardRef}
        aria-label="2048 game board"
        onTouchStart={(event) => {
          const touch = event.touches[0]
          touchStart.current = { x: touch.clientX, y: touch.clientY }
        }}
        onTouchEnd={handleTouchEnd}
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
                <TileArtwork value={tile.value} mode={tileMode} />
              </div>
            ))
            : game.board.flatMap((row, rowIndex) =>
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
                      <TileArtwork value={value} mode={tileMode} />
                    </div>
                  )
                }),
              )}
        </div>

        {overlayVisible && (
          <div className="game-overlay" role="dialog" aria-live="polite">
            <div className="overlay-doge" aria-hidden="true">
              {isGameOver ? '☹' : '♥'}
            </div>
            <h2>
              {isGameOver
                ? 'Such game over'
                : justUnlockedUsMode
                  ? 'The Boobos mode unlocked!'
                  : 'Wow, you made 2048!'}
            </h2>
            <p>
              {isGameOver
                ? `Final score: ${game.score.toLocaleString()}`
                : justUnlockedUsMode
                  ? 'Your tile pictures have changed. You can switch modes anytime.'
                  : 'Much skill. Keep going for an even bigger tile?'}
            </p>
            <div className="overlay-actions">
              {!isGameOver && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setKeepPlaying(true)
                    setJustUnlockedUsMode(false)
                  }}
                >
                  Keep playing
                </button>
              )}
              <button type="button" className="new-game-button" onClick={newGame}>
                Try again
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
