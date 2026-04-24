import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useRef } from "react";
import { useReducer } from "react";
import { championsRoster, MEGA_OPTIONS } from "./data/championsRoster";
import { Analytics } from '@vercel/analytics/react';
import {
  ABILITY_OPTIONS_BY_NAME,
  buildGraph,
  canActivateBattleAbility,
  DEFAULT_ABILITY_OPTIONS,
  getAbilityHelpText,
  getAbilityOptions,
  getDisplayIcon,
  getMegaChoices,
  getGraphBarHeight,
  getGraphSegmentRenderPriority,
  getSelectedMega,
  getVerdict,
  hasSpeedAbilityOptions,
  ITEMS,
  NATURE_OPTIONS,
  normalizeBattleState,
  slotHasPokemon,
  summarizeTooltipLines,
  formatRange,
} from "./domain/battle";
import {
  getLocalizedCurrentSpeedLabel,
  getLocalizedMegaLabel,
  getLocalizedName,
  getLocalizedOptionLabel,
  pickLocalizedText,
} from "./domain/localization";
import {
  buildBattleUnits,
  buildCompareRows,
  buildDoubleBattleEntries,
  buildRosterRows,
} from "./selectors/battleSelectors";
import { battleStateReducer } from "./state/battleStateReducer";
import { createInitialUiState, uiStateReducer } from "./state/uiStateReducer";
import PresetManagerModal from "./components/modals/PresetManagerModal";
import ShowdownImportModal from "./components/modals/ShowdownImportModal";
import TeamCard from "./components/team/TeamCard";

const ROSTER_BY_ID = new Map(championsRoster.map((entry) => [entry.id, entry]));
const ROSTER_BY_NAME = new Map(championsRoster.map((entry) => [entry.displayName, entry]));
const BASE_ROSTER_BY_DEX = new Map(
  championsRoster
    .filter((entry) => entry.formKey === "base")
    .map((entry) => [entry.dexNo, entry])
);
const ROSTER_BY_SHOWDOWN_NAME = new Map();

const STORAGE = {
  theme: "poke-team-speed:theme",
  language: "poke-team-speed:language",
  view: "poke-team-speed:view",
  battleMode: "poke-team-speed:battle-mode",
  ally: "poke-team-speed:ally",
  enemy: "poke-team-speed:enemy",
  presets: "poke-team-speed:presets",
};

function normalizeLookupKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-ゔァ-ヴー々〆〤一-龠]+/g, "");
}

function normalizeSearchKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-ゔァ-ヴー々〆〤一-龠]+/g, "");
}

function getShowdownAliasesForEntry(entry) {
  const aliases = new Set();
  const baseName = BASE_ROSTER_BY_DEX.get(entry.dexNo)?.displayNameEn || entry.displayNameEn || "";

  if (entry.displayNameEn) aliases.add(entry.displayNameEn);

  switch (entry.formKey) {
    case "alola":
      aliases.add(`${baseName}-Alola`);
      aliases.add(`Alola-${baseName}`);
      break;
    case "galar":
      aliases.add(`${baseName}-Galar`);
      aliases.add(`Galar-${baseName}`);
      break;
    case "hisui":
      aliases.add(`${baseName}-Hisui`);
      aliases.add(`Hisui-${baseName}`);
      break;
    case "heat":
    case "wash":
    case "frost":
    case "fan":
    case "mow":
      aliases.add(`Rotom-${entry.formKey[0].toUpperCase()}${entry.formKey.slice(1)}`);
      break;
    case "paldea-combat":
      aliases.add("Tauros-Paldea-Combat");
      break;
    case "paldea-blaze":
      aliases.add("Tauros-Paldea-Blaze");
      break;
    case "paldea-water":
      aliases.add("Tauros-Paldea-Aqua");
      aliases.add("Tauros-Paldea-Water");
      break;
    case "midday":
      aliases.add("Lycanroc-Midday");
      break;
    case "midnight":
      aliases.add("Lycanroc-Midnight");
      break;
    case "dusk":
      aliases.add("Lycanroc-Dusk");
      break;
    case "alt":
      if (entry.displayNameEn === "Runerigus") aliases.add("Runerigus");
      if (entry.displayNameEn === "Hisuian Sliggoo") aliases.add("Sliggoo-Hisui");
      break;
    default:
      break;
  }

  if (baseName === "Meowstic") {
    aliases.add("Meowstic");
    aliases.add("Meowstic-F");
    aliases.add("Meowstic-M");
  }

  return [...aliases];
}

championsRoster.forEach((entry) => {
  getShowdownAliasesForEntry(entry).forEach((alias) => {
    const key = normalizeLookupKey(alias);
    if (key && !ROSTER_BY_SHOWDOWN_NAME.has(key)) {
      ROSTER_BY_SHOWDOWN_NAME.set(key, entry);
    }
  });
});

