import { canActivateBattleAbility, normalizeBattleSideState, resetBattleTransientState } from "../domain/battle";

export function sanitizeBattleStateForSlots(state, slotsBySide) {
  let changed = false;
  const next = { ally: [...state.ally], enemy: [...state.enemy] };

  ["ally", "enemy"].forEach((side) => {
    next[side] = normalizeBattleSideState(next[side]).map((entry) => ({ ...entry }));

    next[side].forEach((entry, battleSlotIndex) => {
      const slot = slotsBySide?.[side]?.[entry.index];
      if (!entry.ability) return;
      if (slot && canActivateBattleAbility(slot, entry)) return;
      next[side][battleSlotIndex] = { ...entry, ability: false };
      changed = true;
    });
  });

  return changed ? next : state;
}

export function battleStateReducer(state, action) {
  switch (action.type) {
    case "set_unit_state": {
      const next = {
        ...state,
        [action.side]: state[action.side].map((entry, index) =>
          index === action.battleSlotIndex ? (typeof action.updater === "function" ? action.updater(entry) : { ...entry, ...action.updater }) : entry
        ),
      };
      return action.slotsBySide ? sanitizeBattleStateForSlots(next, action.slotsBySide) : next;
    }

    case "set_unit_index": {
      const nextSide = state[action.side].map((entry) => ({ ...entry }));
      const otherIndex = nextSide.findIndex((entry, index) => index !== action.battleSlotIndex && entry.index === action.targetIndex);

      if (otherIndex !== -1) {
        nextSide[otherIndex] = resetBattleTransientState(nextSide[otherIndex], nextSide[action.battleSlotIndex].index);
      }

      nextSide[action.battleSlotIndex] = resetBattleTransientState(nextSide[action.battleSlotIndex], action.targetIndex);
      const next = { ...state, [action.side]: nextSide };
      return action.slotsBySide ? sanitizeBattleStateForSlots(next, action.slotsBySide) : next;
    }

    case "reset_side": {
      return {
        ...state,
        [action.side]: normalizeBattleSideState(),
      };
    }

    case "reset_side_transient": {
      return {
        ...state,
        [action.side]: state[action.side].map((entry, index) => resetBattleTransientState(entry, index)),
      };
    }

    case "set_side_tailwind": {
      const next = {
        ...state,
        [action.side]: state[action.side].map((entry) => ({ ...entry, tailwind: action.value })),
      };
      return action.slotsBySide ? sanitizeBattleStateForSlots(next, action.slotsBySide) : next;
    }

    case "sanitize":
      return sanitizeBattleStateForSlots(state, action.slotsBySide);

    default:
      return state;
  }
}
