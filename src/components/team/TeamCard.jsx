export default function TeamCard({
  side,
  slots,
  title,
  activeLabel,
  activeLimit,
  selectedSide,
  selectedIndex,
  getLocalizedName,
  renderActiveToggle,
  onManage,
  onClearOpponent,
  onSelectSlot,
  onSlotDragStart,
  onSlotDragOver,
  onSlotDrop,
  onSlotDragEnd,
  onClearSlot,
  slotEmptyLabel,
  manageLabel,
  clearOpponentLabel,
}) {
  return (
    <section className={`team-card ${side}`}>
      <div className="team-card-head">
        <div>
          <h3>{title}</h3>
          <p>
            {slots.filter((slot) => slot.name && slot.baseSpeed).length}/6 · {slots.filter((slot) => slot.active).length}/{activeLimit} {activeLabel}
          </p>
        </div>
        {side === "ally" ? (
          <div className="team-card-actions">
            <button type="button" className="ghost-button" onClick={onManage}>
              {manageLabel}
            </button>
          </div>
        ) : (
          <button type="button" className="danger-pill" onClick={onClearOpponent}>
            {clearOpponentLabel}
          </button>
        )}
      </div>

      <div className="slot-grid horizontal-six">
        {slots.map((slot, index) => {
          const selected = selectedSide === side && selectedIndex === index;
          const hasPokemon = Boolean(slot.name && slot.baseSpeed);
          const localizedName = hasPokemon ? getLocalizedName(slot) : "";

          return (
            <div
              key={`${side}-${slot.slotId}`}
              role="button"
              tabIndex={0}
              className={`slot-card compact ${selected ? "selected" : ""} ${slot.active ? "active" : ""} ${hasPokemon ? "filled" : "empty"}`}
              draggable={hasPokemon}
              onDragStart={() => onSlotDragStart(index)}
              onDragOver={(event) => onSlotDragOver(event, index)}
              onDrop={(event) => onSlotDrop(event, index)}
              onDragEnd={onSlotDragEnd}
              onClick={() => onSelectSlot(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectSlot(index);
                }
              }}
            >
              {hasPokemon ? (
                <div className="slot-card-top compact">
                  <img src={slot.icon} alt="" className="slot-icon" />
                  <div className="slot-copy">
                    <strong title={localizedName}>{localizedName}</strong>
                  </div>
                  <div className="slot-actions">
                    <button
                      type="button"
                      className="slot-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClearSlot(index);
                      }}
                      aria-label="remove slot"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="slot-remove-icon">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" />
                        <path d="M7 8h10l-1 11H8L7 8Z" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                      </svg>
                    </button>
                    {renderActiveToggle(index, slot, "compact")}
                  </div>
                </div>
              ) : (
                <div className="slot-empty compact">
                  <strong>{slotEmptyLabel}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
