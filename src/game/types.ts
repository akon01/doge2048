export type Direction = 'up' | 'down' | 'left' | 'right'

export type Board = number[][]

export interface GameState {
  board: Board
  score: number
  bestScore: number
}

export interface Position {
  row: number
  column: number
}

export interface TileMotion {
  from: Position
  to: Position
  value: number
}

export interface MoveResult {
  board: Board
  scoreGained: number
  moved: boolean
  motions: TileMotion[]
  mergedCells: Position[]
  spawnedCell: Position | null
}