const TEXT = {
  ko: {
    titleMain: "SCARF",
    titleSub: "Pokémon Speed Matchups",
    titleHelp: "포켓몬 챔피언스 기준으로 양 팀 포켓몬들의 스피드와 현재 대면 선공을 빠르게 파악하는 도구입니다.",
    graphHelpLabel: "그래프 보는 법 ?",
    graphHelp:
      "가장 두껍게 보이는 막대가 현재 기준으로 가장 확실한 스피드 범위입니다.\n능력 포인트를 모르면 기본 범위가 더 넓게 표시됩니다.\n구애스카프, 스피드 특성처럼 추가 조건이 붙는 가능성은 더 얇은 막대로 함께 표시됩니다.\n더 확실한 범위일수록 두껍고, 가정이 많이 필요한 가능성일수록 더 얇게 보입니다.",
    rosterHelp: "능력 포인트/성격/도구/특성에 따른 스피드 가능 범위를 단계형 막대로 보여줍니다.",
    teamView: "팀 비교",
    rosterView: "전체 포켓몬",
    myTeam: "내 팀",
    opponentTeam: "상대 팀",
    search: "포켓몬 검색",
    searchTarget: "현재 추가 대상",
    teamSettings: "팀 설정",
    detailSettings: "상세 설정",
    detailEmptyHint: "엔트리에서 포켓몬을 선택해\n상세 설정을 확인하세요.",
    liveBattle: "실시간 대면",
    liveBattleEmptyHint: "실시간 대면에서 포켓몬을 선택해\n전투 상황을 설정하세요.",
    battleResultEmptyHint: "내 팀과 상대 팀 포켓몬을 설정하고\n누가 먼저 행동할지 확인해보세요.",
    speedCompare: "팀 스피드 비교",
    speedCompareHelp: "내 팀과 상대 팀 전체 엔트리 포켓몬들의 스피드를 비교해보세요.\n출전 포켓몬이 모두 확정되면 나머지 포켓몬은 제외됩니다.",
    allPokemon: "전체 포켓몬",
    rosterSearchPlaceholder: "포켓몬 이름으로 바로 이동",
    rosterSearchAction: "바로 이동",
    rosterSearchMiss: "일치하는 포켓몬을 찾지 못했습니다.",
    scrollTop: "맨 위로",
    battleMode: "배틀 모드",
    single: "싱글 배틀",
    double: "더블 배틀",
    save: "저장",
    overwrite: "덮어쓰기",
    load: "불러오기",
    delete: "삭제",
    manage: "팀 관리",
    showdownImport: "Showdown 불러오기",
    showdownImportTitle: "Showdown 팀 불러오기",
    showdownImportTarget: "가져올 대상 팀",
    showdownImportPlaceholder: "Pokémon Showdown 팀 텍스트를 그대로 붙여넣어 주세요.",
    showdownImportHelp: "Pokémon Showdown 팀 텍스트를 붙여넣으면 포켓몬, 성격, 스피드 EV, 구애스카프, 지원되는 스피드 특성을 자동으로 반영합니다.\n지원되지 않는 항목은 무시되고, 메가 가능 포켓몬은 메가 선택만 열어 둡니다.",
    showdownImportAction: "팀 가져오기",
    showdownImportClear: "입력 지우기",
    showdownImportEmpty: "붙여넣은 팀 텍스트가 없습니다.",
    showdownImportFailed: "가져올 수 있는 포켓몬을 찾지 못했습니다.",
    showdownImportSuccess: "마리의 포켓몬을 가져왔습니다.",
    showdownImportWarnings: "확인할 항목",
    close: "닫기",
    recentSaved: "최근 저장",
    savedTeams: "저장된 팀",
    savedTeamsTitle: "내 팀 저장 관리",
    saveName: "저장 이름",
    savePlaceholder: "팀 이름을 입력하면 새 저장본으로 보관됩니다.",
    saveHelp: "현재 설정된 내 팀만 저장됩니다.\n저장본을 즉시 불러오거나 삭제할 수 있습니다.",
    noSavedTeams: "아직 저장된 팀이 없습니다.",
    selectedSaved: "선택된 저장본",
    savedMembers: "마리 저장",
    clearOpponent: "일괄 제거",
    slotEmpty: "빈 슬롯",
    statRange: "현재 설정 기준 스피드 범위",
    baseSpeed: "종족값",
    mega: "메가진화",
    noMega: "없음",
    statPoints: "능력 포인트",
    unknown: "모름",
    nature: "능력 보정 (성격)",
    item: "도구",
    ability: "특성",
    abilityHelp: "포켓몬에 따라 스피드 관련 특성이 있는 경우 설정할 수 있습니다.\n속도 보정 특성을 선택하면 이 툴팁에서 발동 조건과 배율을 확인할 수 있습니다.",
    active: "출전",
    standby: "대기",
    resetSlot: "선택 슬롯 초기화",
    clearDetailPanel: "상세 설정 닫기",
    currentPokemon: "현재 포켓몬",
    tailwind: "순풍 ×2.0",
    paralysis: "마비 ×0.5",
    rank: "랭크",
    battleHelp: "실시간 대면 정보를 설정해보세요.\n위 상세 설정과 연동되어 선공 여부를 예측할 수 있습니다.\n누가 먼저 행동할까요?",
    addHint: "팀을 선택하고 포켓몬을 검색해 슬롯에 추가하세요.\n상세 설정에서 스피드 관련 설정을 할 수 있습니다.\n각 슬롯의 출전/대기 버튼을 눌러 출전 포켓몬을 표시해보세요.\n슬롯을 드래그하여 순서를 변경할 수 있습니다.",
    duplicatePokemon: "같은 팀에는 같은 포켓몬을 중복해서 추가할 수 없습니다.",
    savePrompt: "저장할 팀 이름을 입력하세요.",
    saveEmpty: "저장할 내 팀이 없습니다.",
    noData: "아직 추가된 포켓몬이 없습니다.",
    sureFirstMy: "내 팀 확정 선공",
    sureFirstOpp: "상대 팀 확정 선공",
    likelyFirstMy: "내 팀 우세",
    likelyFirstOpp: "상대 팀 우세",
    tieExact: "동속",
    tiePossible: "동속 가능",
    mixed: "혼전",
    tieExactSub: "두 포켓몬의 실수치가 완전히 같으면 매 턴 선공은 무작위로 결정됩니다.",
    tiePossibleSub: "남은 변수에 따라 동속 또는 선공이 갈릴 수 있습니다.",
    likelySubMy: "현재 알려진 정보 기준으로는 내 팀이 앞설 가능성이 큽니다.",
    likelySubOpp: "현재 알려진 정보 기준으로는 상대 팀이 앞설 가능성이 큽니다.",
    sureSubMy: "현재 범위상 상대 팀이 내 팀을 추월할 수 없습니다.",
    sureSubOpp: "현재 범위상 내 팀이 상대 팀을 추월할 수 없습니다.",
    mixedSub: "남아 있는 변수 때문에 결과 범위가 넓게 겹칩니다.",
    doubleOrderTitle: "4마리 행동 순서 예상",
    doubleOrderSub: "현재 설정 기준으로 더블 대면 4마리의 스피드 순위를 비교합니다.",
    footer: "문의: teamscarf@proton.me",
  },
  en: {
    titleMain: "SCARF",
    titleSub: "Pokémon Speed Matchups",
    titleHelp: "A quick tool for Pokémon Champions that lets you compare team-wide Speed ranges and live turn order at a glance.",
    graphHelpLabel: "How to read the graph?",
    graphHelp:
      "The thickest bar shows the most certain Speed range based on the current information.\nIf stat points are unknown, the base range becomes wider.\nExtra possibilities such as Choice Scarf or Speed abilities appear as thinner bars alongside it.\nMore certain ranges are drawn thicker, while more conditional possibilities are drawn thinner.",
    rosterHelp: "Shows each Pokémon's possible Speed range as layered bars for points, nature, item, and ability.",
    teamView: "Team Compare",
    rosterView: "All Pokémon",
    myTeam: "My Team",
    opponentTeam: "Opposing Team",
    search: "Search Pokémon",
    searchTarget: "Current target",
    teamSettings: "Team Setup",
    detailSettings: "Details",
    detailEmptyHint: "Select a Pokémon from the entries\nto open its detail settings.",
    liveBattle: "Live Matchup",
    liveBattleEmptyHint: "Select a Pokémon in Live Matchup\nto configure the battle state.",
    battleResultEmptyHint: "Set both your Pokémon and the opponent's Pokémon\nto check who moves first.",
    speedCompare: "Team Speed Compare",
    speedCompareHelp: "Compare the Speed ranges of all entry Pokémon on both teams.\nOnce all active Pokémon are locked in, the remaining ones are excluded.",
    allPokemon: "All Pokémon",
    rosterSearchPlaceholder: "Jump to a Pokémon by name",
    rosterSearchAction: "Go",
    rosterSearchMiss: "No matching Pokemon was found.",
    scrollTop: "Back to top",
    battleMode: "Battle\nMode",
    single: "Single Battle",
    double: "Double Battle",
    save: "Save",
    overwrite: "Overwrite",
    load: "Load",
    delete: "Delete",
    manage: "Manage",
    showdownImport: "Import Showdown",
    showdownImportTitle: "Import Showdown Team",
    showdownImportTarget: "Import target",
    showdownImportPlaceholder: "Paste a Pokémon Showdown team export here.",
    showdownImportHelp: "Paste a Pokémon Showdown team export to fill Pokémon, nature, Speed EVs, Choice Scarf, and supported Speed abilities automatically.\nUnsupported fields are ignored, and Mega-capable Pokémon keep their Mega selector available.",
    showdownImportAction: "Import Team",
    showdownImportClear: "Clear Text",
    showdownImportEmpty: "There is no Showdown team text to import.",
    showdownImportFailed: "No importable Pokémon were found in the pasted text.",
    showdownImportSuccess: "Pokémon imported.",
    showdownImportWarnings: "Things to check",
    close: "Close",
    recentSaved: "Saved",
    savedTeams: "Saved Teams",
    savedTeamsTitle: "Saved Team Manager",
    saveName: "Save name",
    savePlaceholder: "Enter a team name to save a new snapshot.",
    saveHelp: "Only your current My Team setup is saved here.\nYou can load or delete any saved team immediately.",
    noSavedTeams: "No saved teams yet.",
    selectedSaved: "Selected save",
    savedMembers: "members saved",
    clearOpponent: "Clear All",
    slotEmpty: "Empty Slot",
    statRange: "Current Speed range",
    baseSpeed: "Base Speed",
    mega: "Mega Evolution",
    noMega: "None",
    statPoints: "Stat Points",
    unknown: "Unknown",
    nature: "Nature Modifier",
    item: "Item",
    ability: "Ability",
    abilityHelp: "If this Pokémon has a Speed-related ability option, you can configure it here.\nWhen a Speed ability is selected, this tooltip explains its trigger and multiplier.",
    active: "Active",
    standby: "Bench",
    resetSlot: "Reset Slot",
    clearDetailPanel: "Close Details",
    currentPokemon: "Current Pokémon",
    tailwind: "Tailwind ×2.0",
    paralysis: "Paralysis ×0.5",
    rank: "Stage",
    battleHelp: "Configure the current live matchup here.\nThese settings stay synced with the detail panel,\nso you can quickly check who moves first.",
    addHint: "Choose a team and search for a Pokémon to add to a slot.\nUse the detail panel to adjust Speed-related settings.\nYou can also mark active Pokémon and drag slots to reorder them.",
    duplicatePokemon: "You can't add the same Pokémon twice to one team.",
    savePrompt: "Enter a team name.",
    saveEmpty: "There is no My Team setup to save.",
    noData: "No Pokémon yet.",
    sureFirstMy: "My Team Always Moves First",
    sureFirstOpp: "Opposing Team Always Moves First",
    likelyFirstMy: "My Team Favored",
    likelyFirstOpp: "Opposing Team Favored",
    tieExact: "Speed Tie",
    tiePossible: "Possible Speed Tie",
    mixed: "Too Close to Call",
    tieExactSub: "If both exact Speed values match, move order is random each turn.",
    tiePossibleSub: "The remaining variables can still produce a Speed tie.",
    likelySubMy: "Based on the known settings, my team is more likely to move first.",
    likelySubOpp: "Based on the known settings, the opposing team is more likely to move first.",
    sureSubMy: "The opposing team cannot outspeed within the current range.",
    sureSubOpp: "My team cannot outspeed within the current range.",
    mixedSub: "There are still too many overlapping variables to call it cleanly.",
    doubleOrderTitle: "Predicted Turn Order",
    doubleOrderSub: "Compare the current Speed ranking of all four Pokemon in the live double matchup.",
    footer: "Contact: teamscarf@proton.me",
  },
  ja: {
    titleMain: "SCARF",
    titleSub: "ポケモン素早さマッチアップ",
    titleHelp: "ポケモンチャンピオンズ基準で、両チームの素早さ範囲と現在の対面での行動順をすばやく確認できるツールです。",
    graphHelpLabel: "グラフの見方",
    graphHelp:
      "最も太いバーが、現在の情報で最も確度の高い素早さ範囲です。\n能力ポイントが不明な場合は基本範囲が広く表示されます。\nこだわりスカーフや素早さ特性などの追加条件は、より細いバーで表示されます。\n確度が高い範囲ほど太く、仮定が多い可能性ほど細く表示されます。",
    rosterHelp: "能力ポイント・性格・持ち物・特性による素早さ候補範囲を段階バーで表示します。",
    teamView: "チーム比較",
    rosterView: "全ポケモン",
    myTeam: "自分のチーム",
    opponentTeam: "相手チーム",
    search: "ポケモン検索",
    searchTarget: "追加先",
    teamSettings: "チーム設定",
    detailSettings: "詳細設定",
    detailEmptyHint: "エントリーからポケモンを選んで\n詳細設定を開いてください。",
    liveBattle: "対面確認",
    liveBattleEmptyHint: "対面確認でポケモンを選んで\n対戦状況を設定してください。",
    battleResultEmptyHint: "自分と相手のポケモンを設定して\nどちらが先に動くか確認しましょう。",
    speedCompare: "チーム素早さ比較",
    speedCompareHelp: "両チームのエントリーポケモン全体の素早さ範囲を比較します。\n出場ポケモンがすべて確定すると残りは除外されます。",
    allPokemon: "全ポケモン",
    rosterSearchPlaceholder: "名前でポケモンへ移動",
    rosterSearchAction: "移動",
    rosterSearchMiss: "一致するポケモンが見つかりませんでした。",
    scrollTop: "上へ戻る",
    battleMode: "バトルモード",
    single: "シングルバトル",
    double: "ダブルバトル",
    save: "保存",
    overwrite: "上書き",
    load: "読み込み",
    delete: "削除",
    manage: "管理",
    showdownImport: "Showdown 読み込み",
    showdownImportTitle: "Showdown チーム読み込み",
    showdownImportTarget: "読み込み先",
    showdownImportPlaceholder: "Pokémon Showdown のチームテキストをそのまま貼り付けてください。",
    showdownImportHelp: "Pokémon Showdown のチームテキストを貼り付けると、ポケモン・性格・素早さEV・こだわりスカーフ・対応している素早さ特性を自動反映します。\n未対応の項目は無視され、メガ可能ポケモンはメガ選択のみ開いた状態になります。",
    showdownImportAction: "チームを読み込む",
    showdownImportClear: "入力を消去",
    showdownImportEmpty: "貼り付けられたチームテキストがありません。",
    showdownImportFailed: "読み込めるポケモンが見つかりませんでした。",
    showdownImportSuccess: "匹のポケモンを読み込みました。",
    showdownImportWarnings: "要確認",
    close: "閉じる",
    recentSaved: "最近保存",
    savedTeams: "保存済みチーム",
    savedTeamsTitle: "自分のチーム保存管理",
    saveName: "保存名",
    savePlaceholder: "チーム名を入力すると新しい保存を作成します。",
    saveHelp: "現在の自分のチーム設定のみここに保存されます。\n保存したチームはすぐに読み込みや削除ができます。",
    noSavedTeams: "保存済みチームはまだありません。",
    selectedSaved: "選択中の保存",
    savedMembers: "匹保存",
    clearOpponent: "一括削除",
    slotEmpty: "空きスロット",
    statRange: "現在設定での素早さ範囲",
    baseSpeed: "種族値",
    mega: "メガシンカ",
    noMega: "なし",
    statPoints: "能力ポイント",
    unknown: "不明",
    nature: "性格補正",
    item: "持ち物",
    ability: "特性",
    abilityHelp: "このポケモンに素早さ関連の特性候補がある場合は、ここで設定できます。\n素早さ特性を選ぶと、このツールチップで発動条件と倍率を確認できます。",
    active: "出場",
    standby: "控え",
    resetSlot: "スロット初期化",
    clearDetailPanel: "詳細設定を閉じる",
    currentPokemon: "現在のポケモン",
    tailwind: "おいかぜ ×2.0",
    paralysis: "まひ ×0.5",
    rank: "ランク",
    battleHelp: "現在の対面情報をここで設定します。\n詳細設定と連動しているので、\nどちらが先に動くかをすばやく確認できます。",
    addHint: "チームを選び、ポケモンを検索してスロットに追加してください。\n詳細設定で素早さ関連の設定を調整できます。\n出場ポケモンの指定やスロットのドラッグ並び替えもできます。",
    duplicatePokemon: "同じチームに同じポケモンは追加できません。",
    savePrompt: "チーム名を入力してください。",
    saveEmpty: "保存できる自分のチームがありません。",
    noData: "まだ追加されたポケモンはありません。",
    sureFirstMy: "自分のチームが確定先手",
    sureFirstOpp: "相手チームが確定先手",
    likelyFirstMy: "自分のチーム有利",
    likelyFirstOpp: "相手チーム有利",
    tieExact: "同速",
    tiePossible: "同速の可能性",
    mixed: "接戦",
    tieExactSub: "実数値が完全に同じ場合、毎ターンの行動順はランダムです。",
    tiePossibleSub: "残っている変数によって同速になる可能性があります。",
    likelySubMy: "現在わかっている情報では、自分のチームが先に動く可能性が高いです。",
    likelySubOpp: "現在わかっている情報では、相手チームが先に動く可能性が高いです。",
    sureSubMy: "現在の範囲では、相手チームが上を取ることはできません。",
    sureSubOpp: "現在の範囲では、自分のチームが上を取ることはできません。",
    mixedSub: "残っている変数が重なっており、まだはっきり断定できません。",
    doubleOrderTitle: "4体の行動順予想",
    doubleOrderSub: "現在の設定を基準に、ダブル対面の4体の素早さ順位を比較します。",
    footer: "お問い合わせ: teamscarf@proton.me",
  },
};

