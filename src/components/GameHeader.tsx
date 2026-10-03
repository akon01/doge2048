import type { RefObject } from 'react'

export function GameHeader({
  score,
  bestScore,
  scoreGain,
  scoreCardRef,
}: {
  score: number
  bestScore: number
  scoreGain: { value: number; id: number } | null
  scoreCardRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <header className="game-header">
      <div className="brand">
        <div>
          <h1>DOGE 2048</h1>
        </div>
      </div>

      <div className="score-row" aria-label="Game scores">
        <div className="score-card" ref={scoreCardRef}>
          <span>Score</span>
          <strong className="score-value" key={score}>
            {score.toLocaleString()}
          </strong>
          {scoreGain && (
            <b className="score-gain" key={scoreGain.id} aria-hidden="true">
              +{scoreGain.value}
            </b>
          )}
        </div>
        <div className="score-card">
          <span>Best</span>
          <strong>{bestScore.toLocaleString()}</strong>
        </div>
      </div>
    </header>
  )
}
