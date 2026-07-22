import type {
  Board,
  Direction,
  MoveResult,
  Position,
  TileMotion,
} from './types'

export const BOARD_SIZE = 4

const emptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))

function addRandomTileWithPosition(board: Board): {
  board: Board
  position: Position | null
} {
  const emptyCells: Position[] = []

  board.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value === 0) {
        emptyCells.push({ row: rowIndex, column: columnIndex })
      }
    })
  })

  if (emptyCells.length === 0) return { board, position: null }

  const nextBoard = board.map((row) => [...row])
  const position = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  nextBoard[position.row][position.column] = Math.random() < 0.9 ? 2 : 4
  return { board: nextBoard, position }
}

export function addRandomTile(board: Board): Board {
  return addRandomTileWithPosition(board).board
}

export function createBoard(): Board {
  return addRandomTile(addRandomTile(emptyBoard()))
}

function getLinePositions(index: number, direction: Direction): Position[] {
  return Array.from({ length: BOARD_SIZE }, (_, offset) => {
    const position =
      direction === 'right' || direction === 'down'
        ? BOARD_SIZE - 1 - offset
        : offset

    return direction === 'left' || direction === 'right'
      ? { row: index, column: position }
      : { row: position, column: index }
  })
}

export function moveBoard(board: Board, direction: Direction): MoveResult {
  const nextBoard = emptyBoard()
  const motions: TileMotion[] = []
  const mergedCells: Position[] = []
  let scoreGained = 0

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    const positions = getLinePositions(lineIndex, direction)
    const tiles = positions
      .map((position) => ({
        position,
        value: board[position.row][position.column],
      }))
      .filter((tile) => tile.value !== 0)

    let sourceIndex = 0
    let targetIndex = 0

    while (sourceIndex < tiles.length) {
      const tile = tiles[sourceIndex]
      const nextTile = tiles[sourceIndex + 1]
      const target = positions[targetIndex]

      if (nextTile && tile.value === nextTile.value) {
        const mergedValue = tile.value * 2
        nextBoard[target.row][target.column] = mergedValue
        motions.push(
          { from: tile.position, to: target, value: tile.value },
          { from: nextTile.position, to: target, value: nextTile.value },
        )
        mergedCells.push(target)
        scoreGained += mergedValue
        sourceIndex += 2
      } else {
        nextBoard[target.row][target.column] = tile.value
        motions.push({ from: tile.position, to: target, value: tile.value })
        sourceIndex += 1
      }

      targetIndex += 1
    }
  }

  const moved = board.some((row, rowIndex) =>
    row.some((value, columnIndex) => value !== nextBoard[rowIndex][columnIndex]),
  )

  if (!moved) {
    return {
      board,
      scoreGained: 0,
      moved: false,
      motions,
      mergedCells: [],
      spawnedCell: null,
    }
  }

  const spawned = addRandomTileWithPosition(nextBoard)
  return {
    board: spawned.board,
    scoreGained,
    moved: true,
    motions,
    mergedCells,
    spawnedCell: spawned.position,
  }
}

export function canMove(board: Board): boolean {
  return board.some((row, rowIndex) =>
    row.some(
      (value, columnIndex) =>
        value === 0 ||
        value === row[columnIndex + 1] ||
        value === board[rowIndex + 1]?.[columnIndex],
    ),
  )
}
