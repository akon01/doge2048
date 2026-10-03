import type { TileMode } from '../game/tileImages'

export function GameControls({
  tileMode,
  usModeUnlocked,
  onTileModeChange,
  onOpenCustomizer,
  onNewGame,
}: {
  tileMode: TileMode
  usModeUnlocked: boolean
  onTileModeChange: (mode: TileMode) => void
  onOpenCustomizer: () => void
  onNewGame: () => void
}) {
  const modes: { mode: TileMode; label: string; visible: boolean }[] = [
    { mode: 'doge', label: 'Doge', visible: true },
    { mode: 'us', label: 'The Boobos', visible: usModeUnlocked },
    { mode: 'custom', label: 'Custom', visible: true },
  ]

  return (
    <section className="game-intro">
      <div className="mode-switch" aria-label="Tile picture mode">
        {modes
          .filter(({ visible }) => visible)
          .map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              className={tileMode === mode ? 'active' : ''}
              aria-pressed={tileMode === mode}
              onClick={() => onTileModeChange(mode)}
            >
              {label}
            </button>
          ))}
      </div>
      <button type="button" className="customize-button" onClick={onOpenCustomizer}>
        Pictures
      </button>
      <button type="button" className="new-game-button" onClick={onNewGame}>
        New game
      </button>
    </section>
  )
}