const LEGACY_MEGA_CHOICE_ALIASES = {
  "냐오닉스:mega-m": "mega",
  "냐오닉스:mega-f": "mega",
};

function createSlot(index) {
  return {
    slotId: `slot-${index}`,
    rosterId: "",
    dexNo: null,
    formKey: "base",
    name: "",
    nameEn: "",
    nameJa: "",
    baseSpeed: 0,
    icon: "",
    active: false,
    megaChoice: "",
    evUnknown: true,
    evValue: 32,
    nature: "unknown",
    itemSetting: "unknown",
    abilitySetting: "unknown",
  };
}

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function detectInitialLanguage() {
  const savedLanguage = readStorage(STORAGE.language, null);
  if (savedLanguage === "ko" || savedLanguage === "en" || savedLanguage === "ja") return savedLanguage;

  try {
    const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language].filter(Boolean);
    const normalizedLanguages = browserLanguages.map((value) => String(value).toLowerCase());
    const resolved = Intl.DateTimeFormat().resolvedOptions();
    const locale = String(resolved.locale || "").toLowerCase();
    const timeZone = String(resolved.timeZone || "");

    const isKoreanContext =
      normalizedLanguages.some((value) => value.startsWith("ko") || value.includes("-kr")) ||
      locale.startsWith("ko") ||
      locale.includes("-kr") ||
      timeZone === "Asia/Seoul";
    const isJapaneseContext =
      normalizedLanguages.some((value) => value.startsWith("ja") || value.includes("-jp")) ||
      locale.startsWith("ja") ||
      locale.includes("-jp") ||
      timeZone === "Asia/Tokyo";

    if (isKoreanContext) return "ko";
    if (isJapaneseContext) return "ja";
    return "en";
  } catch {
    return "en";
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function clampInt(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function getCanonicalRosterEntry(raw) {
  if (raw?.rosterId && ROSTER_BY_ID.has(raw.rosterId)) return ROSTER_BY_ID.get(raw.rosterId);
  if (raw?.name && ROSTER_BY_NAME.has(raw.name)) return ROSTER_BY_NAME.get(raw.name);
  return null;
}

function normalizeMegaChoice(name, megaChoice) {
  if (typeof megaChoice !== "string" || !megaChoice) return "";
  return LEGACY_MEGA_CHOICE_ALIASES[`${name}:${megaChoice}`] || megaChoice;
}

function normalizeSlot(raw, index) {
  const canonical = getCanonicalRosterEntry(raw);
  const name = canonical?.displayName ?? raw?.name ?? "";
  const nameEn = canonical?.displayNameEn ?? raw?.nameEn ?? "";
  const nameJa = canonical?.displayNameJa ?? raw?.nameJa ?? "";
  return {
    ...createSlot(index),
    ...raw,
    slotId: `slot-${index}`,
    rosterId: canonical?.id ?? raw?.rosterId ?? "",
    dexNo: canonical?.dexNo ?? raw?.dexNo ?? null,
    formKey: canonical?.formKey ?? raw?.formKey ?? "base",
    name,
    nameEn,
    nameJa,
    baseSpeed: clampInt(canonical?.speed ?? raw?.baseSpeed ?? 0, 0, 255),
    icon: canonical?.icon ?? raw?.icon ?? "",
    megaChoice: normalizeMegaChoice(name, raw?.megaChoice ?? ""),
    evValue: clampInt(raw?.evValue ?? 32, 0, 32),
  };
}

function normalizeTeam(raw) {
  return Array.from({ length: 6 }, (_, index) => normalizeSlot(raw?.[index], index));
}

const FAST_SHOWDOWN_NATURES = new Set(["timid", "jolly", "hasty", "naive"]);
const SLOW_SHOWDOWN_NATURES = new Set(["brave", "relaxed", "quiet", "sassy"]);

function resolveRosterEntryFromShowdownName(name) {
  const direct = ROSTER_BY_SHOWDOWN_NAME.get(normalizeLookupKey(name));
  if (direct) return direct;

  const strippedGender = String(name || "").replace(/-(?:m|f)$/i, "");
  return ROSTER_BY_SHOWDOWN_NAME.get(normalizeLookupKey(strippedGender)) || null;
}

function parseShowdownHeader(headerLine) {
  const [rawIdentity, rawItem = ""] = String(headerLine || "").split(/\s+@\s+/);
  const identity = rawIdentity.replace(/\s+\((?:M|F)\)\s*$/i, "").trim();
  const speciesMatch = identity.match(/\(([^()]+)\)\s*$/);

  return {
    speciesName: speciesMatch ? speciesMatch[1].trim() : identity,
    itemName: rawItem.trim(),
  };
}

function parseShowdownNatureKey(natureName) {
  const key = normalizeLookupKey(natureName);
  if (FAST_SHOWDOWN_NATURES.has(key)) return "fast";
  if (SLOW_SHOWDOWN_NATURES.has(key)) return "slow";
  return natureName ? "neutral" : "unknown";
}

function parseShowdownSpeedEv(evLine) {
  const match = String(evLine || "").match(/(\d+)\s+Spe\b/i);
  return match ? clampInt(Math.round(Number(match[1]) / 8), 0, 32) : 0;
}

function resolveImportedAbilitySetting(entry, abilityName) {
  const options = ABILITY_OPTIONS_BY_NAME[entry.displayName] || DEFAULT_ABILITY_OPTIONS;
  if (!abilityName) return options.length > 1 ? "unknown" : "none";

  const normalizedAbility = normalizeLookupKey(abilityName);
  const matched = options.find((option) =>
    normalizeLookupKey(option.labelEn) === normalizedAbility ||
    normalizeLookupKey(option.labelKo) === normalizedAbility ||
    normalizeLookupKey(option.labelJa) === normalizedAbility ||
    normalizeLookupKey(option.key) === normalizedAbility
  );

  return matched ? matched.key : "none";
}

function resolveImportedItemSetting(itemName) {
  const normalizedItem = normalizeLookupKey(itemName);
  return normalizedItem === "choicescarf" || normalizedItem === normalizeLookupKey("こだわりスカーフ") ? "scarf" : "none";
}

function parseShowdownTeamText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const { speciesName, itemName } = parseShowdownHeader(lines[0] || "");
      const abilityLine = lines.find((line) => /^Ability:/i.test(line));
      const natureLine = lines.find((line) => / Nature$/i.test(line));
      const evLine = lines.find((line) => /^EVs:/i.test(line));

      return {
        speciesName,
        itemName,
        abilityName: abilityLine ? abilityLine.replace(/^Ability:\s*/i, "").trim() : "",
        natureName: natureLine ? natureLine.replace(/\s+Nature$/i, "").trim() : "",
        speedEv: parseShowdownSpeedEv(evLine),
      };
    });
}

function normalizePreset(raw, index) {
  const name = typeof raw?.name === "string" ? raw.name.trim() : "";
  if (!name) return null;
  const savedAt = Number.isFinite(raw?.savedAt) ? raw.savedAt : Date.now() - index;
  return {
    name,
    slots: normalizeTeam(raw?.slots),
    savedAt,
  };
}

function normalizePresets(raw) {
  if (!Array.isArray(raw)) return [];

  const seen = new Set();

  return raw
    .map(normalizePreset)
    .filter(Boolean)
    .sort((a, b) => b.savedAt - a.savedAt)
    .filter((preset) => {
      if (seen.has(preset.name)) return false;
      seen.add(preset.name);
      return true;
    })
    .slice(0, 20);
}

function getNextPresetName(baseLabel, presets) {
  const names = new Set(presets.map((preset) => preset.name));

  for (let index = 1; index < 1000; index += 1) {
    const candidate = `${baseLabel} ${index}`;
    if (!names.has(candidate)) return candidate;
  }

  return `${baseLabel} ${Date.now()}`;
}

function Tooltip({ label, text, className = "" }) {
  const lines = String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <span className={`tooltip-anchor ${className}`} tabIndex={0}>
      {label}
      <span className={`tooltip-panel ${lines.length > 1 ? "multiline" : ""}`}>
        {lines.length > 1 ? (
          <span className="tooltip-lines">
            {lines.map((line) => (
              <span key={line} className="tooltip-line">
                {line}
              </span>
            ))}
          </span>
        ) : (
          text
        )}
      </span>
    </span>
  );
}

function buildEndpointMarkers(segments) {
  const visibleMarkers = [];

  segments.forEach((segment, index) => {
    const endpoints = segment.min === segment.max
      ? [{ id: `${segment.id}:value`, value: segment.min }]
      : [
          { id: `${segment.id}:min`, value: segment.min },
          { id: `${segment.id}:max`, value: segment.max },
        ];

    endpoints.forEach(({ id, value }) => {
      const isInsideOverlap = segments.some((other, otherIndex) => otherIndex !== index && other.min < value && value < other.max);
      if (isInsideOverlap) return;

      visibleMarkers.push({
        id,
        value,
        labels: segment.labels,
      });
    });
  });

  const grouped = new Map();
  visibleMarkers.forEach((marker) => {
    const current = grouped.get(marker.value) || {
      value: marker.value,
      primaryId: marker.id,
      ids: [],
      labelSet: new Set(),
    };

    current.ids.push(marker.id);
    marker.labels.forEach((label) => current.labelSet.add(label));
    grouped.set(marker.value, current);
  });

  const entries = [...grouped.values()]
    .map((entry) => ({
      id: entry.primaryId,
      value: entry.value,
      labels: [...entry.labelSet],
    }))
    .sort((a, b) => a.value - b.value);

  if (entries.length <= 12) return entries;

  const picks = [0, Math.floor(entries.length * 0.25), Math.floor(entries.length * 0.5), Math.floor(entries.length * 0.75), entries.length - 1];
  return [...new Map(picks.map((index) => [entries[index].id, entries[index]])).values()];
}

function rangesOverlap(minA, maxA, minB, maxB) {
  return Math.max(minA, minB) <= Math.min(maxA, maxB);
}

