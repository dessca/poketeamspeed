import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useRef } from "react";
import { championsRoster, MEGA_OPTIONS } from "./data/championsRoster";
import megaFroslassArt from "../image/Mega_Froslass.webp";
import { Analytics } from '@vercel/analytics/react';

const ROSTER_BY_ID = new Map(championsRoster.map((entry) => [entry.id, entry]));
const ROSTER_BY_NAME = new Map(championsRoster.map((entry) => [entry.displayName, entry]));

const STORAGE = {
  theme: "poke-team-speed:theme",
  language: "poke-team-speed:language",
  view: "poke-team-speed:view",
  battleMode: "poke-team-speed:battle-mode",
  ally: "poke-team-speed:ally",
  enemy: "poke-team-speed:enemy",
  presets: "poke-team-speed:presets",
};

const TEXT = {
  ko: {
    titleMain: "SCARF",
    titleSub: "Pokémon Speed Matchups",
    titleHelp: "포켓몬 챔피언스 기준으로 양 팀 포켓몬들의 스피드와 현재 대면 선공을 빠르게 파악하는 도구입니다.",
    graphHelpLabel: "그래프 보는 법 ?",
    graphHelp:
      "점 또는 짧은 막대는 현재 확인된 스피드입니다. 능력 포인트를 모르면 0~32 범위가 짧은 막대로 표시됩니다.\n그 위 막대들은 성격, 구애스카프, 스피드 특성, 스카프+특성 가능 범위를 단계별로 보여줍니다.\n같은 막대 안의 서로 다른 질감은 성격 x0.9 / x1.0 / x1.1 경우를 구분합니다.",
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
    battleMode: "배틀 모드",
    single: "싱글",
    double: "더블",
    save: "저장",
    overwrite: "덮어쓰기",
    load: "불러오기",
    delete: "삭제",
    manage: "팀 관리",
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
    footer: "문의: teamscarf@proton.me",
  },
  en: {
    titleMain: "SCARF",
    titleSub: "Pokémon Speed Matchups",
    titleHelp: "A quick tool for Pokémon Champions that lets you compare team-wide Speed ranges and live turn order at a glance.",
    graphHelpLabel: "How to read the graph?",
    graphHelp:
      "The dot or short bar shows the currently confirmed Speed. If stat points are unknown, it becomes a short 0-32 range.\nBars above it add possible ranges step by step for nature, Choice Scarf, Speed abilities, and Scarf + ability.\nDifferent textures inside the same layer separate nature x0.9 / x1.0 / x1.1 cases.",
    rosterHelp: "Shows each Pokémon's possible Speed range as layered bars for points, nature, item, and ability.",
    teamView: "Team Compare",
    rosterView: "All Pokémon",
    myTeam: "My Team",
    opponentTeam: "Opponent Team",
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
    battleMode: "Battle Mode",
    single: "Single",
    double: "Double",
    save: "Save",
    overwrite: "Overwrite",
    load: "Load",
    delete: "Delete",
    manage: "Manage",
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
    sureFirstOpp: "Opponent Always Moves First",
    likelyFirstMy: "My Team Favored",
    likelyFirstOpp: "Opponent Favored",
    tieExact: "Speed Tie",
    tiePossible: "Possible Speed Tie",
    mixed: "Too Close to Call",
    tieExactSub: "If both exact Speed values match, move order is random each turn.",
    tiePossibleSub: "The remaining variables can still produce a Speed tie.",
    likelySubMy: "Based on the known settings, my team is more likely to move first.",
    likelySubOpp: "Based on the known settings, the opponent is more likely to move first.",
    sureSubMy: "The opponent cannot outspeed within the current range.",
    sureSubOpp: "My team cannot outspeed within the current range.",
    mixedSub: "There are still too many overlapping variables to call it cleanly.",
    footer: "Contact: teamscarf@proton.me",
  },
};

const NATURES = {
  slow: 0.9,
  neutral: 1,
  fast: 1.1,
  unknown: 1,
};

const NATURE_OPTIONS = [
  { key: "slow", labelKo: "×0.9", labelEn: "×0.9", values: [0.9] },
  { key: "neutral", labelKo: "×1.0", labelEn: "×1.0", values: [1] },
  { key: "fast", labelKo: "×1.1", labelEn: "×1.1", values: [1.1] },
  { key: "unknown", labelKo: "모름", labelEn: "Unknown", values: [0.9, 1, 1.1] },
];

const ITEMS = {
  none: { labelKo: "없음", labelEn: "None", values: [1], point: 1 },
  scarf: { labelKo: "구애스카프 ×1.5", labelEn: "Scarf ×1.5", values: [1.5], point: 1.5 },
  unknown: { labelKo: "모름", labelEn: "Unknown", values: [1, 1.5], point: 1 },
};

