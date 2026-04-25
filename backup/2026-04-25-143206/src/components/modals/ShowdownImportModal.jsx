export default function ShowdownImportModal({
  isOpen,
  t,
  renderHelpTooltip,
  onClose,
  searchTargetSide,
  showdownImportText,
  onShowdownImportTextChange,
  showdownImportStatus,
  onClearText,
  onImport,
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
      <section className="saved-manager-dialog showdown-import-dialog" role="dialog" aria-modal="true" aria-label={t.showdownImportTitle}>
        <div className="saved-manager-head">
          <div className="heading-with-help">
            <h3>{t.showdownImportTitle}</h3>
            {renderHelpTooltip()}
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            {t.close}
          </button>
        </div>

        <div className="saved-team-panel modal showdown-import-panel">
          <div className="saved-team-meta showdown-import-meta">
            <strong>
              {t.showdownImportTarget}: {searchTargetSide === "ally" ? t.myTeam : t.opponentTeam}
            </strong>
            <span>{t.showdownImportPlaceholder}</span>
          </div>

          <label className="showdown-import-input">
            <textarea
              value={showdownImportText}
              onChange={(event) => onShowdownImportTextChange(event.target.value)}
              placeholder={`Garchomp @ Choice Scarf\nAbility: Rough Skin\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Earthquake`}
            />
          </label>

          {showdownImportStatus && (
            <div className={`showdown-import-status ${showdownImportStatus.type}`}>
              <strong>{showdownImportStatus.message}</strong>
              {showdownImportStatus.warnings?.length > 0 && (
                <>
                  <span>{t.showdownImportWarnings}</span>
                  <div className="showdown-import-warning-list">
                    {showdownImportStatus.warnings.map((warning) => (
                      <span key={warning}>{warning}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="showdown-import-actions">
            <button type="button" className="ghost-button" onClick={onClearText}>
              {t.showdownImportClear}
            </button>
            <button type="button" className="primary-button" onClick={onImport}>
              {t.showdownImportAction}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