function buildRollingDigitSequence(fromChar, toChar) {
  const fromIsDigit = /\d/.test(fromChar);
  const toIsDigit = /\d/.test(toChar);

  if (!fromIsDigit && toIsDigit) {
    const to = Number(toChar);
    return [String((to + 8) % 10), String((to + 9) % 10), toChar];
  }

  if (fromIsDigit && !toIsDigit) {
    const from = Number(fromChar);
    return [fromChar, String((from + 1) % 10), toChar];
  }

  if (!fromIsDigit || !toIsDigit) return [toChar];

  const from = Number(fromChar);
  const to = Number(toChar);
  if (from === to) return [toChar];

  const direction = to >= from ? 1 : -1;
  const sequence = [String(from)];
  let current = from;

  while (current !== to) {
    current = (current + direction + 10) % 10;
    sequence.push(String(current));
    if (sequence.length > 11) break;
  }

  return sequence;
}

function RollingDigit({ fromChar, toChar, animationKey }) {
  const sequence = useMemo(() => buildRollingDigitSequence(fromChar, toChar), [fromChar, toChar]);

  if (sequence.length <= 1) {
    return <span className="rolling-digit-static">{toChar}</span>;
  }

  return (
    <span className="rolling-digit-window" aria-hidden="true">
      <span
        key={animationKey}
        className="rolling-digit-track is-animating"
        style={{ "--digit-offset": sequence.length - 1 }}
      >
        {sequence.map((digit, index) => (
          <span key={`${animationKey}-${digit}-${index}`} className="rolling-digit-cell">
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingNumber({ value, animationIdentity, phase = "stable" }) {
  const nextText = String(value);
  const blankText = " ".repeat(nextText.length);
  const targetText = phase === "exit" ? blankText : nextText;
  const fromText = phase === "exit" ? nextText : blankText;

  const width = Math.max(fromText.length, targetText.length);
  const fromChars = fromText.padStart(width, " ").split("");
  const toChars = targetText.padStart(width, " ").split("");

  return (
    <span className="rolling-number" aria-label={nextText}>
      {toChars.map((toChar, index) => (
        <RollingDigit
          key={`${animationIdentity}-${phase}-${targetText}-${index}`}
          fromChar={fromChars[index] ?? " "}
          toChar={toChar}
          animationKey={`${animationIdentity}-${phase}-${targetText}-${index}`}
        />
      ))}
    </span>
  );
}

function SpeedGraph({ graph, maxValue, tone = "ally", compact = false, markerValuePlacement = "none" }) {
  const graphRef = useRef(null);
  const [graphWidth, setGraphWidth] = useState(0);
  const pointIsRange = graph.pointMax > graph.pointMin;
  const pointTooltip = graph.pointTooltip?.join("\n") || "";
  const pointTop = compact ? 30 : 27;
  const natureBranches = graph.layers
    .filter((layer) => layer.kind === "nature")
    .flatMap((layer) => layer.branches);
  const renderedLayerSegments = graph.layers.flatMap((layer) =>
    layer.branches.map((branch) => {
      const isThinLayer = layer.kind === "item" || layer.kind === "ability" || layer.kind === "both";
      const overlapsPoint = rangesOverlap(branch.min, branch.max, graph.pointMin, graph.pointMax);
      const overlapsNature = natureBranches.some((natureBranch) =>
        rangesOverlap(branch.min, branch.max, natureBranch.min, natureBranch.max)
      );

      return {
        layer,
        branch,
        hidden: isThinLayer && (overlapsPoint || overlapsNature),
      };
    })
  );
  const visibleLayerSegments = renderedLayerSegments.filter((segment) => !segment.hidden);
  const visualSegments = [
    {
      semanticId: pointIsRange ? "point-range" : "point-fixed",
      matchKey: "point",
      segmentKind: pointIsRange ? "point-range" : "point",
      tone: "neutral",
      uncertaintyCount: graph.pointUncertaintyCount ?? 0,
      min: pointIsRange ? graph.pointMin : graph.point,
      max: pointIsRange ? graph.pointMax : graph.point,
      className: pointIsRange ? "speed-graph-point-range" : "speed-graph-point single-value",
      labelLines: graph.pointTooltip || [],
      tooltip: pointTooltip,
    },
    ...visibleLayerSegments.map(({ layer, branch }) => ({
      semanticId: `${layer.key}-${branch.key}`,
      matchKey: `${layer.key}-${branch.key}`,
      segmentKind: layer.kind,
      tone: branch.tone,
      uncertaintyCount: layer.uncertaintyCount ?? 0,
      min: branch.min,
      max: branch.max,
      className: `speed-graph-layer-segment speed-graph-layer-${layer.kind} speed-graph-tone-${branch.tone}${branch.min === branch.max ? " single-value" : ""}`,
      labelLines: layer.tooltip || [],
      tooltip: layer.tooltip.join("\n"),
    })),
  ];
  const renderedSegments = visualSegments.map((segment) => ({
    ...segment,
    renderId: segment.semanticId,
    phase: "stable",
  }));
  const markerLabels = markerValuePlacement === "none"
    ? []
    : (() => {
        const markerSegments = renderedSegments.map((segment) => ({
          id: segment.renderId,
          min: segment.min,
          max: segment.max,
          labels: segment.labelLines || [],
          phase: segment.phase,
        }));

        const phaseById = new Map(markerSegments.map((segment) => [segment.id, segment.phase]));
        const sorted = buildEndpointMarkers(markerSegments)
          .sort((a, b) => a.value - b.value)
          .map((marker) => {
            const preferredPercent = (marker.value / maxValue) * 100;
            const estimatedWidth = Math.max(18, String(marker.value).length * 8 + 6);
            const rotatedFootprint = estimatedWidth * 0.56 + 2;
            const widthPercent = graphWidth > 0 ? (rotatedFootprint / graphWidth) * 100 : compact ? 3.8 : 3;
            return {
              ...marker,
              phase: phaseById.get(marker.id) || "stable",
              preferredPercent,
              widthPercent,
              tooltipText: summarizeTooltipLines(marker.labels).join("\n"),
            };
          });

        const minGapPercent = graphWidth > 0 ? ((compact ? 2 : 1.5) / graphWidth) * 100 : 0.25;

        let prevRight = 0;
        const forward = sorted.map((marker) => {
          const half = marker.widthPercent / 2;
          const center = Math.max(marker.preferredPercent, prevRight + minGapPercent + half);
          const clamped = Math.min(center, 100 - half);
          prevRight = clamped + half;
          return { ...marker, labelPercent: clamped };
        });

        let nextLeft = 100;
        return [...forward]
          .reverse()
          .map((marker) => {
            const half = marker.widthPercent / 2;
            const center = Math.min(marker.labelPercent, nextLeft - minGapPercent - half);
            const clamped = Math.max(center, half);
            nextLeft = clamped - half;
            return { ...marker, labelPercent: clamped };
          })
          .reverse();
      })();
  useEffect(() => {
    if (markerValuePlacement === "none") return undefined;

    const node = graphRef.current;
    if (!node) return undefined;

    const updateWidth = () => setGraphWidth(node.getBoundingClientRect().width || 0);
    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [markerValuePlacement]);

    return (
    <div ref={graphRef} className={`speed-graph ${tone} ${compact ? "compact" : ""}`}>
      {[...renderedSegments]
        .sort((a, b) => getGraphSegmentRenderPriority(a) - getGraphSegmentRenderPriority(b))
        .map(({ renderId, min, max, className, tooltip, uncertaintyCount, segmentKind, tone }) => {
          const left = (min / maxValue) * 100;
          const width = ((max - min) / maxValue) * 100;
          const barHeight = getGraphBarHeight(uncertaintyCount ?? 0, segmentKind, tone);

          return (
            <div
              key={renderId}
              className={`${className} marker-tooltip`}
              style={{
                "--graph-bar-height": `${barHeight}px`,
                left: `${left}%`,
                top: `${pointTop}px`,
                width: `${Math.max(0.8, width)}%`,
              }}
              data-tooltip={tooltip}
              tabIndex={0}
            />
          );
        })}
      {markerLabels.map((marker) => (
        <span
          key={`label-${marker.id}`}
          className={`speed-graph-value marker-tooltip ${markerValuePlacement}`}
          style={{ left: `${marker.labelPercent}%` }}
          data-tooltip={marker.tooltipText}
          tabIndex={0}
        >
          <span className="marker-hitbox" />
          <span className="speed-graph-value-text">
            <RollingNumber value={marker.value} animationIdentity={marker.id} />
          </span>
        </span>
      ))}
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(() => detectInitialLanguage());
  const [theme, setTheme] = useState(() => readStorage(STORAGE.theme, "dark"));
  const [view, setView] = useState(() => readStorage(STORAGE.view, "team"));
  const [battleMode, setBattleMode] = useState(() => readStorage(STORAGE.battleMode, "single"));
  const [allySlots, setAllySlots] = useState(() => normalizeTeam(readStorage(STORAGE.ally, null)));
  const [enemySlots, setEnemySlots] = useState(() => normalizeTeam(readStorage(STORAGE.enemy, null)));
  const [presets, setPresets] = useState(() => normalizePresets(readStorage(STORAGE.presets, [])));
  const [uiState, dispatchUiState] = useReducer(uiStateReducer, undefined, createInitialUiState);
  const compareRowRefs = useRef(new Map());
  const rosterRowRefs = useRef(new Map());
  const rosterSearchTimerRef = useRef(null);
  const previousComparePositions = useRef(new Map());
  const [battleState, dispatchBattleState] = useReducer(battleStateReducer, undefined, () => normalizeBattleState());

  const {
    selectedPreset,
    presetName,
    isPresetManagerOpen,
    isShowdownImportOpen,
    showdownImportText,
    showdownImportStatus,
    search,
    rosterSearch,
    rosterSearchStatus,
    highlightedRosterRowId,
    showScrollTop,
    battleSearch,
    selectedSide,
    selectedIndex,
    isDetailPanelCleared,
    searchTargetSide,
    draggingSlot,
  } = uiState;

  const t = TEXT[language];
  const selectedSlot = (selectedSide === "ally" ? allySlots : enemySlots)[selectedIndex] || createSlot(selectedIndex);
  const savedAtFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(
        pickLocalizedText(language, {
          ko: "ko-KR",
          en: "en-US",
          ja: "ja-JP",
        }),
        {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        }
      ),
    [language]
  );

  useEffect(() => writeStorage(STORAGE.theme, theme), [theme]);
  useEffect(() => writeStorage(STORAGE.language, language), [language]);
  useEffect(() => writeStorage(STORAGE.view, view), [view]);
  useEffect(() => writeStorage(STORAGE.battleMode, battleMode), [battleMode]);
  useEffect(() => writeStorage(STORAGE.ally, allySlots), [allySlots]);
  useEffect(() => writeStorage(STORAGE.enemy, enemySlots), [enemySlots]);
  useEffect(() => writeStorage(STORAGE.presets, presets), [presets]);
  useEffect(() => {
    const handleScroll = () => dispatchUiState({ type: "set_show_scroll_top", value: window.scrollY > 280 });
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(
    () => () => {
      if (rosterSearchTimerRef.current) {
        window.clearTimeout(rosterSearchTimerRef.current);
      }
    },
    []
  );

  const getSlotsBySide = (overrides = {}) => ({
    ally: overrides.ally ?? allySlots,
    enemy: overrides.enemy ?? enemySlots,
  });

  const dispatchBattle = (action, slotOverrides = {}) => {
    dispatchBattleState({
      ...action,
      slotsBySide: getSlotsBySide(slotOverrides),
    });
  };

  const dispatchUi = (action) => {
    dispatchUiState(action);
  };

  const selectSlot = (side, index) => {
    dispatchUi({ type: "select_slot", side, index });
  };

  const updateTeam = (side, updater) => {
    const setter = side === "ally" ? setAllySlots : setEnemySlots;
    setter((current) => {
      const next = updater(current);
      dispatchBattleState({
        type: "sanitize",
        slotsBySide: getSlotsBySide({ [side]: next }),
      });
      return next;
    });
  };

  const updateSlot = (side, index, patch) => {
    updateTeam(side, (current) =>
      current.map((slot, slotIndex) => {
        if (slotIndex !== index) return slot;
        const next = typeof patch === "function" ? patch(slot) : { ...slot, ...patch };
        return normalizeSlot(next, index);
      })
    );
  };

  const setBattleUnitState = (side, battleSlotIndex, updater) => {
    dispatchBattle({ type: "set_unit_state", side, battleSlotIndex, updater });
  };

  const setBattleUnitIndex = (side, battleSlotIndex, targetIndex) => {
    dispatchBattle({ type: "set_unit_index", side, battleSlotIndex, targetIndex });
  };

  const updateBattleSlot = (side, battleSlotIndex, patch) => {
    const index = battleState[side][battleSlotIndex].index;
    updateSlot(side, index, patch);
  };

  const jumpToRosterRow = (row) => {
    if (!row) {
      dispatchUi({ type: "patch", patch: { highlightedRosterRowId: "", rosterSearchStatus: t.rosterSearchMiss } });
      return;
    }

    dispatchUi({ type: "patch", patch: { rosterSearchStatus: "", highlightedRosterRowId: row.id } });

    const node = rosterRowRefs.current.get(row.id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (rosterSearchTimerRef.current) {
      window.clearTimeout(rosterSearchTimerRef.current);
    }
    rosterSearchTimerRef.current = window.setTimeout(() => {
      dispatchUi({ type: "set_highlighted_roster_row", value: "" });
    }, 1800);
  };

  const importShowdownTeam = () => {
    const input = showdownImportText.trim();
    if (!input) {
      dispatchUi({ type: "set_showdown_import_status", value: { type: "error", message: t.showdownImportEmpty, warnings: [] } });
      return;
    }

    const parsedSets = parseShowdownTeamText(input);
    const warnings = [];
    const importedSlots = [];

    parsedSets.slice(0, 6).forEach((set) => {
      const entry = resolveRosterEntryFromShowdownName(set.speciesName);
      if (!entry) {
        warnings.push(set.speciesName);
        return;
      }

      const hasMega = (MEGA_OPTIONS[entry.displayName] || []).length > 0;
      importedSlots.push(
        normalizeSlot(
          {
            rosterId: entry.id,
            dexNo: entry.dexNo,
            formKey: entry.formKey,
            name: entry.displayName,
            nameEn: entry.displayNameEn,
            nameJa: entry.displayNameJa,
            baseSpeed: entry.speed,
            icon: entry.icon,
            active: false,
            megaChoice: hasMega ? "unknown" : "",
            evUnknown: false,
            evValue: set.speedEv,
            nature: parseShowdownNatureKey(set.natureName),
            itemSetting: resolveImportedItemSetting(set.itemName),
            abilitySetting: resolveImportedAbilitySetting(entry, set.abilityName),
          },
          importedSlots.length
        )
      );
    });

    if (!importedSlots.length) {
      dispatchUi({ type: "set_showdown_import_status", value: { type: "error", message: t.showdownImportFailed, warnings } });
      return;
    }

    if (parsedSets.length > 6) {
      warnings.push(
        pickLocalizedText(language, {
          ko: "처음 6마리만 가져왔습니다.",
          en: "Only the first 6 Pokémon were imported.",
          ja: "最初の6匹のみ読み込みました。",
        })
      );
    }

    updateTeam(searchTargetSide, () =>
      Array.from({ length: 6 }, (_, index) => importedSlots[index] || createSlot(index))
    );

    selectSlot(searchTargetSide, 0);
    dispatchUi({
      type: "patch",
      patch: {
        isDetailPanelCleared: false,
        search: "",
        battleSearch: { ...battleSearch, [searchTargetSide]: ["", ""] },
      },
    });
    dispatchBattleState({ type: "reset_side_transient", side: searchTargetSide });

    dispatchUi({
      type: "set_showdown_import_status",
      value: {
        type: "success",
        message: `${importedSlots.length} ${t.showdownImportSuccess}`,
        warnings,
      },
    });
  };

  const searchResults = useMemo(() => {
    const keyword = normalizeSearchKey(search);
    if (!keyword) return [];
    return championsRoster
      .filter((entry) =>
        normalizeSearchKey(`${entry.displayName} ${entry.displayNameEn || ""} ${entry.displayNameJa || ""}`).includes(keyword)
      )
      .slice(0, 10);
  }, [search]);

  const battleSearchResults = useMemo(
    () =>
      ["ally", "enemy"].reduce(
        (acc, side) => {
          acc[side] = [0, 1].map((battleSlotIndex) => {
            const keyword = normalizeSearchKey(battleSearch[side][battleSlotIndex]);
            return keyword
              ? championsRoster
                  .filter((entry) =>
                    normalizeSearchKey(`${entry.displayName} ${entry.displayNameEn || ""} ${entry.displayNameJa || ""}`).includes(keyword)
                  )
                  .slice(0, 8)
              : [];
          });
          return acc;
        },
        { ally: [[], []], enemy: [[], []] }
      ),
    [battleSearch]
  );

  const findNextInsertIndex = (side, preferredIndex = null) => {
    const team = side === "ally" ? allySlots : enemySlots;
    const emptyIndex = team.findIndex((slot) => !slotHasPokemon(slot));
    if (emptyIndex !== -1) return emptyIndex;
    if (preferredIndex !== null) return preferredIndex;
    return side === selectedSide ? selectedIndex : 0;
  };

  const hasDuplicatePokemonInSide = (side, entry, preferredIndex = null) => {
    const team = side === "ally" ? allySlots : enemySlots;
    return team.some((slot, index) => {
      if (index === preferredIndex) return false;
      if (!slotHasPokemon(slot)) return false;
      return slot.name === entry.displayName;
    });
  };

  const applyRosterEntryToSide = (entry, side, options = {}) => {
    const { preferredIndex = null, syncBattleIndex = false, battleSlotIndex = 0 } = options;
    if (hasDuplicatePokemonInSide(side, entry, preferredIndex)) {
      window.alert(t.duplicatePokemon);
      return;
    }
    const hasMega = (MEGA_OPTIONS[entry.displayName] || []).length > 0;
    const abilityOptions = ABILITY_OPTIONS_BY_NAME[entry.displayName] || DEFAULT_ABILITY_OPTIONS;
    const targetIndex = findNextInsertIndex(side, preferredIndex);
    updateSlot(side, targetIndex, {
      rosterId: entry.id,
      dexNo: entry.dexNo,
      formKey: entry.formKey,
      name: entry.displayName,
      nameEn: entry.displayNameEn,
      nameJa: entry.displayNameJa,
      baseSpeed: entry.speed,
      icon: entry.icon,
      megaChoice: hasMega ? "unknown" : "",
      nature: "unknown",
      itemSetting: "unknown",
      abilitySetting: abilityOptions.length > 1 ? "unknown" : "none",
    });
    selectSlot(side, targetIndex);
    if (syncBattleIndex) {
      setBattleUnitIndex(side, battleSlotIndex, targetIndex);
      dispatchUi({
        type: "set_battle_search",
        updater: (current) => ({
          ...current,
          [side]: current[side].map((value, index) => (index === battleSlotIndex ? "" : value)),
        }),
      });
    }
  };

  const applyRosterEntry = (entry) => {
    applyRosterEntryToSide(entry, searchTargetSide);
    dispatchUi({ type: "set_search", value: "" });
  };

  const clearOpponent = () => {
    setEnemySlots(normalizeTeam());
    dispatchBattleState({ type: "reset_side", side: "enemy" });
    if (selectedSide === "enemy") dispatchUi({ type: "patch", patch: { selectedIndex: 0 } });
  };

  const clearSingleSlot = (side, index) => {
    updateSlot(side, index, createSlot(index));
    if (selectedSide === side && selectedIndex === index) {
      dispatchUi({ type: "patch", patch: { selectedIndex: 0 } });
    }
  };

  const savePreset = () => {
    if (!allySlots.some(slotHasPokemon)) {
      window.alert(t.saveEmpty);
      return;
    }
    const trimmed = presetName.trim() || selectedPreset || getNextPresetName(t.myTeam, presets);
    setPresets((current) =>
      normalizePresets([{ name: trimmed, slots: allySlots, savedAt: Date.now() }, ...current.filter((item) => item.name !== trimmed)])
    );
    dispatchUi({ type: "patch", patch: { selectedPreset: trimmed, presetName: trimmed } });
  };

  const loadPreset = (name) => {
    const preset = presets.find((entry) => entry.name === name);
    if (!preset) return;
    dispatchUi({ type: "patch", patch: { selectedPreset: name, presetName: name } });
    setAllySlots(normalizeTeam(preset.slots));
    selectSlot("ally", 0);
    dispatchUi({ type: "patch", patch: { isPresetManagerOpen: false } });
  };

  const deletePreset = (name) => {
    const target = presets.find((preset) => preset.name === name);
    if (!target) return;

    const confirmed = window.confirm(
      pickLocalizedText(language, {
        ko: `"${target.name}" 저장본을 삭제할까요?`,
        en: `Delete the saved team "${target.name}"?`,
        ja: `保存済みチーム「${target.name}」を削除しますか？`,
      })
    );

    if (!confirmed) return;

    setPresets((current) => current.filter((preset) => preset.name !== name));
    if (selectedPreset === name || presetName.trim() === name) {
      dispatchUi({
        type: "patch",
        patch: {
          selectedPreset: selectedPreset === name ? "" : selectedPreset,
          presetName: presetName.trim() === name ? "" : presetName,
        },
      });
    }
  };

  const activeLimit = battleMode === "single" ? 3 : 4;
  const allyActiveLocked = allySlots.filter((slot) => slot.active).length === activeLimit;
  const enemyActiveLocked = enemySlots.filter((slot) => slot.active).length === activeLimit;
  const allyHasPokemon = allySlots.some(slotHasPokemon);
  const saveTargetName = presetName.trim() || selectedPreset || getNextPresetName(t.myTeam, presets);
  const saveTargetExists = presets.some((preset) => preset.name === saveTargetName);

  const toggleActive = (side, index, checked) => {
    const team = side === "ally" ? allySlots : enemySlots;
    const activeCount = team.filter((slot) => slot.active).length;
    if (checked && !team[index].active && activeCount >= activeLimit) return;
    updateSlot(side, index, { active: checked });
  };

  const isActiveToggleLocked = (side, slot) => {
    if (slot.active) return false;
    return side === "ally" ? allyActiveLocked : enemyActiveLocked;
  };

  const renderActiveToggle = (side, index, slot, className = "") => {
    const locked = isActiveToggleLocked(side, slot);
    return (
      <button
        type="button"
        className={`active-toggle ${slot.active ? "on" : "off"} ${className}`.trim()}
        disabled={locked}
        onClick={(event) => {
          event.stopPropagation();
          toggleActive(side, index, !slot.active);
        }}
      >
        {slot.active ? t.active : t.standby}
      </button>
    );
  };

  const compareRows = useMemo(
    () =>
      buildCompareRows({
        allySlots,
        enemySlots,
        battleState,
        language,
        allyActiveLocked,
        enemyActiveLocked,
      }),
    [allySlots, enemySlots, battleState, allyActiveLocked, enemyActiveLocked, language]
  );

  const compareMax = Math.max(200, ...compareRows.map((row) => row.graph.max), 200);

  useEffect(() => {
    const nextPositions = new Map();

    compareRowRefs.current.forEach((node, id) => {
      if (!node) return;
      nextPositions.set(id, node.getBoundingClientRect());
    });

    previousComparePositions.current.forEach((prevRect, id) => {
      const node = compareRowRefs.current.get(id);
      const nextRect = nextPositions.get(id);
      if (!node || !nextRect) return;

      const deltaY = prevRect.top - nextRect.top;
      if (Math.abs(deltaY) < 1) return;

      node.getAnimations().forEach((animation) => animation.cancel());
      node.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }
      );
    });

    previousComparePositions.current = nextPositions;
  }, [compareRows]);

  const rosterRows = useMemo(
    () =>
      buildRosterRows({
        championsRoster,
        megaOptions: MEGA_OPTIONS,
        language,
      }),
    [language]
  );

  const rosterSearchResults = useMemo(() => {
    const query = normalizeSearchKey(rosterSearch);
    if (!query) return [];
    return rosterRows
      .filter((row) => row.searchTerms.some((term) => normalizeSearchKey(term).includes(query)))
      .slice(0, 10);
  }, [rosterRows, rosterSearch]);

  const rosterMax = Math.max(200, ...rosterRows.map((row) => row.graph.max), 200);

  const battleUnits = useMemo(
    () =>
      buildBattleUnits({
        allySlots,
        enemySlots,
        battleState,
        language,
        createSlot,
      }),
    [allySlots, enemySlots, battleState, language]
  );

  const allyBattleSlot = battleUnits.ally[0]?.slot || createSlot(0);
  const enemyBattleSlot = battleUnits.enemy[0]?.slot || createSlot(0);
  const allyBattleGraph = battleUnits.ally[0]?.graph || null;
  const enemyBattleGraph = battleUnits.enemy[0]?.graph || null;

  const battleMax = Math.max(200, allyBattleGraph?.max || 0, enemyBattleGraph?.max || 0);
  const verdict = allyBattleGraph && enemyBattleGraph ? getVerdict(allyBattleGraph, enemyBattleGraph, t) : null;
  const allyGuaranteedFirst = Boolean(allyBattleGraph && enemyBattleGraph && allyBattleGraph.min > enemyBattleGraph.max);
  const enemyGuaranteedFirst = Boolean(enemyBattleGraph && allyBattleGraph && enemyBattleGraph.min > allyBattleGraph.max);

  const isDoubleBattleReady = battleUnits.ally.every(({ slot }) => slotHasPokemon(slot)) && battleUnits.enemy.every(({ slot }) => slotHasPokemon(slot));
  const doubleBattleEntries = useMemo(
    () =>
      buildDoubleBattleEntries({
        battleUnits,
        language,
        myTeamLabel: t.myTeam,
        opponentTeamLabel: t.opponentTeam,
      }),
    [battleUnits, language, t.myTeam, t.opponentTeam]
  );
  const doubleBattleMax = Math.max(200, ...doubleBattleEntries.map((entry) => entry.graph.max), 200);

  const isDetailSlotVisible = slotHasPokemon(selectedSlot) && !isDetailPanelCleared;
  const selectedGraph = isDetailSlotVisible ? buildGraph(selectedSlot, selectedSlot.baseSpeed, null, language) : null;

  const renderAbilityButtons = (slot, onChange) => {
    if (!hasSpeedAbilityOptions(slot)) {
      const label = getLocalizedOptionLabel(DEFAULT_ABILITY_OPTIONS[0], language);
      return (
        <button type="button" className="active" disabled>
          {label}
        </button>
      );
    }

    return getAbilityOptions(slot).map((option) => (
      <button
        key={option.key}
        type="button"
        className={slot.abilitySetting === option.key ? "active" : ""}
        onClick={() => onChange(option.key)}
      >
        {getLocalizedOptionLabel(option, language)}
      </button>
    ));
  };

  const renderMegaField = (slot, onChange) => {
    const megaChoices = getMegaChoices(slot);
    return (
      <div className="mega-picker-row single">
        <select
          className="mega-select styled-select"
          value={megaChoices.length === 0 ? "" : megaChoices.some((mega) => mega.key === slot.megaChoice) ? slot.megaChoice : slot.megaChoice === "unknown" ? "unknown" : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={megaChoices.length === 0}
        >
          <option value="">{t.noMega}</option>
          {megaChoices.length > 0 && <option value="unknown">{t.unknown}</option>}
          {megaChoices.map((mega) => (
            <option key={mega.key} value={mega.key}>
              {getLocalizedMegaLabel(mega, language)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderBattleCard = (side, battleSlotIndex, title, unit) => {
    const { slot, state, speed, graph } = unit;
    const searchResultsForUnit = battleSearchResults[side][battleSlotIndex];

    return (
      <div key={`${side}-${battleSlotIndex}`} className={`battle-side ${side} ${slotHasPokemon(slot) ? "" : "battle-side-empty"} ${searchResultsForUnit.length > 0 ? "battle-side-searching" : ""}`}>
        <div className="battle-side-head">
          <h3>{title}</h3>
          <select className="styled-select" value={state.index} onChange={(event) => setBattleUnitIndex(side, battleSlotIndex, Number(event.target.value))}>
            {(side === "ally" ? allySlots : enemySlots).map((teamSlot, index) => (
              <option key={`${side}-${battleSlotIndex}-${index}`} value={index}>
                {slotHasPokemon(teamSlot) ? getLocalizedName(teamSlot, language) : `${t.slotEmpty} ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="search-shell battle-search-shell">
          <label className="search-box battle-search-box">
            <span>{t.search}</span>
              <input
              value={battleSearch[side][battleSlotIndex]}
              onChange={(event) =>
                dispatchUi({
                  type: "set_battle_search",
                  updater: (current) => ({
                    ...current,
                    [side]: current[side].map((value, index) => (index === battleSlotIndex ? event.target.value : value)),
                  }),
                })
              }
              placeholder={t.search}
            />
          </label>
          {searchResultsForUnit.length > 0 && (
            <div className="search-popover search-overlay battle-search-popover">
              {searchResultsForUnit.map((entry) => (
                <button
                  key={`battle-${side}-${battleSlotIndex}-${entry.id}`}
                  type="button"
                  className="search-result"
                  onClick={() =>
                    applyRosterEntryToSide(entry, side, {
                      preferredIndex: state.index,
                      syncBattleIndex: true,
                      battleSlotIndex,
                    })
                  }
                >
                  <img src={entry.icon} alt="" className="result-icon" />
                  <span>{getLocalizedName(entry, language)}</span>
                  <em>{t.baseSpeed} {entry.speed}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        {slotHasPokemon(slot) ? (
          <>
            <div className="detail-summary battle-poke-summary">
              <div className="battle-summary-side">
                <div className={`detail-side-badge ${side}`}>{side === "ally" ? t.myTeam : t.opponentTeam}</div>
                {renderActiveToggle(side, state.index, slot)}
              </div>
              <div className={`icon-shell summary-icon-shell ${state.mega ? "mega-on" : ""}`}>
                <img src={getDisplayIcon(slot, state.mega)} alt="" className="slot-icon large" />
              </div>
              <div className="detail-copy">
                <strong>{state.mega && getSelectedMega(slot) ? getLocalizedMegaLabel(getSelectedMega(slot), language) : getLocalizedName(slot, language)}</strong>
                <span>{t.baseSpeed} {speed}</span>
              </div>
              {graph && (
                <div className="detail-range battle-summary-range">
                  <small>{getLocalizedCurrentSpeedLabel(language)}</small>
                  <strong>{formatRange(graph.min, graph.max)}</strong>
                </div>
              )}
            </div>

            <div className="detail-grid battle-detail-grid tidy">
              <div className="field battle-field battle-field-mega">
                <span>{t.mega}</span>
                {renderMegaField(slot, (value) => updateBattleSlot(side, battleSlotIndex, { megaChoice: value }))}
              </div>

              <div className="field battle-field battle-field-points">
                <span>{t.statPoints}</span>
                <div className="inline-input">
                  <input type="number" min="0" max="32" disabled={slot.evUnknown} value={slot.evValue} onChange={(event) => updateBattleSlot(side, battleSlotIndex, { evValue: clampInt(event.target.value, 0, 32) })} />
                  <button type="button" className={`ghost-button ${slot.evUnknown ? "active" : ""}`} onClick={() => updateBattleSlot(side, battleSlotIndex, { evUnknown: !slot.evUnknown })}>
                    {t.unknown}
                  </button>
                </div>
              </div>

              <div className="field span-2 battle-field battle-field-nature">
                <span>{t.nature}</span>
                <div className="segmented compact">
                  {NATURE_OPTIONS.map((option) => (
                    <button key={option.key} type="button" className={slot.nature === option.key ? "active" : ""} onClick={() => updateBattleSlot(side, battleSlotIndex, { nature: option.key })}>
                      {getLocalizedOptionLabel(option, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field span-2 battle-field battle-field-item">
                <span>{t.item}</span>
                <div className="segmented wrap">
                  {Object.entries(ITEMS).map(([key, item]) => (
                    <button key={key} type="button" className={slot.itemSetting === key ? "active" : ""} onClick={() => updateBattleSlot(side, battleSlotIndex, { itemSetting: key })}>
                      {getLocalizedOptionLabel(item, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field span-2 battle-field battle-field-ability">
                <span>{t.ability} <Tooltip label="?" text={getAbilityHelpText(slot, language, t.abilityHelp)} className="inline-help" /></span>
                <div className="segmented wrap">
                  {renderAbilityButtons(slot, (value) => updateBattleSlot(side, battleSlotIndex, { abilitySetting: value }))}
                </div>
              </div>
            </div>

            <div className="battle-action-row">
              <button
                type="button"
                className={`toggle-chip ${state.tailwind ? "on" : ""}`}
                onClick={() => dispatchBattle({ type: "set_side_tailwind", side, value: !state.tailwind })}
              >
                {t.tailwind}
              </button>
              <button type="button" className={`toggle-chip ${state.paralysis ? "on" : ""}`} onClick={() => setBattleUnitState(side, battleSlotIndex, { paralysis: !state.paralysis })}>
                {t.paralysis}
              </button>
              <button type="button" className={`toggle-chip ${state.mega ? "on" : ""}`} disabled={!getSelectedMega(slot)} onClick={() => setBattleUnitState(side, battleSlotIndex, { mega: !state.mega })}>
                {t.mega}
              </button>
              <button type="button" className={`toggle-chip ${state.ability ? "on" : ""}`} disabled={!canActivateBattleAbility(slot, state)} onClick={() => setBattleUnitState(side, battleSlotIndex, { ability: !state.ability })}>
                {t.ability}
              </button>
            </div>

            <div className="battle-rank-row">
              <span>{t.rank}</span>
              <div className="rank-controls">
                <button type="button" onClick={() => setBattleUnitState(side, battleSlotIndex, { rank: Math.max(-6, state.rank - 1) })}>-</button>
                <strong>{state.rank > 0 ? `+${state.rank}` : state.rank}</strong>
                <button type="button" onClick={() => setBattleUnitState(side, battleSlotIndex, { rank: Math.min(6, state.rank + 1) })}>+</button>
              </div>
            </div>

          </>
        ) : (
          <div className="empty-box in-panel">{t.liveBattleEmptyHint}</div>
        )}
      </div>
    );
  };

  const toneClass = theme === "dark" ? "dark" : "light";

  return (
    <div className={`app-shell ${toneClass} lang-${language}`}>
      <div className="app-chrome">
        <header className="app-header">
          <div className="brand">
            <img src="/logo.png" alt="" className="brand-mark" />
            <h1>
              <span className="brand-main">{t.titleMain}</span>
              <span className="brand-sub">{t.titleSub}</span>
            </h1>
            <Tooltip label="?" text={t.titleHelp} className="inline-help" />
          </div>

          <div className="header-controls">
            <div className="header-help">
              <Tooltip label={t.graphHelpLabel} text={t.graphHelp} className="graph-help" />
            </div>

            <div className="segmented compact header-view-switch">
              <button type="button" className={view === "team" ? "active" : ""} onClick={() => setView("team")}>
                {t.teamView}
              </button>
              <button type="button" className={view === "roster" ? "active" : ""} onClick={() => setView("roster")}>
                {t.rosterView}
              </button>
            </div>

            <div className="header-meta-tools">
              <button type="button" className="icon-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
                {theme === "dark" ? "☀" : "●"}
              </button>

              <select className="lang-select styled-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </header>

        {view === "team" ? (
          <main className="workspace team-workspace">
            <div className="left-stack">
              <section className="panel team-panel">
                <div className="panel-head">
                  <div className="heading-with-help team-heading-row">
                    <h2>{t.teamSettings}</h2>
                    <Tooltip label="?" text={t.addHint} className="inline-help" />
                    <div className="segmented compact panel-mode-switch">
                      <button type="button" className={battleMode === "single" ? "active" : ""} onClick={() => setBattleMode("single")}>
                        {t.single}
                      </button>
                      <button type="button" className={battleMode === "double" ? "active" : ""} onClick={() => setBattleMode("double")}>
                        {t.double}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="team-toolbar">
                  <div className="toolbar-group side-group">
                    <div className="segmented compact target-toggle">
                      <button type="button" className={searchTargetSide === "ally" ? "active" : ""} onClick={() => dispatchUi({ type: "patch", patch: { searchTargetSide: "ally" } })}>
                        {t.myTeam}
                      </button>
                      <button type="button" className={searchTargetSide === "enemy" ? "active" : ""} onClick={() => dispatchUi({ type: "patch", patch: { searchTargetSide: "enemy" } })}>
                        {t.opponentTeam}
                      </button>
                    </div>
                  </div>

                  <div className="toolbar-group import-group">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        dispatchUi({
                          type: "patch",
                          patch: { isShowdownImportOpen: true, showdownImportStatus: null },
                        });
                      }}
                    >
                      {t.showdownImport}
                    </button>
                  </div>

                  <div className="search-shell toolbar-search-shell">
                    <label className="search-box">
                      <span>{t.search}</span>
                      <input value={search} onChange={(event) => dispatchUi({ type: "set_search", value: event.target.value })} placeholder={t.search} />
                    </label>
                    {searchResults.length > 0 && (
                      <div className="search-popover search-overlay">
                        {searchResults.map((entry) => (
                          <button key={entry.id} type="button" className="search-result" onClick={() => applyRosterEntry(entry)}>
                            <img src={entry.icon} alt="" className="result-icon" />
                            <span>{getLocalizedName(entry, language)}</span>
                            <em>{t.baseSpeed} {entry.speed}</em>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="setup-row">
                  <div className="team-columns">
                    <TeamCard
                      side="ally"
                      slots={allySlots}
                      title={t.myTeam}
                      activeLabel={t.active}
                      activeLimit={activeLimit}
                      selectedSide={selectedSide}
                      selectedIndex={selectedIndex}
                      getLocalizedName={(slot) => getLocalizedName(slot, language)}
                      renderActiveToggle={(index, slot, className) => renderActiveToggle("ally", index, slot, className)}
                      onManage={() => dispatchUi({ type: "patch", patch: { isPresetManagerOpen: true } })}
                      onClearOpponent={clearOpponent}
                      onSelectSlot={(index) => selectSlot("ally", index)}
                      onSlotDragStart={(index) => dispatchUi({ type: "set_dragging_slot", value: { side: "ally", index } })}
                      onSlotDragOver={(event) => {
                        if (!draggingSlot || draggingSlot.side !== "ally") return;
                        event.preventDefault();
                      }}
                      onSlotDrop={(event, index) => {
                        event.preventDefault();
                        if (!draggingSlot || draggingSlot.side !== "ally" || draggingSlot.index === index) return;
                        updateTeam("ally", (current) => {
                          const next = [...current];
                          const [moved] = next.splice(draggingSlot.index, 1);
                          next.splice(index, 0, moved);
                          return next.map((item, slotIndex) => normalizeSlot(item, slotIndex));
                        });
                        selectSlot("ally", index);
                        dispatchUi({ type: "set_dragging_slot", value: null });
                      }}
                      onSlotDragEnd={() => dispatchUi({ type: "set_dragging_slot", value: null })}
                      onClearSlot={(index) => clearSingleSlot("ally", index)}
                      slotEmptyLabel={t.slotEmpty}
                      manageLabel={t.manage}
                      clearOpponentLabel={t.clearOpponent}
                    />
                    <TeamCard
                      side="enemy"
                      slots={enemySlots}
                      title={t.opponentTeam}
                      activeLabel={t.active}
                      activeLimit={activeLimit}
                      selectedSide={selectedSide}
                      selectedIndex={selectedIndex}
                      getLocalizedName={(slot) => getLocalizedName(slot, language)}
                      renderActiveToggle={(index, slot, className) => renderActiveToggle("enemy", index, slot, className)}
                      onManage={() => dispatchUi({ type: "patch", patch: { isPresetManagerOpen: true } })}
                      onClearOpponent={clearOpponent}
                      onSelectSlot={(index) => selectSlot("enemy", index)}
                      onSlotDragStart={(index) => dispatchUi({ type: "set_dragging_slot", value: { side: "enemy", index } })}
                      onSlotDragOver={(event) => {
                        if (!draggingSlot || draggingSlot.side !== "enemy") return;
                        event.preventDefault();
                      }}
                      onSlotDrop={(event, index) => {
                        event.preventDefault();
                        if (!draggingSlot || draggingSlot.side !== "enemy" || draggingSlot.index === index) return;
                        updateTeam("enemy", (current) => {
                          const next = [...current];
                          const [moved] = next.splice(draggingSlot.index, 1);
                          next.splice(index, 0, moved);
                          return next.map((item, slotIndex) => normalizeSlot(item, slotIndex));
                        });
                        selectSlot("enemy", index);
                        dispatchUi({ type: "set_dragging_slot", value: null });
                      }}
                      onSlotDragEnd={() => dispatchUi({ type: "set_dragging_slot", value: null })}
                      onClearSlot={(index) => clearSingleSlot("enemy", index)}
                      slotEmptyLabel={t.slotEmpty}
                      manageLabel={t.manage}
                      clearOpponentLabel={t.clearOpponent}
                    />
                  </div>

                  <div className={`detail-card ${isDetailSlotVisible ? "" : "detail-empty"}`}>
                    <div className="detail-head">
                      <div>
                        <h3>{t.detailSettings}</h3>
                      </div>
                      <button type="button" className="ghost-button" onClick={() => dispatchUi({ type: "patch", patch: { isDetailPanelCleared: true } })}>
                        {t.clearDetailPanel}
                      </button>
                    </div>

                    {isDetailSlotVisible ? (
                      <>
                        <div className="detail-summary">
                          <div className="battle-summary-side">
                            <div className={`detail-side-badge ${selectedSide}`}>{selectedSide === "ally" ? t.myTeam : t.opponentTeam}</div>
                            {renderActiveToggle(selectedSide, selectedIndex, selectedSlot)}
                          </div>
                          <div className={`icon-shell summary-icon-shell ${getSelectedMega(selectedSlot) ? "can-mega" : ""}`}>
                            <img src={getDisplayIcon(selectedSlot, false)} alt="" className="detail-icon" />
                          </div>
                          <div className="detail-copy">
                            <strong>{getLocalizedName(selectedSlot, language)}</strong>
                            <span>{t.baseSpeed} {selectedSlot.baseSpeed}</span>
                          </div>
                          {selectedGraph && (
                            <div className="detail-range battle-summary-range">
                              <small>{getLocalizedCurrentSpeedLabel(language)}</small>
                              <strong>{formatRange(selectedGraph.min, selectedGraph.max)}</strong>
                            </div>
                          )}
                        </div>

                        <div className="detail-grid tidy">
                          <div className="field">
                            <span>{t.mega}</span>
                            {renderMegaField(selectedSlot, (value) => updateSlot(selectedSide, selectedIndex, { megaChoice: value }))}
                          </div>

                          <div className="field">
                            <span>{t.statPoints}</span>
                            <div className="inline-input">
                              <input
                                type="number"
                                min="0"
                                max="32"
                                disabled={selectedSlot.evUnknown}
                                value={selectedSlot.evValue}
                                onChange={(event) => updateSlot(selectedSide, selectedIndex, { evValue: clampInt(event.target.value, 0, 32) })}
                              />
                              <button type="button" className={`ghost-button ${selectedSlot.evUnknown ? "active" : ""}`} onClick={() => updateSlot(selectedSide, selectedIndex, { evUnknown: !selectedSlot.evUnknown })}>
                                {t.unknown}
                              </button>
                            </div>
                          </div>

                          <div className="field span-2">
                            <span>{t.nature}</span>
                            <div className="segmented">
                              {NATURE_OPTIONS.map((option) => (
                                <button key={option.key} type="button" className={selectedSlot.nature === option.key ? "active" : ""} onClick={() => updateSlot(selectedSide, selectedIndex, { nature: option.key })}>
                                  {getLocalizedOptionLabel(option, language)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="field span-2">
                            <span>{t.item}</span>
                            <div className="segmented wrap">
                              {Object.entries(ITEMS).map(([key, item]) => (
                                <button key={key} type="button" className={selectedSlot.itemSetting === key ? "active" : ""} onClick={() => updateSlot(selectedSide, selectedIndex, { itemSetting: key })}>
                                  {getLocalizedOptionLabel(item, language)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="field span-2">
                            <span>{t.ability} <Tooltip label="?" text={getAbilityHelpText(selectedSlot, language, t.abilityHelp)} className="inline-help" /></span>
                            <div className="segmented wrap">
                              {renderAbilityButtons(selectedSlot, (value) => updateSlot(selectedSide, selectedIndex, { abilitySetting: value }))}
                            </div>
                          </div>
                        </div>

                      </>
                    ) : (
                      <div className="empty-box in-panel">{t.detailEmptyHint}</div>
                    )}
                  </div>
                </div>
              </section>

              <section className="panel battle-panel">
                <div className="panel-head">
                  <div className="heading-with-help">
                    <h2>{t.liveBattle}</h2>
                    <Tooltip label="?" text={t.battleHelp} className="inline-help" />
                  </div>
                </div>

                <div className={`battle-grid ${battleMode === "double" ? "double" : ""}`}>
                  {battleMode === "double"
                    ? ["ally", "enemy"].map((side) => (
                        <div key={side} className={`battle-team-stack ${side}`}>
                          {battleUnits[side].map((unit, battleSlotIndex) =>
                            renderBattleCard(side, battleSlotIndex, `${side === "ally" ? t.myTeam : t.opponentTeam} ${battleSlotIndex + 1}`, unit)
                          )}
                        </div>
                      ))
                    : [renderBattleCard("ally", 0, t.myTeam, battleUnits.ally[0]), renderBattleCard("enemy", 0, t.opponentTeam, battleUnits.enemy[0])]}
                </div>

                {battleMode === "double" ? (
                  <div className={`battle-result ${doubleBattleEntries[0]?.side || "neutral"} ${isDoubleBattleReady ? "" : "battle-result-empty"}`}>
                    {isDoubleBattleReady ? (
                      <>
                        <div className="battle-result-copy">
                          <div className="battle-result-badge">
                            <strong>{t.doubleOrderTitle}</strong>
                            <span>{t.doubleOrderSub}</span>
                          </div>
                        </div>
                        <div className="battle-order-list">
                          {doubleBattleEntries.map((entry, orderIndex) => (
                            <article key={`${entry.side}-${entry.battleSlotIndex}-${entry.label}`} className={`battle-order-row ${entry.side}`}>
                              <div className="battle-order-rank">#{orderIndex + 1}</div>
                              <img src={entry.icon} alt="" className="battle-order-icon" />
                              <div className="battle-order-copy">
                                <div className="battle-order-head">
                                  <div className={`detail-side-badge ${entry.side}`}>{entry.title}</div>
                                  <strong>{entry.label}</strong>
                                </div>
                              </div>
                              <div className="battle-order-graph">
                                <SpeedGraph graph={entry.graph} maxValue={doubleBattleMax} tone={entry.side} compact />
                              </div>
                              <div className="battle-order-range">{formatRange(entry.graph.min, entry.graph.max)}</div>
                            </article>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="empty-box in-panel battle-result-empty-box">{t.battleResultEmptyHint}</div>
                    )}
                  </div>
                ) : (
                  <div className={`battle-result ${verdict?.tone || "neutral"} ${allyBattleGraph && enemyBattleGraph ? "" : "battle-result-empty"}`}>
                    {allyBattleGraph && enemyBattleGraph ? (
                      <>
                        <div className="battle-result-copy">
                          <div className="battle-result-badge">
                            <strong>{verdict?.title}</strong>
                            <span>{verdict?.sub}</span>
                          </div>
                        </div>
                        <div className="battle-result-stage">
                          <div className="battle-result-icon-spot enemy">
                            <img
                              src={getDisplayIcon(enemyBattleSlot, battleState.enemy[0].mega)}
                              alt={getLocalizedName(enemyBattleSlot, language) || t.opponentTeam}
                              className={`battle-result-icon ${enemyGuaranteedFirst ? "is-guaranteed-first" : ""}`}
                            />
                          </div>
                          <div className="battle-result-graphs">
                            <div className="battle-result-graph enemy">
                              <SpeedGraph graph={enemyBattleGraph} maxValue={battleMax} tone="enemy" compact markerValuePlacement="top" />
                            </div>
                            <div className="battle-result-graph ally">
                              <SpeedGraph graph={allyBattleGraph} maxValue={battleMax} tone="ally" compact markerValuePlacement="bottom" />
                            </div>
                          </div>
                          <div className="battle-result-icon-spot ally">
                            <img
                              src={getDisplayIcon(allyBattleSlot, battleState.ally[0].mega)}
                              alt={getLocalizedName(allyBattleSlot, language) || t.myTeam}
                              className={`battle-result-icon ${allyGuaranteedFirst ? "is-guaranteed-first" : ""}`}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="empty-box in-panel battle-result-empty-box">{t.battleResultEmptyHint}</div>
                    )}
                  </div>
                )}
              </section>
            </div>

            <section className="panel compare-panel">
              <div className="panel-head">
                <div className="heading-with-help">
                  <h2>{t.speedCompare}</h2>
                  <Tooltip label="?" text={t.speedCompareHelp} className="inline-help" />
                </div>
              </div>
              <div className="compare-list">
                {compareRows.length ? (
                  compareRows.map((row) => (
                    <article
                      key={row.id}
                      ref={(node) => {
                        if (node) {
                          compareRowRefs.current.set(row.id, node);
                        } else {
                          compareRowRefs.current.delete(row.id);
                        }
                      }}
                      className={`compare-row ${row.side} ${row.selected ? "selected" : ""} ${row.deemphasized ? "inactive" : ""}`}
                    >
                      <div className="compare-meta">
                        <div className={`icon-shell ${row.side}`}>
                          <img src={row.icon} alt="" className="slot-icon" />
                        </div>
                        <div className="compare-copy">
                          <div className="compare-name-line">
                            <strong>{row.label}</strong>
                            {row.active && <span className="mini-chip compare-active-chip on">{t.active}</span>}
                          </div>
                          <span>{t.baseSpeed} {row.baseSpeed}</span>
                        </div>
                      </div>
                      <div className="compare-graph-block">
                        <SpeedGraph graph={row.graph} maxValue={compareMax} tone={row.side} />
                        <div className="compare-range">{formatRange(row.graph.min, row.graph.max)}</div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-box">{t.noData}</div>
                )}
              </div>
            </section>
          </main>
        ) : (
          <main className="workspace roster-workspace">
            <section className="panel roster-panel">
              <div className="panel-head">
                <div className="heading-with-help">
                  <h2>{t.allPokemon}</h2>
                  <Tooltip label="?" text={t.rosterHelp} className="inline-help" />
                </div>
                <div className="search-shell roster-search-shell">
                  <form
                    className="inline-input roster-search"
                    onSubmit={(event) => {
                      event.preventDefault();
                      jumpToRosterRow(rosterSearchResults[0] || null);
                    }}
                  >
                    <input
                      type="search"
                      value={rosterSearch}
                      onChange={(event) => {
                        dispatchUi({
                          type: "set_roster_search",
                          value: event.target.value,
                          clearStatus: Boolean(rosterSearchStatus),
                        });
                      }}
                      placeholder={t.rosterSearchPlaceholder}
                      aria-label={t.rosterSearchPlaceholder}
                    />
                    <button type="submit" className="ghost-button" disabled={!rosterSearch.trim()}>
                      {t.rosterSearchAction}
                    </button>
                  </form>
                  {rosterSearchResults.length > 0 && (
                    <div className="search-popover search-overlay roster-search-popover">
                      {rosterSearchResults.map((row) => (
                        <button
                          key={`roster-search-${row.id}`}
                          type="button"
                          className="search-result"
                          onClick={() => jumpToRosterRow(row)}
                        >
                          <img src={row.icon} alt="" className="result-icon" />
                          <span>{row.label}</span>
                          <em>{t.baseSpeed} {row.baseSpeed}</em>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {rosterSearchStatus && <p className="roster-search-status">{rosterSearchStatus}</p>}
              <div className="compare-list roster">
                {rosterRows.map((row) => (
                  <article
                    key={row.id}
                    ref={(node) => {
                      if (node) {
                        rosterRowRefs.current.set(row.id, node);
                      } else {
                        rosterRowRefs.current.delete(row.id);
                      }
                    }}
                    className={`compare-row roster-row ${row.isMega ? "mega" : ""} ${highlightedRosterRowId === row.id ? "jump-highlight" : ""}`}
                  >
                    <div className="compare-meta">
                      <div className="icon-shell">
                        <img src={row.icon} alt="" className="slot-icon" />
                      </div>
                      <div>
                        <div className="compare-name-line">
                          <strong>{row.label}</strong>
                          {row.isMega && <span className="mini-chip mega">Mega</span>}
                        </div>
                        <span>{t.baseSpeed} {row.baseSpeed}</span>
                      </div>
                    </div>
                    <div className="compare-graph-block">
                      <SpeedGraph graph={row.graph} maxValue={rosterMax} tone={row.isMega ? "mega" : "ally"} />
                      <div className="compare-range">{formatRange(row.graph.min, row.graph.max)}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>
        )}

        {showScrollTop && (
          <button
            type="button"
            className="scroll-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t.scrollTop}
          >
            <span aria-hidden="true">↑</span>
            <span>{t.scrollTop}</span>
          </button>
        )}

        <PresetManagerModal
          isOpen={isPresetManagerOpen}
          t={t}
          renderHelpTooltip={() => <Tooltip label="?" text={t.saveHelp} className="inline-help" />}
          onClose={() => dispatchUi({ type: "patch", patch: { isPresetManagerOpen: false } })}
          presetName={presetName}
          onPresetNameChange={(value) => dispatchUi({ type: "set_preset_name", value })}
          selectedPreset={selectedPreset}
          placeholderName={selectedPreset || getNextPresetName(t.myTeam, presets)}
          onSave={savePreset}
          allyHasPokemon={allyHasPokemon}
          saveTargetExists={saveTargetExists}
          presets={presets}
          savedAtFormatter={savedAtFormatter}
          onSelectPreset={(name) => {
            dispatchUi({ type: "patch", patch: { selectedPreset: name, presetName: name } });
          }}
          onLoadPreset={loadPreset}
          onDeletePreset={deletePreset}
        />

        <ShowdownImportModal
          isOpen={isShowdownImportOpen}
          t={t}
          renderHelpTooltip={() => <Tooltip label="?" text={t.showdownImportHelp} className="inline-help" />}
          onClose={() => dispatchUi({ type: "patch", patch: { isShowdownImportOpen: false } })}
          searchTargetSide={searchTargetSide}
          showdownImportText={showdownImportText}
          onShowdownImportTextChange={(value) => dispatchUi({ type: "set_showdown_import_text", value })}
          showdownImportStatus={showdownImportStatus}
          onClearText={() => dispatchUi({ type: "set_showdown_import_text", value: "" })}
          onImport={importShowdownTeam}
        />

        <footer className="app-footer">{t.footer}</footer>
      </div>

      <Analytics />
    </div>
    
  );
}

export default App;
