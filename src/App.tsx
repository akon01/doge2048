import { useState } from 'react'
import { CustomizerDialog } from './components/CustomizerDialog'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { GameHeader } from './components/GameHeader'
import { GameOverlay } from './components/GameOverlay'
import { tileImagePaths } from './game/tileImages'
import { useCustomImages } from './hooks/useCustomImages'
import { useDirectionalInput } from './hooks/useDirectionalInput'
import { useGame } from './hooks/useGame'
import { usePreloadedImages } from './hooks/usePreloadedImages'
import { useTileMode } from './hooks/useTileMode'
import './App.css'

function App() {
  const { imagesReady, imagesReadyRef, imageLoadError } =
    usePreloadedImages(tileImagePaths)
  const {
    tileMode,
    setTileMode,
    usModeUnlocked,
    justUnlockedUsMode,
    setJustUnlockedUsMode,
    unlockUsMode,
  } = useTileMode()
  const {
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
  } = useGame({ canPlayRef: imagesReadyRef, onReach2048: unlockUsMode })
  const { customImages, setCustomImage, resetCustomImages } = useCustomImages()
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const touchHandlers = useDirectionalInput(move, imagesReady)

  const startNewGame = () => {
    newGame()
    setJustUnlockedUsMode(false)
  }

  const overlayVisible = isGameOver || (hasWon && !keepPlaying)

  return (
    <main className="game-shell">
      <GameHeader
        score={game.score}
        bestScore={game.bestScore}
        scoreGain={scoreGain}
        scoreCardRef={scoreCardRef}
      />

      <GameControls
        tileMode={tileMode}
        usModeUnlocked={usModeUnlocked}
        onTileModeChange={setTileMode}
        onOpenCustomizer={() => setCustomizerOpen(true)}
        onNewGame={startNewGame}
      />

      <GameBoard
        board={game.board}
        boardRef={boardRef}
        movingTiles={movingTiles}
        settledCells={settledCells}
        tileMode={tileMode}
        customImages={customImages}
        imagesReady={imagesReady}
        imageLoadError={imageLoadError}
        {...touchHandlers}
      >
        {overlayVisible && (
          <GameOverlay
            isGameOver={isGameOver}
            justUnlockedUsMode={justUnlockedUsMode}
            score={game.score}
            onKeepPlaying={() => {
              setKeepPlaying(true)
              setJustUnlockedUsMode(false)
            }}
            onNewGame={startNewGame}
          />
        )}
      </GameBoard>

      {customizerOpen && (
        <CustomizerDialog
          customImages={customImages}
          onImageSelected={async (value, file) => {
            await setCustomImage(value, file)
            setTileMode('custom')
          }}
          onReset={async () => {
            await resetCustomImages()
            setTileMode('doge')
          }}
          onClose={() => setCustomizerOpen(false)}
        />
      )}
    </main>
  )
}

export default App
