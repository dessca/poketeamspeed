import { slotHasPokemon } from "../../domain/battle";

export default function PresetManagerModal({
  isOpen,
  t,
  renderHelpTooltip,
  onClose,
  presetName,
  onPresetNameChange,
  selectedPreset,
  placeholderName,
  onSave,
  allyHasPokemon,
  saveTargetExists,
  presets,
  savedAtFormatter,
  onSelectPreset,
  onLoadPreset,
  onDeletePreset,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="saved-manager-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="saved-manager-dialog" role="dialog" aria-modal="true" aria-label={t.savedTeamsTitle}>
        <div className="saved-manager-head">
          <div className="heading-with-help">
            <h3>{t.savedTeamsTitle}</h3>
            {renderHelpTooltip()}
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            {t.close}
          </button>
        </div>

        <div className="saved-team-panel modal">
          <div className="saved-team-toolbar">
            <label className="saved-team-input">
              <span>{t.saveName}</span>
              <input value={presetName} onChange={(event) => onPresetNameChange(event.target.value)} placeholder={placeholderName} />
            </label>
            <button type="button" className="primary-button" onClick={onSave} disabled={!allyHasPokemon}>
              {saveTargetExists ? t.overwrite : t.save}
            </button>
          </div>

          <div className="saved-team-meta">
            <span>{t.savePlaceholder}</span>
            {selectedPreset && (
              <strong>
                {t.selectedSaved}: {selectedPreset}
              </strong>
            )}
          </div>

          {presets.length > 0 ? (
            <div className="saved-team-list">
              {presets.map((preset) => {
                const members = preset.slots.filter(slotHasPokemon);
                const isSelected = selectedPreset === preset.name;

                return (
                  <article
                    key={preset.name}
                    className={`saved-team-card ${isSelected ? "selected" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPreset(preset.name)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectPreset(preset.name);
                      }
                    }}
                  >
                    <div className="saved-team-card-row">
                      <div className="saved-team-summary">
                        <strong>{preset.name}</strong>
                        <span>
                          {members.length}/6 {t.savedMembers}
                        </span>
                      </div>

                      <div className="saved-team-preview">
                        {members.map((slot) => (
                          <span key={`${preset.name}-${slot.slotId}`} className="saved-team-icon-shell">
                            <img src={slot.icon} alt="" className="saved-team-icon" />
                          </span>
                        ))}
                      </div>

                      <div className="saved-team-card-side">
                        <time dateTime={new Date(preset.savedAt).toISOString()}>{savedAtFormatter.format(preset.savedAt)}</time>
                        <div className="saved-team-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onLoadPreset(preset.name);
                            }}
                          >
                            {t.load}
                          </button>
                          <button
                            type="button"
                            className="danger-pill compact"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeletePreset(preset.name);
                            }}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="saved-team-empty">{t.noSavedTeams}</div>
          )}
        </div>
      </section>
    </div>
  );
}