const ABILITY_OPTIONS_BY_NAME = {
  이상해꽃: [
    { key: "none", labelKo: "심록", labelEn: "Overgrow", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight." },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1, 2] },
  ],
  샤크니아: [
    { key: "none", labelKo: "거친피부", labelEn: "Rough Skin", multiplier: 1 },
    {
      key: "speed-boost",
      labelKo: "가속",
      labelEn: "Speed Boost",
      multiplier: 1.5,
      helpKo: "턴 종료마다 스피드가 1랭크 오르며, 이 도구에서는 1랭크 기준 x1.5로 계산합니다.",
      helpEn: "Raises Speed by one stage at the end of each turn. This tool models it as x1.5.",
    },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1, 1.5] },
  ],
  몰드류: [
    { key: "none", labelKo: "틀깨기", labelEn: "Mold Breaker", multiplier: 1 },
    { key: "sand-rush", labelKo: "모래헤치기", labelEn: "Sand Rush", multiplier: 2, helpKo: "날씨가 모래바람일 때 스피드 x2", helpEn: "Speed doubles during a sandstorm." },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1, 2] },
  ],
  엘풍: [
    { key: "none", labelKo: "짓궂은마음", labelEn: "Prankster", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight." },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1, 2] },
  ],
  스코빌런: [
    { key: "none", labelKo: "불면", labelEn: "Insomnia", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight." },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1, 2] },
  ],
};

const MEGA_SPEED_ABILITY_BLOCKED_LABELS = new Set(["메가이상해꽃", "메가샤크니아"]);

const DEFAULT_ABILITY_OPTIONS = [
  { key: "none", labelKo: "보정 없음", labelEn: "No boost", multiplier: 1 },
  { key: "unknown", labelKo: "모름", labelEn: "Unknown", multiplier: 1, values: [1] },
];

const CANONICAL_MEGA_ART = {
  메가이상해꽃: "https://img.pokemondb.net/sprites/home/normal/venusaur-mega.png",
  메가리자몽X: "https://img.pokemondb.net/sprites/home/normal/charizard-mega-x.png",
  메가리자몽Y: "https://img.pokemondb.net/sprites/home/normal/charizard-mega-y.png",
  메가거북왕: "https://img.pokemondb.net/sprites/home/normal/blastoise-mega.png",
  메가독침붕: "https://img.pokemondb.net/sprites/home/normal/beedrill-mega.png",
  메가피죤투: "https://img.pokemondb.net/sprites/home/normal/pidgeot-mega.png",
  메가후딘: "https://img.pokemondb.net/sprites/home/normal/alakazam-mega.png",
  메가야도란: "https://img.pokemondb.net/sprites/home/normal/slowbro-mega.png",
  메가팬텀: "https://img.pokemondb.net/sprites/home/normal/gengar-mega.png",
  메가캥카: "https://img.pokemondb.net/sprites/home/normal/kangaskhan-mega.png",
  메가쁘사이저: "https://img.pokemondb.net/sprites/home/normal/pinsir-mega.png",
  메가갸라도스: "https://img.pokemondb.net/sprites/home/normal/gyarados-mega.png",
  메가프테라: "https://img.pokemondb.net/sprites/home/normal/aerodactyl-mega.png",
  메가전룡: "https://img.pokemondb.net/sprites/home/normal/ampharos-mega.png",
  메가강철톤: "https://img.pokemondb.net/sprites/home/normal/steelix-mega.png",
  메가핫삼: "https://img.pokemondb.net/sprites/home/normal/scizor-mega.png",
  메가헤라크로스: "https://img.pokemondb.net/sprites/home/normal/heracross-mega.png",
  메가헬가: "https://img.pokemondb.net/sprites/home/normal/houndoom-mega.png",
  메가마기라스: "https://img.pokemondb.net/sprites/home/normal/tyranitar-mega.png",
  메가가디안: "https://img.pokemondb.net/sprites/home/normal/gardevoir-mega.png",
  메가깜까미: "https://img.pokemondb.net/sprites/home/normal/sableye-mega.png",
  메가보스로라: "https://img.pokemondb.net/sprites/home/normal/aggron-mega.png",
  메가요가램: "https://img.pokemondb.net/sprites/home/normal/medicham-mega.png",
  메가썬더볼트: "https://img.pokemondb.net/sprites/home/normal/manectric-mega.png",
  메가샤크니아: "https://img.pokemondb.net/sprites/home/normal/sharpedo-mega.png",
  메가폭타: "https://img.pokemondb.net/sprites/home/normal/camerupt-mega.png",
  메가파비코리: "https://img.pokemondb.net/sprites/home/normal/altaria-mega.png",
  메가다크펫: "https://img.pokemondb.net/sprites/home/normal/banette-mega.png",
  메가앱솔: "https://img.pokemondb.net/sprites/home/normal/absol-mega.png",
  메가얼음귀신: "https://img.pokemondb.net/sprites/home/normal/glalie-mega.png",
  메가이어롭: "https://img.pokemondb.net/sprites/home/normal/lopunny-mega.png",
  메가한카리아스: "https://img.pokemondb.net/sprites/home/normal/garchomp-mega.png",
  메가루카리오: "https://img.pokemondb.net/sprites/home/normal/lucario-mega.png",
  메가눈설왕: "https://img.pokemondb.net/sprites/home/normal/abomasnow-mega.png",
  메가엘레이드: "https://img.pokemondb.net/sprites/home/normal/gallade-mega.png",
  메가눈여아: megaFroslassArt,
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
  if (savedLanguage === "ko" || savedLanguage === "en") return savedLanguage;

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

    return isKoreanContext ? "ko" : "en";
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
  return {
    ...createSlot(index),
    ...raw,
    slotId: `slot-${index}`,
    rosterId: canonical?.id ?? raw?.rosterId ?? "",
    dexNo: canonical?.dexNo ?? raw?.dexNo ?? null,
    formKey: canonical?.formKey ?? raw?.formKey ?? "base",
    name,
    nameEn,
    baseSpeed: clampInt(canonical?.speed ?? raw?.baseSpeed ?? 0, 0, 255),
    icon: canonical?.icon ?? raw?.icon ?? "",
    megaChoice: normalizeMegaChoice(name, raw?.megaChoice ?? ""),
    evValue: clampInt(raw?.evValue ?? 32, 0, 32),
  };
}

function normalizeTeam(raw) {
  return Array.from({ length: 6 }, (_, index) => normalizeSlot(raw?.[index], index));
}

function getLocalizedName(entity, language) {
  if (!entity) return "";
  const koName = entity.displayName ?? entity.name ?? "";
  const enName = entity.displayNameEn ?? entity.nameEn ?? koName;
  return language === "en" ? enName || koName : koName;
}

function getLocalizedMegaLabel(mega, language) {
  if (!mega) return "";
  return language === "en" ? mega.labelEn || mega.label : mega.label;
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

function slotHasPokemon(slot) {
  return Boolean(slot.name && slot.baseSpeed);
}

function level50Speed(baseSpeed, evPoints, natureFactor) {
  const raw = Math.floor(((baseSpeed * 2 + 31 + evPoints) * 50) / 100 + 5);
  return Math.floor(raw * natureFactor);
}

function stageFactor(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

function applySpeed(value, factors) {
  return factors.reduce((acc, factor) => Math.floor(acc * factor), value);
}

function dedupe(values) {
  return [...new Set(values.filter((value) => Number.isFinite(value)).map((value) => Math.round(value)))].sort((a, b) => a - b);
}

function getItemLabelFromFactor(factor, language = "ko") {
  if (factor === 1.5) return language === "en" ? "Choice Scarf" : "구애스카프";
  return language === "en" ? "No Choice Scarf applied" : "구애스카프 미착용";
}

function getAbilityLabelFromFactor(factor, slot, language = "ko") {
  if (factor <= 1) return language === "en" ? "No Speed ability applied" : "특성 미적용";
  const matched = getAbilityOptions(slot).find((option) => option.multiplier === factor && option.key !== "unknown");
  if (matched) return language === "en" ? `Ability ${matched.labelEn || matched.labelKo}` : `특성 ${matched.labelKo || matched.labelEn}`;
  return language === "en" ? "Ability activated" : "특성 발동";
}

function getNatureLabelFromFactor(factor, language = "ko") {
  if (factor === 0.9) return language === "en" ? "Nature x0.9" : "성격 x0.9";
  if (factor === 1.1) return language === "en" ? "Nature x1.1" : "성격 x1.1";
  return language === "en" ? "Nature x1.0" : "성격 x1.0";
}

function summarizeTooltipLines(lines, language = "ko", maxLines = 4) {
  const unique = [...new Set(lines.filter(Boolean))];
  if (unique.length <= maxLines) return unique;
  return [...unique.slice(0, maxLines), language === "en" ? `+${unique.length - maxLines} more cases` : `외 ${unique.length - maxLines}가지 경우`];
}

function summarizeMarkerMap(markerMap) {
  const entries = [...markerMap.entries()]
    .map(([value, labels]) => ({
      value: Number(value),
      labels: [...labels],
    }))
    .sort((a, b) => a.value - b.value);

  if (entries.length <= 12) return entries;

  const picks = [0, Math.floor(entries.length * 0.25), Math.floor(entries.length * 0.5), Math.floor(entries.length * 0.75), entries.length - 1];
  return [...new Map(picks.map((index) => [entries[index].value, entries[index]])).values()];
}

function formatExactValueSummary(slot, baseSpeed, ev, natureFactor, itemFactor, abilityFactor, battleState = null, language = "ko") {
  const baseStat = level50Speed(baseSpeed, ev, natureFactor);
  const labels = [
    language === "en" ? `Points ${ev} · ${getNatureLabelFromFactor(natureFactor, language)}` : `포인트 ${ev} · ${getNatureLabelFromFactor(natureFactor, language)}`,
    language === "en" ? `Base Speed stat ${baseStat}` : `기본 실수치 ${baseStat}`,
  ];

  if (itemFactor !== 1) labels.push(getItemLabelFromFactor(itemFactor, language));
  if (abilityFactor > 1) labels.push(getAbilityLabelFromFactor(abilityFactor, slot, language));

  if (battleState) {
    if (battleState.mega) labels.push(language === "en" ? "Mega Evolution" : "메가진화");
    if (battleState.tailwind) labels.push(language === "en" ? "Tailwind" : "순풍");
    if (battleState.paralysis) labels.push(language === "en" ? "Paralysis" : "마비");
    if (battleState.rank !== 0) labels.push(language === "en" ? `Stage ${battleState.rank}` : `랭크 ${battleState.rank}`);
  }

  return labels.join(" · ");
}

function formatPointSummary(slot, baseSpeed, battleState, language = "ko") {
  const item = ITEMS[slot.itemSetting] || ITEMS.none;
  const pointItemFactor = slot.itemSetting === "unknown" ? 1 : item.point;
  const pointAbilityFactor = getPointAbilityFactor(slot, battleState);
  const itemLabel = getItemLabelFromFactor(pointItemFactor, language);
  const abilityLabel = getAbilityLabelFromFactor(pointAbilityFactor, slot, language);
  const battleLabels = [];
  if (battleState) {
    if (battleState.mega) battleLabels.push(language === "en" ? "Mega Evolution" : "메가진화");
    if (battleState.ability && canActivateBattleAbility(slot, battleState)) battleLabels.push(language === "en" ? "Ability active" : "특성 발동");
    if (battleState.tailwind) battleLabels.push(language === "en" ? "Tailwind" : "순풍");
    if (battleState.paralysis) battleLabels.push(language === "en" ? "Paralysis" : "마비");
    if (battleState.rank !== 0) battleLabels.push(language === "en" ? `Stage ${battleState.rank}` : `랭크 ${battleState.rank}`);
  }

  return [
    `${itemLabel} / ${abilityLabel}`,
    language === "en"
      ? `Unboosted ${level50Speed(baseSpeed, 0, 1)} · Neutral ${level50Speed(baseSpeed, 32, 1)} · Max ${level50Speed(baseSpeed, 32, 1.1)}`
      : `무보정 ${level50Speed(baseSpeed, 0, 1)} · 준속 ${level50Speed(baseSpeed, 32, 1)} · 최속 ${level50Speed(baseSpeed, 32, 1.1)}`,
    battleLabels.length ? battleLabels.join(", ") : language === "en" ? "Currently confirmed range" : "현재 확정 구간",
  ];
}

function formatPointRangeSummary(slot, baseSpeed, battleState, language = "ko") {
  const pointSummary = formatPointSummary(slot, baseSpeed, battleState, language);
  return summarizeTooltipLines(pointSummary, language);
}

function getBattleSummaryLabels(slot, battleState, abilityFactor, language = "ko") {
  if (!battleState) return [];

  const labels = [];
  if (battleState.mega) labels.push(language === "en" ? "Mega Evolution" : "메가진화");
  if (battleState.ability && abilityFactor > 1) {
    labels.push(language === "en" ? "Ability active" : "특성 발동");
  }
  if (battleState.tailwind) labels.push(language === "en" ? "Tailwind" : "순풍");
  if (battleState.paralysis) labels.push(language === "en" ? "Paralysis" : "마비");
  if (battleState.rank !== 0) labels.push(language === "en" ? `Stage ${battleState.rank}` : `랭크 ${battleState.rank}`);
  return labels;
}

function getNatureBranchTone(natureFactor) {
  if (natureFactor === 0.9) return "slow";
  if (natureFactor === 1.1) return "fast";
  return "neutral";
}

function getNatureBranchRenderPriority(tone) {
  if (tone === "neutral") return 2;
  if (tone === "fast") return 1;
  return 0;
}

function getGraphSegmentRenderPriority(segment) {
  if (segment.segmentKind === "point" || segment.segmentKind === "point-range") return 100;
  if (segment.segmentKind === "nature") return 40 + getNatureBranchRenderPriority(segment.tone || "neutral");
  if (segment.segmentKind === "item" || segment.segmentKind === "ability" || segment.segmentKind === "both") {
    return 20 + getNatureBranchRenderPriority(segment.tone || "neutral");
  }
  return 0;
}

function countKnownUnknowns(flags) {
  return Object.values(flags).filter(Boolean).length;
}

function getPointUncertaintyCount(slot) {
  return countKnownUnknowns({
    points: slot.evUnknown,
  });
}

function getLayerUncertaintyCount(slot, kind) {
  return countKnownUnknowns({
    points: slot.evUnknown,
    nature: kind === "nature" || ((kind === "item" || kind === "ability" || kind === "both") && slot.nature === "unknown"),
    item: (kind === "item" || kind === "both") && slot.itemSetting === "unknown",
    ability: (kind === "ability" || kind === "both") && slot.abilitySetting === "unknown",
  });
}

function getGraphPossibilityPenalty(segmentKind, tone = "neutral") {
  if (segmentKind === "point" || segmentKind === "point-range") return 0;
  if (segmentKind === "nature") return tone === "neutral" ? 1 : 2;
  if (segmentKind === "item") return tone === "neutral" ? 2 : 3;
  if (segmentKind === "ability") return tone === "neutral" ? 3 : 4;
  if (segmentKind === "both") return tone === "neutral" ? 5 : 6;
  return 0;
}

function getGraphBarHeight(uncertaintyCount, segmentKind, tone = "neutral") {
  const certaintyHeight = [20, 17, 14, 11, 9][Math.min(uncertaintyCount, 4)];
  const possibilityPenalty = getGraphPossibilityPenalty(segmentKind, tone);
  return Math.max(6, certaintyHeight - possibilityPenalty);
}

function buildRangeBranches(baseSpeed, evValues, natureValues, itemFactor, abilityFactor, battleFactors) {
  const branches = natureValues
    .map((natureFactor) => {
      const values = dedupe(
        evValues.map((ev) => applySpeed(level50Speed(baseSpeed, ev, natureFactor), [itemFactor, abilityFactor, ...battleFactors]))
      );

      if (!values.length) return null;

      return {
        key: String(natureFactor),
        natureFactor,
        tone: getNatureBranchTone(natureFactor),
        min: values[0],
        max: values[values.length - 1],
      };
    })
    .filter(Boolean)
    .sort((a, b) => getNatureBranchRenderPriority(a.tone) - getNatureBranchRenderPriority(b.tone));

  if (!branches.length) return null;

  return {
    branches,
    min: Math.min(...branches.map((branch) => branch.min)),
    max: Math.max(...branches.map((branch) => branch.max)),
  };
}

function formatLayerSummary(title, slot, itemFactor, abilityFactor, branches, battleState, language = "ko") {
  const natureLine = branches
    .map((branch) => `${getNatureLabelFromFactor(branch.natureFactor, language)} ${formatRange(branch.min, branch.max)}`)
    .join(language === "en" ? " | " : " · ");

  const lines = [
    title,
    `${getItemLabelFromFactor(itemFactor, language)} / ${getAbilityLabelFromFactor(abilityFactor, slot, language)}`,
    natureLine,
  ];

  const battleLabels = getBattleSummaryLabels(slot, battleState, abilityFactor, language);
  if (battleLabels.length) lines.push(battleLabels.join(", "));

  return summarizeTooltipLines(lines, language);
}

function createGraphLayer({
  key,
  titleKo,
  titleEn,
  slot,
  baseSpeed,
  evValues,
  natureValues,
  itemFactor,
  abilityFactor,
  battleFactors,
  battleState,
  kind,
  language,
}) {
  const range = buildRangeBranches(baseSpeed, evValues, natureValues, itemFactor, abilityFactor, battleFactors);
  if (!range) return null;

  return {
    key,
    kind,
    uncertaintyCount: getLayerUncertaintyCount(slot, kind),
    min: range.min,
    max: range.max,
    branches: range.branches,
    tooltip: formatLayerSummary(language === "en" ? titleEn : titleKo, slot, itemFactor, abilityFactor, range.branches, battleState, language),
  };
}

function getPotentialAbilityFactors(slot, battleState = null) {
  const selectedAbility = getSelectedAbility(slot);
  const boostedFactors = [...new Set(getAbilityValues(slot).filter((value) => value > 1))];

  if (!boostedFactors.length) return [];
  if (slot.abilitySetting !== "unknown") {
    if (selectedAbility.multiplier <= 1) return [];
    return [selectedAbility.multiplier];
  }

  return boostedFactors;
}

function getMegaChoices(slot) {
  return slot.name ? MEGA_OPTIONS[slot.name] || [] : [];
}

function getCompareMegaChoices(slot) {
  const choices = getMegaChoices(slot);
  if (slot.megaChoice === "") return [];
  if (slot.megaChoice === "unknown") return choices;
  return choices.filter((option) => option.key === slot.megaChoice);
}

function getSelectedMega(slot) {
  const options = getMegaChoices(slot);
  if (slot.megaChoice === "unknown") return null;
  return options.find((option) => option.key === slot.megaChoice) || null;
}

function getAbilityOptions(slot) {
  return ABILITY_OPTIONS_BY_NAME[slot.name] || DEFAULT_ABILITY_OPTIONS;
}

function hasSpeedAbilityOptions(slot) {
  return Boolean(ABILITY_OPTIONS_BY_NAME[slot.name]);
}

function getSelectedAbility(slot) {
  const options = getAbilityOptions(slot);
  return options.find((option) => option.key === slot.abilitySetting) || options[0];
}

function getAbilityValues(slot) {
  const selected = getSelectedAbility(slot);
  return selected.values || [selected.multiplier];
}

function megaBlocksSpeedAbility(slot, battleState = null) {
  if (!battleState?.mega) return false;
  const mega = getSelectedMega(slot);
  return Boolean(mega && MEGA_SPEED_ABILITY_BLOCKED_LABELS.has(mega.label));
}

function canActivateBattleAbility(slot, battleState = null) {
  const selected = getSelectedAbility(slot);
  return selected.multiplier > 1 && !megaBlocksSpeedAbility(slot, battleState);
}

function getPointAbilityFactor(slot, battleState = null) {
  const selected = getSelectedAbility(slot);

  if (!battleState) {
    return slot.abilitySetting === "unknown" ? 1 : selected.multiplier;
  }

  if (slot.abilitySetting === "unknown") return 1;
  if (!canActivateBattleAbility(slot, battleState)) return 1;
  return battleState.ability ? selected.multiplier : 1;
}

function getMarkerAbilityValues(slot, battleState = null) {
  const selected = getSelectedAbility(slot);

  if (!battleState) {
    return slot.abilitySetting === "unknown" ? getAbilityValues(slot) : [selected.multiplier];
  }

  if (!canActivateBattleAbility(slot, battleState)) return [1];

  if (slot.abilitySetting === "unknown") {
    const boostedValues = getAbilityValues(slot).filter((value) => value > 1);
    return battleState.ability ? boostedValues : [1, ...boostedValues];
  }

  return [battleState.ability ? selected.multiplier : 1];
}

function getAbilityHelpText(slot, language, fallbackText) {
  const selected = getSelectedAbility(slot);
  const helpText = language === "ko" ? selected.helpKo : selected.helpEn;
  return helpText || fallbackText;
}

function getDisplayIcon(slot, megaActive = false) {
  if (!megaActive) return slot.icon;
  const mega = getSelectedMega(slot);
  if (!mega) return slot.icon;
  return CANONICAL_MEGA_ART[mega.label] || slot.icon;
}

function buildGraph(slot, baseSpeed, battleState = null, language = "ko") {
  const selectedNature = NATURE_OPTIONS.find((option) => option.key === slot.nature) || NATURE_OPTIONS[1];
  const pointNatureValues = slot.nature === "unknown" ? [1] : selectedNature.values;
  const rangeNatureValues = slot.nature === "unknown" ? [0.9, 1, 1.1] : selectedNature.values;
  const item = ITEMS[slot.itemSetting] || ITEMS.none;
  const evValues = slot.evUnknown ? [0, 32] : [slot.evValue];
  const pointEvValues = slot.evUnknown ? [0, 32] : [slot.evValue];

  const battleFactors = [];
  if (battleState) {
    if (battleState.tailwind) battleFactors.push(2);
    if (battleState.paralysis) battleFactors.push(0.5);
    battleFactors.push(stageFactor(battleState.rank));
  }

  const pointItemFactor = slot.itemSetting === "unknown" ? 1 : item.point;
  const pointAbilityFactor = getPointAbilityFactor(slot, battleState);

  const pointValues = [];

  pointEvValues.forEach((ev) => {
    pointNatureValues.forEach((natureFactor) => {
      pointValues.push(applySpeed(level50Speed(baseSpeed, ev, natureFactor), [pointItemFactor, pointAbilityFactor, ...battleFactors]));
    });
  });

  const pointSorted = dedupe(pointValues);
  const pointMin = pointSorted[0] ?? 0;
  const pointMax = pointSorted[pointSorted.length - 1] ?? pointMin;
  const point = pointSorted[Math.floor(pointSorted.length / 2)] ?? 0;
  const markerMap = new Map();
  const layers = [];

  const markerNatureValues = slot.nature === "unknown" ? [0.9, 1, 1.1] : selectedNature.values;
  const markerItemValues = slot.itemSetting === "unknown" ? item.values : [item.point];
  const markerAbilityValues = getMarkerAbilityValues(slot, battleState);

  pointEvValues.forEach((ev) => {
    markerNatureValues.forEach((natureFactor) => {
      const stat = level50Speed(baseSpeed, ev, natureFactor);
      markerItemValues.forEach((itemFactor) => {
        markerAbilityValues.forEach((abilityFactor) => {
          const markerValue = applySpeed(stat, [itemFactor, abilityFactor, ...battleFactors]);
          const existing = markerMap.get(markerValue) || new Set();
          existing.add(formatExactValueSummary(slot, baseSpeed, ev, natureFactor, itemFactor, abilityFactor, battleState, language));
          markerMap.set(markerValue, existing);
        });
      });
    });
  });

  if (slot.nature === "unknown") {
    const natureLayer = createGraphLayer({
      key: "nature",
      titleKo: "성격 범위",
      titleEn: "Nature range",
      slot,
      baseSpeed,
      evValues,
      natureValues: [0.9, 1.1],
      itemFactor: pointItemFactor,
      abilityFactor: pointAbilityFactor,
      battleFactors,
      battleState,
      kind: "nature",
      language,
    });
    if (natureLayer) layers.push(natureLayer);
  }

  if (slot.itemSetting === "unknown") {
    const scarfLayer = createGraphLayer({
      key: "scarf",
      titleKo: "구애스카프 가능 범위",
      titleEn: "Possible Choice Scarf range",
      slot,
      baseSpeed,
      evValues,
      natureValues: rangeNatureValues,
      itemFactor: 1.5,
      abilityFactor: pointAbilityFactor,
      battleFactors,
      battleState,
      kind: "item",
      language,
    });
    if (scarfLayer) layers.push(scarfLayer);
  }

  const potentialAbilityFactors = getPotentialAbilityFactors(slot, battleState);
  potentialAbilityFactors.forEach((abilityFactor) => {
    const abilityLayer = createGraphLayer({
      key: `ability-${abilityFactor}`,
      titleKo: "특성 발동 범위",
      titleEn: "Ability-active range",
      slot,
      baseSpeed,
      evValues,
      natureValues: rangeNatureValues,
      itemFactor: pointItemFactor,
      abilityFactor,
      battleFactors,
      battleState,
      kind: "ability",
      language,
    });
    if (abilityLayer && (abilityLayer.min !== pointMin || abilityLayer.max !== pointMax || slot.nature === "unknown")) {
      layers.push(abilityLayer);
    }

    if (slot.itemSetting === "unknown") {
      const bothLayer = createGraphLayer({
        key: `both-${abilityFactor}`,
        titleKo: "스카프+특성 범위",
        titleEn: "Scarf + ability range",
        slot,
        baseSpeed,
        evValues,
        natureValues: rangeNatureValues,
        itemFactor: 1.5,
        abilityFactor,
        battleFactors,
        battleState,
        kind: "both",
        language,
      });
      if (bothLayer) layers.push(bothLayer);
    }
  });

  const priorityLayer = layers.find((layer) => layer.kind === "nature");
  const graphMin = Math.min(pointMin, ...layers.map((layer) => layer.min));
  const graphMax = Math.max(pointMax, ...layers.map((layer) => layer.max));

  return {
    pointMin,
    pointMax,
    point,
    pointUncertaintyCount: getPointUncertaintyCount(slot),
    pointTooltip: formatPointRangeSummary(slot, baseSpeed, battleState, language),
    min: graphMin,
    max: graphMax,
    priorityMin: priorityLayer?.min ?? pointMin,
    priorityMax: priorityLayer?.max ?? pointMax,
    layers,
    markers: summarizeMarkerMap(markerMap).filter((marker) => marker.value >= graphMin && marker.value <= graphMax),
  };
}

function getGraphPriorityRange(graph) {
  return {
    max: graph.priorityMax ?? graph.pointMax ?? graph.point ?? 0,
    min: graph.priorityMin ?? graph.pointMin ?? graph.point ?? 0,
  };
}

function buildRosterGraph(entry, speed = entry.speed, language = "ko") {
  return buildGraph(
    {
      name: entry.displayName,
      nameEn: entry.displayNameEn,
      nature: "unknown",
      itemSetting: "unknown",
      abilitySetting: "unknown",
      evUnknown: true,
      evValue: 32,
      megaChoice: "",
    },
    speed,
    null,
    language
  );
}

function formatRange(min, max) {
  return min === max ? `${min}` : `${min}~${max}`;
}

function getVerdict(allyGraph, enemyGraph, t) {
  const allyExact = allyGraph.min === allyGraph.max;
  const enemyExact = enemyGraph.min === enemyGraph.max;
  if (allyExact && enemyExact && allyGraph.min === enemyGraph.min) return { title: t.tieExact, sub: t.tieExactSub, tone: "tie" };
  if (allyGraph.min > enemyGraph.max) return { title: t.sureFirstMy, sub: t.sureSubMy, tone: "ally" };
  if (enemyGraph.min > allyGraph.max) return { title: t.sureFirstOpp, sub: t.sureSubOpp, tone: "enemy" };
  if (allyGraph.point === enemyGraph.point) return { title: t.tiePossible, sub: t.tiePossibleSub, tone: "tie" };
  if (allyGraph.point > enemyGraph.point) return { title: t.likelyFirstMy, sub: t.likelySubMy, tone: "ally" };
  if (enemyGraph.point > allyGraph.point) return { title: t.likelyFirstOpp, sub: t.likelySubOpp, tone: "enemy" };
  return { title: t.mixed, sub: t.mixedSub, tone: "neutral" };
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

function getSegmentSpan(segment) {
  return Math.max(1, segment.max - segment.min);
}

function getSegmentCenter(segment) {
  return (segment.min + segment.max) / 2;
}

function getMorphScore(previousSegment, nextSegment) {
  const overlap = Math.max(0, Math.min(previousSegment.max, nextSegment.max) - Math.max(previousSegment.min, nextSegment.min));
  const overlapRatio = overlap / Math.max(1, Math.min(getSegmentSpan(previousSegment), getSegmentSpan(nextSegment)));
  const centerDelta = Math.abs(getSegmentCenter(previousSegment) - getSegmentCenter(nextSegment));
  const maxSpan = Math.max(getSegmentSpan(previousSegment), getSegmentSpan(nextSegment));
  const involvesPoint =
    previousSegment.segmentKind === "point" ||
    previousSegment.segmentKind === "point-range" ||
    nextSegment.segmentKind === "point" ||
    nextSegment.segmentKind === "point-range";

  if (centerDelta > Math.max(10, maxSpan * 0.28)) return Number.NEGATIVE_INFINITY;
  if (overlapRatio < (involvesPoint ? 0.45 : 0.6)) return Number.NEGATIVE_INFINITY;

  const kindBonus = previousSegment.segmentKind === nextSegment.segmentKind ? 18 : 8;
  const semanticBonus = previousSegment.semanticId === nextSegment.semanticId ? 42 : 0;
  return overlapRatio * 100 - centerDelta + kindBonus + semanticBonus;
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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (sequence.length <= 1) {
      setIsAnimating(false);
      return undefined;
    }

    setIsAnimating(false);
    const frameId = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [animationKey, sequence]);

  if (sequence.length <= 1) {
    return <span className="rolling-digit-static">{toChar}</span>;
  }

  return (
    <span className="rolling-digit-window" aria-hidden="true">
      <span
        className={`rolling-digit-track ${isAnimating ? "is-animating" : ""}`}
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
  const [displayState, setDisplayState] = useState(() => ({
    from: nextText,
    to: nextText,
    version: 0,
  }));

  useEffect(() => {
    setDisplayState((current) => {
      if (phase === "enter") {
        return {
          from: blankText,
          to: nextText,
          version: current.version + 1,
        };
      }

      if (phase === "exit") {
        return {
          from: current.to === blankText ? nextText : current.to,
          to: blankText,
          version: current.version + 1,
        };
      }

      if (current.to === targetText) return current;
      return {
        from: current.to,
        to: targetText,
        version: current.version + 1,
      };
    });
  }, [nextText, blankText, targetText, phase]);

  const width = Math.max(displayState.from.length, displayState.to.length);
  const fromChars = displayState.from.padStart(width, " ").split("");
  const toChars = displayState.to.padStart(width, " ").split("");

  return (
    <span className="rolling-number" aria-label={nextText}>
      {toChars.map((toChar, index) => (
        <RollingDigit
          key={`${animationIdentity}-${index}-${displayState.version}`}
          fromChar={fromChars[index] ?? " "}
          toChar={toChar}
          animationKey={`${animationIdentity}-${displayState.version}-${index}`}
        />
      ))}
    </span>
  );
}

function SpeedGraph({ graph, maxValue, tone = "ally", compact = false, markerValuePlacement = "none" }) {
  const graphRef = useRef(null);
  const [graphWidth, setGraphWidth] = useState(0);
  const pointLeft = (graph.point / maxValue) * 100;
  const pointRangeLeft = (graph.pointMin / maxValue) * 100;
  const pointRangeWidth = ((graph.pointMax - graph.pointMin) / maxValue) * 100;
  const pointIsRange = graph.pointMax > graph.pointMin;
  const isSingleResolvedPoint = graph.layers.length === 0 && graph.min === graph.max && !pointIsRange;
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
        .map(({ renderId, min, max, className, tooltip, phase, uncertaintyCount, segmentKind, tone }) => {
          const left = (min / maxValue) * 100;
          const width = ((max - min) / maxValue) * 100;
          const isCollapsed = min === max;
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
  const [selectedPreset, setSelectedPreset] = useState("");
  const [presetName, setPresetName] = useState("");
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [battleSearch, setBattleSearch] = useState({ ally: "", enemy: "" });
  const [selectedSide, setSelectedSide] = useState("ally");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailPanelCleared, setIsDetailPanelCleared] = useState(false);
  const [searchTargetSide, setSearchTargetSide] = useState("ally");
  const [draggingSlot, setDraggingSlot] = useState(null);
  const compareRowRefs = useRef(new Map());
  const previousComparePositions = useRef(new Map());
  const [battleState, setBattleState] = useState({
    ally: { index: 0, mega: false, ability: false, tailwind: false, paralysis: false, rank: 0 },
    enemy: { index: 0, mega: false, ability: false, tailwind: false, paralysis: false, rank: 0 },
  });

  const t = TEXT[language];
  const selectedSlot = (selectedSide === "ally" ? allySlots : enemySlots)[selectedIndex] || createSlot(selectedIndex);
  const savedAtFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
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
    if (selectedPreset && !presets.some((preset) => preset.name === selectedPreset)) {
      setSelectedPreset("");
    }
  }, [presets, selectedPreset]);

  const selectSlot = (side, index) => {
    setSelectedSide(side);
    setSelectedIndex(index);
    setIsDetailPanelCleared(false);
  };

  const updateTeam = (side, updater) => {
    const setter = side === "ally" ? setAllySlots : setEnemySlots;
    setter((current) => updater(current));
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

  const updateBattleSlot = (side, patch) => {
    const index = battleState[side].index;
    updateSlot(side, index, patch);
  };

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];
    return championsRoster.filter((entry) => `${entry.displayName} ${entry.displayNameEn || ""}`.toLowerCase().includes(keyword)).slice(0, 10);
  }, [search]);

  const battleSearchResults = useMemo(
    () =>
      ["ally", "enemy"].reduce(
        (acc, side) => {
          const keyword = battleSearch[side].trim().toLowerCase();
          acc[side] = keyword ? championsRoster.filter((entry) => `${entry.displayName} ${entry.displayNameEn || ""}`.toLowerCase().includes(keyword)).slice(0, 8) : [];
          return acc;
        },
        { ally: [], enemy: [] }
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
    const { preferredIndex = null, syncBattleIndex = false } = options;
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
      baseSpeed: entry.speed,
      icon: entry.icon,
      megaChoice: hasMega ? "unknown" : "",
      nature: "unknown",
      itemSetting: "unknown",
      abilitySetting: abilityOptions.length > 1 ? "unknown" : "none",
    });
    selectSlot(side, targetIndex);
    if (syncBattleIndex) {
      setBattleState((current) => ({
        ...current,
        [side]: { ...current[side], index: targetIndex },
      }));
      setBattleSearch((current) => ({ ...current, [side]: "" }));
    }
  };

  const applyRosterEntry = (entry) => {
    applyRosterEntryToSide(entry, searchTargetSide);
    setSearch("");
  };

  const clearOpponent = () => {
    setEnemySlots(normalizeTeam());
    setBattleState((current) => ({
      ...current,
      enemy: { index: 0, mega: false, ability: false, tailwind: false, paralysis: false, rank: 0 },
    }));
    if (selectedSide === "enemy") setSelectedIndex(0);
  };

  const clearSingleSlot = (side, index) => {
    updateSlot(side, index, createSlot(index));
    if (selectedSide === side && selectedIndex === index) {
      setSelectedIndex(0);
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
    setSelectedPreset(trimmed);
    setPresetName(trimmed);
  };

  const loadPreset = (name) => {
    const preset = presets.find((entry) => entry.name === name);
    if (!preset) return;
    setSelectedPreset(name);
    setPresetName(name);
    setAllySlots(normalizeTeam(preset.slots));
    selectSlot("ally", 0);
    setIsPresetManagerOpen(false);
  };

  const deletePreset = (name) => {
    const target = presets.find((preset) => preset.name === name);
    if (!target) return;

    const confirmed = window.confirm(
      language === "ko" ? `"${target.name}" 저장본을 삭제할까요?` : `Delete the saved team "${target.name}"?`
    );

    if (!confirmed) return;

    setPresets((current) => current.filter((preset) => preset.name !== name));
    if (selectedPreset === name) setSelectedPreset("");
    if (presetName.trim() === name) setPresetName("");
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

  const compareRows = useMemo(() => {
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
          selected: battleState[side].index === index && !battleState[side].mega,
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
            selected: battleState[side].index === index && battleState[side].mega && slot.megaChoice === mega.key,
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
  }, [allySlots, enemySlots, battleState, allyActiveLocked, enemyActiveLocked, language]);

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

  const rosterRows = useMemo(() => {
    const rows = [];
    championsRoster.forEach((entry) => {
      rows.push({
        id: entry.id,
        label: getLocalizedName(entry, language),
        icon: entry.icon,
        graph: buildRosterGraph(entry, entry.speed, language),
        baseSpeed: entry.speed,
        isMega: false,
      });
      (MEGA_OPTIONS[entry.displayName] || []).forEach((mega) => {
        rows.push({
          id: `${entry.id}-${mega.key}`,
          label: getLocalizedMegaLabel(mega, language),
          icon: CANONICAL_MEGA_ART[mega.label] || entry.icon,
          graph: buildRosterGraph(entry, mega.speed, language),
          baseSpeed: mega.speed,
          isMega: true,
        });
      });
    });
    return rows.sort((a, b) => {
      const aPriorityRange = getGraphPriorityRange(a.graph);
      const bPriorityRange = getGraphPriorityRange(b.graph);
      if (bPriorityRange.max !== aPriorityRange.max) return bPriorityRange.max - aPriorityRange.max;
      if (bPriorityRange.min !== aPriorityRange.min) return bPriorityRange.min - aPriorityRange.min;
      return b.graph.max - a.graph.max;
    });
  }, [language]);

  const rosterMax = Math.max(200, ...rosterRows.map((row) => row.graph.max), 200);

  const allyBattleSlot = allySlots[battleState.ally.index] || createSlot(0);
  const enemyBattleSlot = enemySlots[battleState.enemy.index] || createSlot(0);
  const allyBattleSpeed = battleState.ally.mega ? getSelectedMega(allyBattleSlot)?.speed || allyBattleSlot.baseSpeed : allyBattleSlot.baseSpeed;
  const enemyBattleSpeed = battleState.enemy.mega ? getSelectedMega(enemyBattleSlot)?.speed || enemyBattleSlot.baseSpeed : enemyBattleSlot.baseSpeed;
  const allyBattleGraph = slotHasPokemon(allyBattleSlot) ? buildGraph(allyBattleSlot, allyBattleSpeed, battleState.ally, language) : null;
  const enemyBattleGraph = slotHasPokemon(enemyBattleSlot) ? buildGraph(enemyBattleSlot, enemyBattleSpeed, battleState.enemy, language) : null;

  useEffect(() => {
    setBattleState((current) => {
      let changed = false;
      const next = { ...current };

      [
        ["ally", allyBattleSlot],
        ["enemy", enemyBattleSlot],
      ].forEach(([side, slot]) => {
        if (!current[side].ability) return;
        if (canActivateBattleAbility(slot, current[side])) return;
        next[side] = { ...current[side], ability: false };
        changed = true;
      });

      return changed ? next : current;
    });
  }, [allyBattleSlot, enemyBattleSlot, battleState.ally, battleState.enemy]);
  const battleMax = Math.max(200, allyBattleGraph?.max || 0, enemyBattleGraph?.max || 0);
  const verdict = allyBattleGraph && enemyBattleGraph ? getVerdict(allyBattleGraph, enemyBattleGraph, t) : null;

  const isDetailSlotVisible = slotHasPokemon(selectedSlot) && !isDetailPanelCleared;
  const selectedGraph = isDetailSlotVisible ? buildGraph(selectedSlot, selectedSlot.baseSpeed, null, language) : null;

  const renderSlotRow = (side, slots, title) => (
    <section className={`team-card ${side}`}>
      <div className="team-card-head">
        <div>
          <h3>{title}</h3>
          <p>{slots.filter(slotHasPokemon).length}/6 · {slots.filter((slot) => slot.active).length}/{activeLimit} {t.active}</p>
        </div>
        {side === "ally" ? (
          <div className="team-card-actions">
            <button type="button" className="ghost-button" onClick={() => setIsPresetManagerOpen(true)}>
              {t.manage}
            </button>
          </div>
        ) : (
          <button type="button" className="danger-pill" onClick={clearOpponent}>
            {t.clearOpponent}
          </button>
        )}
      </div>

      <div className="slot-grid horizontal-six">
        {slots.map((slot, index) => {
          const selected = selectedSide === side && selectedIndex === index;
          const hasPokemon = slotHasPokemon(slot);
            return (
              <div
                key={`${side}-${slot.slotId}`}
                role="button"
                tabIndex={0}
                className={`slot-card compact ${selected ? "selected" : ""} ${slot.active ? "active" : ""} ${hasPokemon ? "filled" : "empty"}`}
                draggable={hasPokemon}
                onDragStart={() => setDraggingSlot({ side, index })}
              onDragOver={(event) => {
                if (!draggingSlot || draggingSlot.side !== side) return;
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggingSlot || draggingSlot.side !== side || draggingSlot.index === index) return;
                updateTeam(side, (current) => {
                  const next = [...current];
                  const [moved] = next.splice(draggingSlot.index, 1);
                  next.splice(index, 0, moved);
                  return next.map((item, slotIndex) => normalizeSlot(item, slotIndex));
                });
                selectSlot(side, index);
                setDraggingSlot(null);
              }}
              onDragEnd={() => setDraggingSlot(null)}
                onClick={() => {
                  selectSlot(side, index);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectSlot(side, index);
                  }
                }}
              >
              {hasPokemon ? (
                <>
                  <div className="slot-card-top compact">
                    <img src={slot.icon} alt="" className="slot-icon" />
                    <div className="slot-copy">
                      <strong>{getLocalizedName(slot, language)}</strong>
                    </div>
                    <div className="slot-actions">
                      <button
                        type="button"
                        className="slot-remove"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearSingleSlot(side, index);
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
                      {renderActiveToggle(side, index, slot, "compact")}
                    </div>
                  </div>
                </>
              ) : (
                <div className="slot-empty compact">
                  <strong>{t.slotEmpty}</strong>
                </div>
              )}
              </div>
            );
        })}
      </div>
    </section>
  );
  const renderAbilityButtons = (slot, onChange) => {
    if (!hasSpeedAbilityOptions(slot)) {
      const label = language === "ko" ? DEFAULT_ABILITY_OPTIONS[0].labelKo : DEFAULT_ABILITY_OPTIONS[0].labelEn;
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
        {language === "ko" ? option.labelKo : option.labelEn}
      </button>
    ));
  };

  const renderMegaField = (slot, onChange) => {
    const megaChoices = getMegaChoices(slot);
    return (
      <div className="mega-picker-row single">
        <select
          className="mega-select"
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

  const toneClass = theme === "dark" ? "dark" : "light";

  return (
    <div className={`app-shell ${toneClass}`}>
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

              <select className="lang-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </header>

        {view === "team" ? (
          <main className="workspace team-workspace">
            <div className="left-stack">
              <section className="panel team-panel">
                <div className="panel-head">
                  <div className="heading-with-help">
                    <h2>{t.teamSettings}</h2>
                    <Tooltip label="?" text={t.addHint} className="inline-help" />
                  </div>
                </div>

                <div className="team-toolbar">
                  <div className="toolbar-group mode-group">
                    <span className="toolbar-label">{t.battleMode}</span>
                    <div className="segmented compact">
                      <button type="button" className={battleMode === "single" ? "active" : ""} onClick={() => setBattleMode("single")}>
                        {t.single}
                      </button>
                      <button type="button" className={battleMode === "double" ? "active" : ""} onClick={() => setBattleMode("double")}>
                        {t.double}
                      </button>
                    </div>
                  </div>

                  <div className="toolbar-group side-group">
                    <div className="segmented compact target-toggle">
                      <button type="button" className={searchTargetSide === "ally" ? "active" : ""} onClick={() => setSearchTargetSide("ally")}>
                        {t.myTeam}
                      </button>
                      <button type="button" className={searchTargetSide === "enemy" ? "active" : ""} onClick={() => setSearchTargetSide("enemy")}>
                        {t.opponentTeam}
                      </button>
                    </div>
                  </div>

                  <label className="search-box">
                    <span>{t.search}</span>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} />
                  </label>
                </div>

                {searchResults.length > 0 && (
                  <div className="search-popover">
                    {searchResults.map((entry) => (
                      <button key={entry.id} type="button" className="search-result" onClick={() => applyRosterEntry(entry)}>
                        <img src={entry.icon} alt="" className="result-icon" />
                        <span>{getLocalizedName(entry, language)}</span>
                        <em>{t.baseSpeed} {entry.speed}</em>
                      </button>
                    ))}
                  </div>
                )}

                <div className="setup-row">
                  <div className="team-columns">
                    {renderSlotRow("ally", allySlots, t.myTeam)}
                    {renderSlotRow("enemy", enemySlots, t.opponentTeam)}
                  </div>

                  <div className={`detail-card ${isDetailSlotVisible ? "" : "detail-empty"}`}>
                    <div className="detail-head">
                      <div>
                        <h3>{t.detailSettings}</h3>
                      </div>
                      <button type="button" className="ghost-button" onClick={() => setIsDetailPanelCleared(true)}>
                        {t.clearDetailPanel}
                      </button>
                    </div>

                    {isDetailSlotVisible ? (
                      <>
                        <div className="detail-summary">
                          <div className={`detail-side-badge ${selectedSide}`}>{selectedSide === "ally" ? t.myTeam : t.opponentTeam}</div>
                          <div className={`icon-shell ${getSelectedMega(selectedSlot) ? "can-mega" : ""}`}>
                            <img src={getDisplayIcon(selectedSlot, false)} alt="" className="detail-icon" />
                          </div>
                          <div className="detail-copy">
                            <strong>{getLocalizedName(selectedSlot, language)}</strong>
                            <span>{t.baseSpeed} {selectedSlot.baseSpeed}</span>
                          </div>
                          <div className="detail-range action-slot">
                            {renderActiveToggle(selectedSide, selectedIndex, selectedSlot)}
                          </div>
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
                                  {language === "ko" ? option.labelKo : option.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="field span-2">
                            <span>{t.item}</span>
                            <div className="segmented wrap">
                              {Object.entries(ITEMS).map(([key, item]) => (
                                <button key={key} type="button" className={selectedSlot.itemSetting === key ? "active" : ""} onClick={() => updateSlot(selectedSide, selectedIndex, { itemSetting: key })}>
                                  {language === "ko" ? item.labelKo : item.labelEn}
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

                        {selectedGraph && (
                          <div className="detail-speed-result">
                            <span>{t.statRange}</span>
                            <strong>{formatRange(selectedGraph.min, selectedGraph.max)}</strong>
                          </div>
                        )}
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

                <div className="battle-grid">
                  {[
                    { side: "ally", title: t.myTeam, slot: allyBattleSlot, state: battleState.ally, speed: allyBattleSpeed, graph: allyBattleGraph },
                    { side: "enemy", title: t.opponentTeam, slot: enemyBattleSlot, state: battleState.enemy, speed: enemyBattleSpeed, graph: enemyBattleGraph },
                  ].map(({ side, title, slot, state, speed, graph }) => (
                    <div key={side} className={`battle-side ${side} ${slotHasPokemon(slot) ? "" : "battle-side-empty"} ${battleSearchResults[side].length > 0 ? "battle-side-searching" : ""}`}>
                      <div className="battle-side-head">
                        <h3>{title}</h3>
                        <select value={state.index} onChange={(event) => setBattleState((current) => ({ ...current, [side]: { ...current[side], index: Number(event.target.value) } }))}>
                          {(side === "ally" ? allySlots : enemySlots).map((teamSlot, index) => (
                            <option key={`${side}-${index}`} value={index}>
                              {slotHasPokemon(teamSlot) ? getLocalizedName(teamSlot, language) : `${t.slotEmpty} ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <>
                        <label className="search-box battle-search-box">
                          <span>{t.search}</span>
                          <input
                            value={battleSearch[side]}
                            onChange={(event) => setBattleSearch((current) => ({ ...current, [side]: event.target.value }))}
                            placeholder={t.search}
                          />
                        </label>
                        {battleSearchResults[side].length > 0 && (
                          <div className="search-popover battle-search-popover">
                            {battleSearchResults[side].map((entry) => (
                              <button
                                key={`battle-${side}-${entry.id}`}
                                type="button"
                                className="search-result"
                                onClick={() => applyRosterEntryToSide(entry, side, { preferredIndex: battleState[side].index, syncBattleIndex: true })}
                              >
                                <img src={entry.icon} alt="" className="result-icon" />
                                <span>{getLocalizedName(entry, language)}</span>
                                <em>{t.baseSpeed} {entry.speed}</em>
                              </button>
                            ))}
                          </div>
                        )}
                      </>

                        {slotHasPokemon(slot) ? (
                          <>
                            <div className="battle-poke">
                              <div className={`icon-shell ${state.mega ? "mega-on" : ""}`}>
                                <img src={getDisplayIcon(slot, state.mega)} alt="" className="slot-icon large" />
                            </div>
                            <div>
                              <strong>{state.mega && getSelectedMega(slot) ? getLocalizedMegaLabel(getSelectedMega(slot), language) : getLocalizedName(slot, language)}</strong>
                                <span>{t.baseSpeed} {speed}</span>
                              </div>
                            </div>

                            <div className="detail-grid battle-detail-grid tidy">
                              <div className="field battle-field battle-field-mega">
                                <span>{t.mega}</span>
                                {renderMegaField(slot, (value) => updateBattleSlot(side, { megaChoice: value }))}
                              </div>

                              <div className="field battle-field battle-field-points">
                                <span>{t.statPoints}</span>
                                <div className="inline-input">
                                  <input type="number" min="0" max="32" disabled={slot.evUnknown} value={slot.evValue} onChange={(event) => updateBattleSlot(side, { evValue: clampInt(event.target.value, 0, 32) })} />
                                  <button type="button" className={`ghost-button ${slot.evUnknown ? "active" : ""}`} onClick={() => updateBattleSlot(side, { evUnknown: !slot.evUnknown })}>
                                    {t.unknown}
                                  </button>
                                </div>
                              </div>

                              <div className="field span-2 battle-field battle-field-nature">
                                <span>{t.nature}</span>
                                <div className="segmented compact">
                                  {NATURE_OPTIONS.map((option) => (
                                    <button key={option.key} type="button" className={slot.nature === option.key ? "active" : ""} onClick={() => updateBattleSlot(side, { nature: option.key })}>
                                      {language === "ko" ? option.labelKo : option.labelEn}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="field span-2 battle-field battle-field-item">
                                <span>{t.item}</span>
                                <div className="segmented wrap">
                                  {Object.entries(ITEMS).map(([key, item]) => (
                                    <button key={key} type="button" className={slot.itemSetting === key ? "active" : ""} onClick={() => updateBattleSlot(side, { itemSetting: key })}>
                                      {language === "ko" ? item.labelKo : item.labelEn}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="field span-2 battle-field battle-field-ability">
                                <span>{t.ability} <Tooltip label="?" text={getAbilityHelpText(slot, language, t.abilityHelp)} className="inline-help" /></span>
                                <div className="segmented wrap">
                                  {renderAbilityButtons(slot, (value) => updateBattleSlot(side, { abilitySetting: value }))}
                                </div>
                              </div>
                            </div>

                            <div className="battle-action-row">
                              <button type="button" className={`toggle-chip ${state.tailwind ? "on" : ""}`} onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], tailwind: !current[side].tailwind } }))}>
                                {t.tailwind}
                              </button>
                              <button type="button" className={`toggle-chip ${state.paralysis ? "on" : ""}`} onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], paralysis: !current[side].paralysis } }))}>
                                {t.paralysis}
                              </button>
                              <button type="button" className={`toggle-chip ${state.mega ? "on" : ""}`} disabled={!getSelectedMega(slot)} onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], mega: !current[side].mega } }))}>
                                {t.mega}
                              </button>
                              <button type="button" className={`toggle-chip ${state.ability ? "on" : ""}`} disabled={!canActivateBattleAbility(slot, state)} onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], ability: !current[side].ability } }))}>
                                {t.ability}
                              </button>
                            </div>

                            <div className="battle-rank-row">
                              <span>{t.rank}</span>
                              <div className="rank-controls">
                                <button type="button" onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], rank: Math.max(-6, current[side].rank - 1) } }))}>-</button>
                                <strong>{state.rank}</strong>
                                <button type="button" onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], rank: Math.min(6, current[side].rank + 1) } }))}>+</button>
                              </div>
                            </div>
                          </>
                        ) : (
                        <div className="empty-box in-panel">{t.liveBattleEmptyHint}</div>
                      )}
                    </div>
                  ))}
                </div>

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
                        <div className="battle-result-icon-spot ally">
                          <img src={getDisplayIcon(allyBattleSlot, battleState.ally.mega)} alt={getLocalizedName(allyBattleSlot, language) || t.myTeam} className="battle-result-icon" />
                        </div>
                        <div className="battle-result-graphs">
                          <div className="battle-result-graph ally">
                            <SpeedGraph graph={allyBattleGraph} maxValue={battleMax} tone="ally" compact markerValuePlacement="top" />
                          </div>
                          <div className="battle-result-graph enemy">
                            <SpeedGraph graph={enemyBattleGraph} maxValue={battleMax} tone="enemy" compact markerValuePlacement="bottom" />
                          </div>
                        </div>
                        <div className="battle-result-icon-spot enemy">
                          <img src={getDisplayIcon(enemyBattleSlot, battleState.enemy.mega)} alt={getLocalizedName(enemyBattleSlot, language) || t.opponentTeam} className="battle-result-icon" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-box in-panel battle-result-empty-box">{t.battleResultEmptyHint}</div>
                  )}
                </div>
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
              </div>
              <div className="compare-list roster">
                {rosterRows.map((row) => (
                  <article key={row.id} className={`compare-row roster-row ${row.isMega ? "mega" : ""}`}>
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

        {isPresetManagerOpen && (
          <div
            className="saved-manager-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsPresetManagerOpen(false);
            }}
          >
            <section className="saved-manager-dialog" role="dialog" aria-modal="true" aria-label={t.savedTeamsTitle}>
              <div className="saved-manager-head">
                <div className="heading-with-help">
                  <h3>{t.savedTeamsTitle}</h3>
                  <Tooltip label="?" text={t.saveHelp} className="inline-help" />
                </div>
                <button type="button" className="ghost-button" onClick={() => setIsPresetManagerOpen(false)}>
                  {t.close}
                </button>
              </div>

              <div className="saved-team-panel modal">
                <div className="saved-team-toolbar">
                  <label className="saved-team-input">
                    <span>{t.saveName}</span>
                    <input
                      value={presetName}
                      onChange={(event) => setPresetName(event.target.value)}
                      placeholder={selectedPreset || getNextPresetName(t.myTeam, presets)}
                    />
                  </label>
                  <button type="button" className="primary-button" onClick={savePreset} disabled={!allyHasPokemon}>
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
                          onClick={() => {
                            setSelectedPreset(preset.name);
                            setPresetName(preset.name);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedPreset(preset.name);
                              setPresetName(preset.name);
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
                                    loadPreset(preset.name);
                                  }}
                                >
                                  {t.load}
                                </button>
                                <button
                                  type="button"
                                  className="danger-pill compact"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    deletePreset(preset.name);
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
        )}

        <footer className="app-footer">{t.footer}</footer>
      </div>

      <Analytics />
    </div>
    
  );
}

export default App;
