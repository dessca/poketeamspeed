import { normalizeBattleSearchState } from "../domain/battle";
import { ROSTER_SORTS } from "../data/rosterSources";

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
    rosterSort: ROSTER_SORTS.speed,
    rosterChampionFilter: false,
    rosterMegaFilter: false,
    rosterTypeFilters: [],
    rosterGenerationFilters: [],
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

    case "set_roster_sort":
      return {
        ...state,
        rosterSort: action.value,
        highlightedRosterRowId: "",
      };

    case "set_roster_champion_filter":
      return {
        ...state,
        rosterChampionFilter: action.value,
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
      };

    case "set_roster_mega_filter":
      return {
        ...state,
        rosterMegaFilter: action.value,
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
      };

    case "toggle_roster_type_filter": {
      const current = new Set(state.rosterTypeFilters);
      if (current.has(action.value)) {
        current.delete(action.value);
      } else {
        current.add(action.value);
      }

      return {
        ...state,
        rosterTypeFilters: [...current],
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
      };
    }

    case "clear_roster_type_filters":
      return {
        ...state,
        rosterTypeFilters: [],
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
      };

    case "toggle_roster_generation_filter": {
      const current = new Set(state.rosterGenerationFilters);
      if (current.has(action.value)) {
        current.delete(action.value);
      } else {
        current.add(action.value);
      }

      return {
        ...state,
        rosterGenerationFilters: [...current],
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
      };
    }

    case "clear_roster_generation_filters":
      return {
        ...state,
        rosterGenerationFilters: [],
        rosterSearchStatus: "",
        highlightedRosterRowId: "",
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
