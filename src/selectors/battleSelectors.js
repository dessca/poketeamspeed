import {
  buildGraph,
  buildRosterGraph,
  CANONICAL_MEGA_ART,
  getCompareMegaChoices,
  getDisplayIcon,
  getGraphPriorityRange,
  getSelectedMega,
  slotHasPokemon,
} from "../domain/battle";
import { getLocalizedMegaLabel, getLocalizedName } from "../domain/localization";
import { getMegaOptionsForEntry, getRosterSearchNames, ROSTER_SORTS } from "../data/rosterSources";

export function isBattleSelection(battleState, allySlots, enemySlots, side, teamIndex, megaKey = null) {
  const teamSlots = side === "ally" ? allySlots : enemySlots;
  return battleState[side].some(
    (entry) => entry.index === teamIndex && (megaKey ? entry.mega && megaKey === teamSlots[teamIndex]?.megaChoice : !entry.mega)
  );
}

export function buildCompareRows({
  allySlots,
  enemySlots,
  battleState,
  language,
  allyActiveLocked,
  enemyActiveLocked,
}) {
  const rows = [];

  const pushRows = (slots, side) => {
    slots.forEach((slot, index) => {
      if (!slotHasPokemon(slot)) return;

      const baseGraph = buildGraph(slot, slot.baseSpeed, null, language);
      const locked = side === "ally" ? allyActiveLocked : enemyActiveLocked;
      const deemphasized = locked && !slot.active;

      rows.push({
        id: `${side}-${index}-base`,
        side,
        index,
        label: getLocalizedName(slot, language),
        icon: slot.icon,
        graph: baseGraph,
        baseSpeed: slot.baseSpeed,
        active: slot.active,
        selected: isBattleSelection(battleState, allySlots, enemySlots, side, index),
        isMega: false,
        deemphasized,
        priority: deemphasized ? 1 : 0,
      });

      getCompareMegaChoices(slot).forEach((mega) => {
        rows.push({
          id: `${side}-${index}-${mega.key}`,
          side,
          index,
          label: getLocalizedMegaLabel(mega, language),
          icon: getDisplayIcon({ ...slot, megaChoice: mega.key }, true),
          graph: buildGraph(slot, mega.speed, null, language),
          baseSpeed: mega.speed,
          active: slot.active,
          selected: isBattleSelection(battleState, allySlots, enemySlots, side, index, mega.key),
          isMega: true,
          deemphasized,
          priority: deemphasized ? 1 : 0,
        });
      });
    });
  };

  pushRows(allySlots, "ally");
  pushRows(enemySlots, "enemy");

  return rows.sort((a, b) => {
    const aPriorityRange = getGraphPriorityRange(a.graph);
    const bPriorityRange = getGraphPriorityRange(b.graph);
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (bPriorityRange.max !== aPriorityRange.max) return bPriorityRange.max - aPriorityRange.max;
    if (bPriorityRange.min !== aPriorityRange.min) return bPriorityRange.min - aPriorityRange.min;
    return b.graph.max - a.graph.max;
  });
}

function compareRosterNames(a, b, language) {
  return a.label.localeCompare(b.label, language === "ko" ? "ko-KR" : language === "ja" ? "ja-JP" : "en-US", {
    numeric: true,
    sensitivity: "base",
  });
}

function compareRosterSpeed(a, b) {
  if (b.baseSpeed !== a.baseSpeed) return b.baseSpeed - a.baseSpeed;
  const aPriorityRange = getGraphPriorityRange(a.graph);
  const bPriorityRange = getGraphPriorityRange(b.graph);
  if (bPriorityRange.max !== aPriorityRange.max) return bPriorityRange.max - aPriorityRange.max;
  if (bPriorityRange.min !== aPriorityRange.min) return bPriorityRange.min - aPriorityRange.min;
  return 0;
}

function compareRosterDex(a, b) {
  if (a.dexNo !== b.dexNo) return a.dexNo - b.dexNo;
  if (a.isMega !== b.isMega) return a.isMega ? 1 : -1;
  return a.label.localeCompare(b.label, "en-US", { numeric: true, sensitivity: "base" });
}

function compareRosterRows(a, b, language, sortMode) {
  if (sortMode === ROSTER_SORTS.name) return compareRosterNames(a, b, language);
  if (sortMode === ROSTER_SORTS.dex) return compareRosterDex(a, b);
  return compareRosterSpeed(a, b);
}

export function buildRosterRows({ roster, megaOptions, language, sortMode = ROSTER_SORTS.speed }) {
  const rows = [];

  roster.forEach((entry) => {
    rows.push({
      id: entry.id,
      dexNo: entry.dexNo,
      label: getLocalizedName(entry, language),
      icon: entry.icon,
      graph: buildRosterGraph(entry, entry.speed, language),
      baseSpeed: entry.speed,
      isMega: false,
      searchTerms: getRosterSearchNames(entry),
    });

    getMegaOptionsForEntry(megaOptions, entry).forEach((mega) => {
      rows.push({
        id: `${entry.id}-${mega.key}`,
        dexNo: entry.dexNo,
        label: getLocalizedMegaLabel(mega, language),
        icon: mega.icon || CANONICAL_MEGA_ART[mega.label] || entry.icon,
        graph: buildRosterGraph(entry, mega.speed, language),
        baseSpeed: mega.speed,
        isMega: true,
        searchTerms: [
          getLocalizedMegaLabel(mega, language),
          mega.label,
          mega.labelEn,
          mega.labelJa,
          ...getRosterSearchNames(entry),
        ].filter(Boolean),
      });
    });
  });

  return rows.sort((a, b) => {
    const primary = compareRosterRows(a, b, language, sortMode);
    if (primary !== 0) return primary;
    return compareRosterDex(a, b);
  });
}

export function buildBattleUnits({ allySlots, enemySlots, battleState, language, createSlot }) {
  return ["ally", "enemy"].reduce(
    (acc, side) => {
      acc[side] = battleState[side].map((state, battleSlotIndex) => {
        const teamSlots = side === "ally" ? allySlots : enemySlots;
        const slot = teamSlots[state.index] || createSlot(state.index);
        const speed = state.mega ? getSelectedMega(slot)?.speed || slot.baseSpeed : slot.baseSpeed;
        const graph = slotHasPokemon(slot) ? buildGraph(slot, speed, state, language) : null;
        return { side, battleSlotIndex, state, slot, speed, graph };
      });
      return acc;
    },
    { ally: [], enemy: [] }
  );
}

export function buildDoubleBattleEntries({ battleUnits, language, myTeamLabel, opponentTeamLabel }) {
  return [...battleUnits.ally, ...battleUnits.enemy]
    .filter(({ graph }) => Boolean(graph))
    .map((entry) => ({
      ...entry,
      title: entry.side === "ally" ? myTeamLabel : opponentTeamLabel,
      label:
        entry.state.mega && getSelectedMega(entry.slot)
          ? getLocalizedMegaLabel(getSelectedMega(entry.slot), language)
          : getLocalizedName(entry.slot, language),
      icon: getDisplayIcon(entry.slot, entry.state.mega),
    }))
    .sort((a, b) => {
      if (b.graph.point !== a.graph.point) return b.graph.point - a.graph.point;
      if (b.graph.max !== a.graph.max) return b.graph.max - a.graph.max;
      return b.graph.min - a.graph.min;
    });
}
