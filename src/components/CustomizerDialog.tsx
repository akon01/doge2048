import { imageTileValues } from '../game/tileImages'

export function CustomizerDialog({
  customImages,
  onImageSelected,
  onReset,
  onClose,
}: {
  customImages: Record<number, string>
  onImageSelected: (value: number, file: File) => void
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="customizer-backdrop" role="presentation">
      <section
        className="customizer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customizer-title"
      >
        <header>
          <div>
            <h2 id="customizer-title">Custom tile pack</h2>
            <p>Choose one image for each tile value.</p>
          </div>
          <button type="button" className="close-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="custom-image-grid">
          {[...imageTileValues].map((value) => (
            <label key={value} className="custom-image-input">
              <span>{value}</span>
              {customImages[value] ? <img src={customImages[value]} alt="" /> : <b>+</b>}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onImageSelected(value, file)
                }}
              />
            </label>
          ))}
        </div>
        <footer className="customizer-actions">
          <button type="button" className="secondary-button" onClick={onReset}>
            Reset custom pack
          </button>
          <button type="button" className="new-game-button" onClick={onClose}>
            Done
          </button>
        </footer>
      </section>
    </div>
  )
}
