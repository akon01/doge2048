import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { canMove, createBoard, moveBoard } from '../game/engine'
import {
  getBestScore,
  getSavedGame,
  saveBestScore,
  saveGame,
} from '../game/storage'
import type {
  Direction,
  GameState,
  MoveResult,
  Position,
  TileMotion,
} from '../game/types'

const MOVE_DURATION = 180

export type SettledCells = {
  merged: Set<string>
  spawned: string | null
}

export const cellKey = ({ row, column }: Position) => `${row}-${column}`

const reachedTile = (board: GameState['board'], value: number) =>
  board.some((row) => row.some((cell) => cell >= value))

export function useGame({
  canPlayRef,
  onReach2048,
}: {
  canPlayRef: RefObject<boolean>
  onReach2048: () => void
}) {
  const [initialSave] = useState(getSavedGame)
  const [game, setGame] = useState<GameState>(() => {
    const bestScore = getBestScore()
    return initialSave
      ? {
          board: initialSave.board,
          score: initialSave.score,
          bestScore: Math.max(bestScore, initialSave.score),
        }
      : { board: createBoard(), score: 0, bestScore }
  })
  const gameRef = useRef(game)
  const boardRef = useRef<HTMLElement>(null)
  const scoreCardRef = useRef<HTMLDivElement>(null)
  const animationId = useRef(0)
  const moveTimer = useRef<number | null>(null)
  const isMoving = useRef(false)
  const [movingTiles, setMovingTiles] = useState<TileMotion[] | null>(null)
  const [settledCells, setSettledCells] = useState<SettledCells>({
    merged: new Set(),
    spawned: null,
  })
  const [scoreGain, setScoreGain] = useState<{ value: number; id: number } | null>(null)
  const [keepPlaying, setKeepPlaying] = useState(initialSave?.keepPlaying ?? false)

  const hasWon = reachedTile(game.board, 2048)
  const isGameOver = !canMove(game.board)

  const move = useCallback(
    (direction: Direction) => {
      if (isMoving.current || !canPlayRef.current) return

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

        if (reachedTile(moveResult.board, 2048)) onReach2048()

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
    },
    [canPlayRef, onReach2048],
  )

  const newGame = useCallback(() => {
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
  }, [])

  useEffect(() => {
    saveBestScore(game.bestScore)
  }, [game.bestScore])

  useEffect(() => {
    saveGame({ board: game.board, score: game.score, keepPlaying })
  }, [game.board, game.score, keepPlaying])

  useEffect(
    () => () => {
      if (moveTimer.current !== null) window.clearTimeout(moveTimer.current)
    },
    [],
  )

  return {
    game,
    boardRef,
    scoreCardRef,
    movingTiles,
    settledCells,
    scoreGain,
    keepPlaying,
    setKeepPlaying,
    hasWon,
    isGameOver,
    move,
    newGame,
  }
}
