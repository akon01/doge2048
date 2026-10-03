import { BOARD_SIZE } from './engine'
import type { TileMode } from './tileImages'
import type { GameState } from './types'

const BEST_SCORE_KEY = 'doge-2048-best-score'
const US_MODE_UNLOCKED_KEY = 'doge-2048-us-mode-unlocked'
const TILE_MODE_KEY = 'doge-2048-tile-mode'
const GAME_STATE_KEY = 'doge-2048-game-state'

export type SavedGame = Pick<GameState, 'board' | 'score'> & {
  keepPlaying: boolean
}

export function getBestScore(): number {
  const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY))
  return Number.isFinite(saved) ? saved : 0
}

export function saveBestScore(bestScore: number) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore))
}

export function hasUnlockedUsMode(): boolean {
  return window.localStorage.getItem(US_MODE_UNLOCKED_KEY) === 'true'
}

export function saveUsModeUnlocked() {
  window.localStorage.setItem(US_MODE_UNLOCKED_KEY, 'true')
}

export function getInitialTileMode(): TileMode {
  const savedMode = window.localStorage.getItem(TILE_MODE_KEY)
  if (savedMode === 'custom') return 'custom'
  if (savedMode === 'us' && hasUnlockedUsMode()) return 'us'
  return 'doge'
}

export function saveTileMode(mode: TileMode) {
  window.localStorage.setItem(TILE_MODE_KEY, mode)
}

export function getSavedGame(): SavedGame | null {
  try {
    const raw = window.localStorage.getItem(GAME_STATE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<SavedGame>
    const validBoard =
      Array.isArray(saved.board) &&
      saved.board.length === BOARD_SIZE &&
      saved.board.every(
        (row) =>
          Array.isArray(row) &&
          row.length === BOARD_SIZE &&
          row.every((value) => Number.isInteger(value) && value >= 0),
      )
    if (!validBoard || typeof saved.score !== 'number' || !Number.isFinite(saved.score)) {
      return null
    }
    return {
      board: saved.board as GameState['board'],
      score: saved.score,
      keepPlaying: saved.keepPlaying === true,
    }
  } catch {
    return null
  }
}

export function saveGame(game: SavedGame) {
  window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(game))
}
