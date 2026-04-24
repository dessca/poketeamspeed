import { normalizeBattleSearchState } from "../domain/battle";

export function createInitialUiState() {
  return {
    selectedPreset: "",
    presetName: "",
    isPresetManagerOpen: false,
    isShowdownImportOpen: false,
    showdownImportText: "",
    showdownImportStatus: null,
    search: "",
    rosterSearch: "",
    rosterSearchStatus: "",
    highlightedRosterRowId: "",
    showScrollTop: false,
    battleSearch: normalizeBattleSearchState(),
    selectedSide: "ally",
    selectedIndex: 0,
    isDetailPanelCleared: false,
    searchTargetSide: "ally",
    draggingSlot: null,
  };
}

export function uiStateReducer(state, action) {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };

    case "select_slot":
      return {
        ...state,
        selectedSide: action.side,
        selectedIndex: action.index,
        isDetailPanelCleared: false,
      };

    case "set_search":
      return { ...state, search: action.value };

    case "set_roster_search":
      return {
        ...state,
        rosterSearch: action.value,
        rosterSearchStatus: action.clearStatus ? "" : state.rosterSearchStatus,
      };

    case "set_highlighted_roster_row":
      return { ...state, highlightedRosterRowId: action.value };

    case "set_roster_search_status":
      return { ...state, rosterSearchStatus: action.value };

    case "set_show_scroll_top":
      return { ...state, showScrollTop: action.value };

    case "set_battle_search":
      return {
        ...state,
        battleSearch:
          typeof action.updater === "function" ? action.updater(state.battleSearch) : action.value,
      };

    case "set_selected_preset":
      return { ...state, selectedPreset: action.value };

    case "set_preset_name":
      return { ...state, presetName: action.value };

    case "set_showdown_import_text":
      return { ...state, showdownImportText: action.value };

    case "set_showdown_import_status":
      return { ...state, showdownImportStatus: action.value };

    case "set_dragging_slot":
      return { ...state, draggingSlot: action.value };

    default:
      return state;
  }
}
