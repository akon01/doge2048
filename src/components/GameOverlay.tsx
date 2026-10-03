export function GameOverlay({
  isGameOver,
  justUnlockedUsMode,
  score,
  onKeepPlaying,
  onNewGame,
}: {
  isGameOver: boolean
  justUnlockedUsMode: boolean
  score: number
  onKeepPlaying: () => void
  onNewGame: () => void
}) {
  return (
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
          ? `Final score: ${score.toLocaleString()}`
          : justUnlockedUsMode
            ? 'Your tile pictures have changed. You can switch modes anytime.'
            : 'Much skill. Keep going for an even bigger tile?'}
      </p>
      <div className="overlay-actions">
        {!isGameOver && (
          <button type="button" className="secondary-button" onClick={onKeepPlaying}>
            Keep playing
          </button>
        )}
        <button type="button" className="new-game-button" onClick={onNewGame}>
          Try again
        </button>
      </div>
    </div>
  )
}
