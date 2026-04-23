import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useRef } from "react";
import { championsRoster, MEGA_OPTIONS } from "./data/championsRoster";
import megaFroslassArt from "../image/Mega_Froslass.webp";

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
      "점은 무보정 실수치와 능력 포인트 반영값입니다. 능력 포인트를 모르면 점 대신 0~32 범위가 짧은 막대로 표시됩니다. 굵은 선은 성격 반영 범위, 얇은 선은 도구/특성 포함 전체 범위, 세로 눈금은 가능한 수치들입니다.",
    rosterHelp: "무보정 실수치를 기준으로 성격·도구·특성에 따른 가능한 범위를 함께 보여줍니다.",
    teamView: "팀 비교",
    rosterView: "전체 포켓몬",
    myTeam: "내 팀",
    opponentTeam: "상대 팀",
    search: "포켓몬 검색",
    searchTarget: "현재 추가 대상",
    teamSettings: "팀 설정",
    detailSettings: "상세 설정",
    detailEmptyHint: "엔트리에서 포켓몬을 선택해 상세 설정을 확인하세요.",
    liveBattle: "실시간 대면",
    liveBattleEmptyHint: "실시간 대면에서 포켓몬을 선택해 전투 상황을 설정하세요.",
    battleResultEmptyHint: "내 팀과 상대 팀 포켓몬을 설정하고 누가 먼저 행동할지 확인해보세요.",
    speedCompare: "팀 스피드 비교",
    speedCompareHelp: "내 팀과 상대 팀 전체 엔트리 포켓몬들의 스피드를 비교해보세요. 출전 포켓몬이 모두 확정되면 나머지 포켓몬은 제외됩니다.",
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
    saveHelp: "현재 설정된 내 팀만 저장되며, 저장본을 즉시 불러오거나 삭제할 수 있습니다.",
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
    abilityHelp: "포켓몬에 따라 스피드 관련 특성이 있는 경우 설정할 수 있습니다. 속도 보정 특성을 선택하면 이 툴팁에서 발동 조건과 배율을 확인할 수 있습니다.",
    active: "출전",
    standby: "대기",
    resetSlot: "선택 슬롯 초기화",
    clearDetailPanel: "상세 설정 닫기",
    currentPokemon: "현재 포켓몬",
    tailwind: "순풍 ×2.0",
    paralysis: "마비 ×0.5",
    rank: "랭크",
    battleHelp: "실시간 대면 정보를 설정해보세요(위 상세 설정과 연동 가능). 선공 여부를 예측할 수 있습니다. 누가 먼저 행동할까요?",
    addHint: "팀을 선택하고 포켓몬을 검색해 슬롯에 추가하세요. 상세 설정에서 스피드 관련 설정을 할 수 있습니다. 각 슬롯의 출전/대기 버튼을 눌러 출전 포켓몬을 간편하게 표시해보세요. 슬롯을 드래그하여 순서를 변경할 수 있습니다.",
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
    titleHelp: "A quick speed comparison tool for Pokemon Champions.",
    graphHelpLabel: "How to read graphs ?",
    graphHelp:
      "The point shows the unmodified speed with stat points applied. If stat points are unknown, that point becomes a short range. The thick bar is the nature range, the thin line is the full range including item and ability, and the vertical ticks are the possible exact values.",
    rosterHelp: "The All Pokemon page starts from the unmodified speed, then shows how nature, item, and ability expand that range.",
    teamView: "Team",
    rosterView: "All Pokemon",
    myTeam: "My Team",
    opponentTeam: "Opponent",
    search: "Search Pokemon",
    searchTarget: "Current target",
    teamSettings: "Team Setup",
    detailSettings: "Detail",
    detailEmptyHint: "Select a Pokemon from the entries to open its detail settings.",
    liveBattle: "Live Matchup",
    liveBattleEmptyHint: "Choose a Pokemon in live matchup to configure the battle state.",
    battleResultEmptyHint: "Set your Pokemon and the opponent's Pokemon to see who moves first.",
    speedCompare: "Team Speed Compare",
    speedCompareHelp: "Compare the Speed ranges of all entry Pokemon on both teams. Once all active Pokemon are locked in, the remaining Pokemon are excluded.",
    allPokemon: "All Pokemon",
    battleMode: "Mode",
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
    savePlaceholder: "Enter a team name to keep a new snapshot.",
    saveHelp: "Only your current team is stored here. Pick a saved team to load or delete it instantly.",
    noSavedTeams: "No saved teams yet.",
    selectedSaved: "Selected save",
    savedMembers: "members saved",
    clearOpponent: "Clear All",
    slotEmpty: "Empty Slot",
    statRange: "Current speed range",
    baseSpeed: "Base Speed",
    mega: "Mega Evolution",
    noMega: "None",
    statPoints: "Stat Points",
    unknown: "Unknown",
    nature: "Nature Modifier",
    item: "Item",
    ability: "Ability",
    abilityHelp: "Species-matched speed-related abilities are shown when available. If a speed ability is selected, the ? shows its trigger and multiplier.",
    active: "Active",
    standby: "Bench",
    resetSlot: "Reset Slot",
    clearDetailPanel: "Close Detail",
    currentPokemon: "Current Pokemon",
    tailwind: "Tailwind ×2.0",
    paralysis: "Paralysis ×0.5",
    rank: "Stage",
    battleHelp: "You can edit the same settings here and they stay synced with the detail panel.",
    addHint: "Click a result to place it into the selected slot.",
    duplicatePokemon: "You can't add the same Pokemon twice to one team.",
    savePrompt: "Enter a team name.",
    saveEmpty: "No ally team to save.",
    noData: "No Pokemon yet.",
    sureFirstMy: "My Team Guaranteed",
    sureFirstOpp: "Opponent Guaranteed",
    likelyFirstMy: "My Team Favored",
    likelyFirstOpp: "Opponent Favored",
    tieExact: "Speed Tie",
    tiePossible: "Tie Possible",
    mixed: "Mixed",
    tieExactSub: "If both exact values match, move order is random every turn.",
    tiePossibleSub: "The remaining variables can still create a tie.",
    likelySubMy: "Based on the known settings, my team is more likely to move first.",
    likelySubOpp: "Based on the known settings, the opponent is more likely to move first.",
    sureSubMy: "The opponent cannot outspeed within the current range.",
    sureSubOpp: "My team cannot outspeed within the current range.",
    mixedSub: "Too many variables still overlap.",
    footer: "Contact: admin@poketeamspeed.local",
  },
};

const NATURES = {
  slow: 0.9,
  neutral: 1,
  fast: 1.1,
  unknown: 1,
};

const NATURE_OPTIONS = [
  { key: "slow", label: "×0.9", values: [0.9] },
  { key: "neutral", label: "×1.0", values: [1] },
  { key: "fast", label: "×1.1", values: [1.1] },
  { key: "unknown", label: "모름", values: [0.9, 1, 1.1] },
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
  return {
    ...createSlot(index),
    ...raw,
    slotId: `slot-${index}`,
    rosterId: canonical?.id ?? raw?.rosterId ?? "",
    dexNo: canonical?.dexNo ?? raw?.dexNo ?? null,
    formKey: canonical?.formKey ?? raw?.formKey ?? "base",
    name,
    baseSpeed: clampInt(canonical?.speed ?? raw?.baseSpeed ?? 0, 0, 255),
    icon: canonical?.icon ?? raw?.icon ?? "",
    megaChoice: normalizeMegaChoice(name, raw?.megaChoice ?? ""),
    evValue: clampInt(raw?.evValue ?? 32, 0, 32),
  };
}

function normalizeTeam(raw) {
  return Array.from({ length: 6 }, (_, index) => normalizeSlot(raw?.[index], index));
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

function getItemLabelFromFactor(factor) {
  if (factor === 1.5) return "구애스카프";
  return "도구 없음";
}

function getAbilityLabelFromFactor(factor, slot) {
  if (factor <= 1) return "특성 없음";
  const matched = getAbilityOptions(slot).find((option) => option.multiplier === factor && option.key !== "unknown");
  return matched ? `특성 ${matched.labelKo || matched.labelEn}` : "특성 발동";
}

function getNatureLabelFromFactor(factor) {
  if (factor === 0.9) return "성격 x0.9";
  if (factor === 1.1) return "성격 x1.1";
  return "성격 x1.0";
}

function summarizeTooltipLines(lines, maxLines = 4) {
  const unique = [...new Set(lines.filter(Boolean))];
  if (unique.length <= maxLines) return unique;
  return [...unique.slice(0, maxLines), `외 ${unique.length - maxLines}가지 경우`];
}

function formatExactValueSummary(slot, baseSpeed, ev, natureFactor, itemFactor, abilityFactor, battleState = null) {
  const baseStat = level50Speed(baseSpeed, ev, natureFactor);
  const labels = [`포인트 ${ev} · ${getNatureLabelFromFactor(natureFactor)}`, `기본 실수치 ${baseStat}`];

  if (itemFactor !== 1) labels.push(getItemLabelFromFactor(itemFactor));
  if (abilityFactor > 1) labels.push(getAbilityLabelFromFactor(abilityFactor, slot));

  if (battleState) {
    if (battleState.mega) labels.push("메가진화");
    if (battleState.tailwind) labels.push("순풍");
    if (battleState.paralysis) labels.push("마비");
    if (battleState.rank !== 0) labels.push(`랭크 ${battleState.rank}`);
  }

  return labels.join(" · ");
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

function formatSegmentSummary(slot, baseSpeed, itemFactor, abilityFactor, battleFactors) {
  const unboosted = applySpeed(level50Speed(baseSpeed, 0, 1), [itemFactor, abilityFactor, ...battleFactors]);
  const neutralMax = applySpeed(level50Speed(baseSpeed, 32, 1), [itemFactor, abilityFactor, ...battleFactors]);
  const fastMax = applySpeed(level50Speed(baseSpeed, 32, 1.1), [itemFactor, abilityFactor, ...battleFactors]);
  return [
    `${getItemLabelFromFactor(itemFactor)} / ${getAbilityLabelFromFactor(abilityFactor, slot)}`,
    `무보정 ${unboosted} · 준속 ${neutralMax} · 최속 ${fastMax}`,
  ];
}

function formatPointSummary(slot, baseSpeed, battleState) {
  const item = ITEMS[slot.itemSetting] || ITEMS.none;
  const ability = getSelectedAbility(slot);
  const itemLabel = slot.itemSetting === "unknown" ? "도구 모름" : item.point === 1.5 ? "구애스카프" : "도구 없음";
  const abilityLabel = slot.abilitySetting === "unknown" ? "특성 모름" : ability.multiplier > 1 ? `특성 ${ability.labelKo || ability.labelEn}` : "특성 없음";
  const battleLabels = [];
  if (battleState) {
    if (battleState.mega) battleLabels.push("메가진화");
    if (battleState.ability && ability.multiplier > 1) battleLabels.push("특성 발동");
    if (battleState.tailwind) battleLabels.push("순풍");
    if (battleState.paralysis) battleLabels.push("마비");
    if (battleState.rank !== 0) battleLabels.push(`랭크 ${battleState.rank}`);
  }

  return [
    `${itemLabel} / ${abilityLabel}`,
    `무보정 ${level50Speed(baseSpeed, 0, 1)} · 준속 ${level50Speed(baseSpeed, 32, 1)} · 최속 ${level50Speed(baseSpeed, 32, 1.1)}`,
    battleLabels.length ? battleLabels.join(", ") : "현재 확정 구간",
  ];
}

function formatPointRangeSummary(slot, baseSpeed, battleState) {
  const pointSummary = formatPointSummary(slot, baseSpeed, battleState);
  return summarizeTooltipLines(pointSummary);
}

function formatThickRangeSummary(slot, baseSpeed, battleState) {
  return summarizeTooltipLines(["성격 반영 범위", ...formatPointRangeSummary(slot, baseSpeed, battleState)]);
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

function buildGraph(slot, baseSpeed, battleState = null) {
  const selectedNature = NATURE_OPTIONS.find((option) => option.key === slot.nature) || NATURE_OPTIONS[1];
  const pointNatureValues = slot.nature === "unknown" ? [1] : selectedNature.values;
  const thickNatureValues = slot.nature === "unknown" ? [0.9, 1, 1.1] : selectedNature.values;
  const item = ITEMS[slot.itemSetting] || ITEMS.none;
  const ability = getSelectedAbility(slot);
  const abilityValues = getAbilityValues(slot);
  const evValues = slot.evUnknown ? [0, 32] : [slot.evValue];
  const pointEvValues = slot.evUnknown ? [0, 32] : [slot.evValue];

  const battleFactors = [];
  if (battleState) {
    if (battleState.tailwind) battleFactors.push(2);
    if (battleState.paralysis) battleFactors.push(0.5);
    battleFactors.push(stageFactor(battleState.rank));
  }

  const pointItemFactor = slot.itemSetting === "unknown" ? 1 : item.point;
  const pointAbilityFactor = battleState
    ? slot.abilitySetting === "unknown"
      ? 1
      : battleState.ability
        ? ability.multiplier
        : 1
    : slot.abilitySetting === "unknown"
      ? 1
      : ability.multiplier;

  const pointValues = [];
  const thickValues = [];
  const lineValues = [];
  const markerMap = new Map();
  const lineSegmentMap = new Map();

  pointEvValues.forEach((ev) => {
    pointNatureValues.forEach((natureFactor) => {
      pointValues.push(applySpeed(level50Speed(baseSpeed, ev, natureFactor), [pointItemFactor, pointAbilityFactor, ...battleFactors]));
    });
  });

  evValues.forEach((ev) => {
    thickNatureValues.forEach((natureFactor) => {
      const stat = level50Speed(baseSpeed, ev, natureFactor);
      const baseline = applySpeed(stat, [pointItemFactor, pointAbilityFactor, ...battleFactors]);
      thickValues.push(baseline);

      const itemValues = slot.itemSetting === "unknown" ? item.values : [item.point];
      let branchAbilityValues = abilityValues;

      if (battleState) {
        if (slot.abilitySetting === "unknown") {
          branchAbilityValues = battleState.ability ? abilityValues.filter((value) => value > 1) : [1, ...abilityValues.filter((value) => value > 1)];
        } else {
          branchAbilityValues = [battleState.ability ? ability.multiplier : 1];
        }
      }

      itemValues.forEach((itemFactor) => {
        branchAbilityValues.forEach((abilityFactor) => {
          const full = applySpeed(stat, [itemFactor, abilityFactor, ...battleFactors]);
          lineValues.push(full);
          const segmentKey = `${itemFactor}-${abilityFactor}`;
          const current = lineSegmentMap.get(segmentKey) || {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY,
            labels: formatSegmentSummary(slot, baseSpeed, itemFactor, abilityFactor, battleFactors),
          };
          current.min = Math.min(current.min, full);
          current.max = Math.max(current.max, full);
          lineSegmentMap.set(segmentKey, current);
        });
      });
    });
  });

  const markerNatureValues = slot.nature === "unknown" ? [0.9, 1, 1.1] : [NATURES[slot.nature] ?? 1];
  pointEvValues.forEach((ev) => {
    markerNatureValues.forEach((natureFactor) => {
      const stat = level50Speed(baseSpeed, ev, natureFactor);
      const itemValues = slot.itemSetting === "unknown" ? item.values : [item.point];
      const markerAbilityValues = battleState
        ? slot.abilitySetting === "unknown"
          ? [1, ...abilityValues.filter((value) => value > 1)]
          : [battleState.ability ? ability.multiplier : 1]
        : abilityValues;
      itemValues.forEach((itemFactor) => {
        markerAbilityValues.forEach((abilityFactor) => {
          const markerValue = applySpeed(stat, [itemFactor, abilityFactor, ...battleFactors]);
          const labels = [formatExactValueSummary(slot, baseSpeed, ev, natureFactor, itemFactor, abilityFactor, battleState)];
          const existing = markerMap.get(markerValue) || new Set();
          labels.forEach((label) => existing.add(label));
          markerMap.set(markerValue, existing);
        });
      });
    });
  });

  const pointSorted = dedupe(pointValues);
  const thickSorted = dedupe(thickValues);
  const lineSorted = dedupe(lineValues);

  const compactMarkers = summarizeMarkerMap(markerMap);
  const lineSegments = [...lineSegmentMap.values()]
    .filter((segment) => Number.isFinite(segment.min) && Number.isFinite(segment.max))
    .sort((a, b) => a.min - b.min);

  return {
    pointMin: pointSorted[0],
    pointMax: pointSorted[pointSorted.length - 1],
    point: pointSorted[Math.floor(pointSorted.length / 2)] ?? 0,
    pointTooltip: formatPointRangeSummary(slot, baseSpeed, battleState),
    thickTooltip: formatThickRangeSummary(slot, baseSpeed, battleState),
    thickMin: thickSorted[0] ?? pointSorted[0] ?? 0,
    thickMax: thickSorted[thickSorted.length - 1] ?? pointSorted[pointSorted.length - 1] ?? 0,
    min: lineSorted[0] ?? pointSorted[0] ?? 0,
    max: lineSorted[lineSorted.length - 1] ?? pointSorted[pointSorted.length - 1] ?? 0,
    markers: compactMarkers,
    lineSegments,
  };
}

function buildRosterGraph(baseSpeed) {
  const thick = [];
  const line = [];
  [0.9, 1, 1.1].forEach((nature) => {
    [0, 32].forEach((ev) => {
      const stat = level50Speed(baseSpeed, ev, nature);
      thick.push(stat);
      [1, 1.5].forEach((item) => {
        [1, 1.5, 2].forEach((ability) => {
          line.push(applySpeed(stat, [item, ability]));
        });
      });
    });
  });
  const thickSorted = dedupe(thick);
  const lineSorted = dedupe(line);
  return {
    point: level50Speed(baseSpeed, 0, 1),
    pointMin: level50Speed(baseSpeed, 0, 1),
    pointMax: level50Speed(baseSpeed, 0, 1),
    pointTooltip: summarizeTooltipLines([`무보정 ${level50Speed(baseSpeed, 0, 1)}`, `준속 ${level50Speed(baseSpeed, 32, 1)} · 최속 ${level50Speed(baseSpeed, 32, 1.1)}`]),
    thickTooltip: summarizeTooltipLines(["성격 반영 범위", `무보정 ${level50Speed(baseSpeed, 0, 1)}`, `준속 ${level50Speed(baseSpeed, 32, 1)} · 최속 ${level50Speed(baseSpeed, 32, 1.1)}`]),
    thickMin: thickSorted[0],
    thickMax: thickSorted[thickSorted.length - 1],
    min: lineSorted[0],
    max: lineSorted[lineSorted.length - 1],
    markers: [],
    lineSegments: [{ min: lineSorted[0], max: lineSorted[lineSorted.length - 1], labels: ["전체 가능 범위"] }],
  };
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
  return (
    <span className={`tooltip-anchor ${className}`} tabIndex={0}>
      {label}
      <span className="tooltip-panel">{text}</span>
    </span>
  );
}

function SpeedGraph({ graph, maxValue, tone = "ally", compact = false, markerValuePlacement = "none" }) {
  const graphRef = useRef(null);
  const [graphWidth, setGraphWidth] = useState(0);
  const thickLeft = (graph.thickMin / maxValue) * 100;
  const thickWidth = ((graph.thickMax - graph.thickMin) / maxValue) * 100;
  const pointLeft = (graph.point / maxValue) * 100;
  const pointRangeLeft = (graph.pointMin / maxValue) * 100;
  const pointRangeWidth = ((graph.pointMax - graph.pointMin) / maxValue) * 100;
  const pointIsRange = graph.pointMax > graph.pointMin;
  const pointTooltip = graph.pointTooltip?.join("\n") || "";
  const thickTooltip = graph.thickTooltip?.join("\n") || pointTooltip;
  const markerLabels = markerValuePlacement === "none"
    ? []
    : (() => {
        const sorted = [...graph.markers]
          .sort((a, b) => a.value - b.value)
          .map((marker) => {
            const preferredPercent = (marker.value / maxValue) * 100;
            const estimatedWidth = Math.max(18, String(marker.value).length * 8 + 6);
            const rotatedFootprint = estimatedWidth * 0.56 + 2;
            const widthPercent = graphWidth > 0 ? (rotatedFootprint / graphWidth) * 100 : compact ? 3.8 : 3;
            return {
              ...marker,
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
  }, []);

  return (
    <div ref={graphRef} className={`speed-graph ${tone} ${compact ? "compact" : ""}`}>
      {graph.lineSegments.map((segment, index) => {
        const left = (segment.min / maxValue) * 100;
        const width = ((segment.max - segment.min) / maxValue) * 100;
        return (
          <div
            key={`${segment.min}-${segment.max}-${index}`}
            className="speed-graph-segment marker-tooltip"
            data-tooltip={segment.labels.join("\n")}
            style={{ left: `${left}%`, width: `${Math.max(0.8, width)}%` }}
            tabIndex={0}
          >
            <div className="speed-graph-line" />
            <div className="speed-graph-cap start" />
            <div className="speed-graph-cap end" />
          </div>
        );
      })}
      <div className="speed-graph-thick marker-tooltip" style={{ left: `${thickLeft}%`, width: `${Math.max(1, thickWidth)}%` }} data-tooltip={thickTooltip} tabIndex={0} />
        {graph.markers.map((marker) => (
          <div
            key={`${marker.value}-${marker.labels.join("-")}`}
            className="speed-graph-marker"
            style={{ left: `${(marker.value / maxValue) * 100}%` }}
          />
        ))}
      {markerLabels.map((marker) => (
        <span
          key={`label-${marker.value}`}
          className={`speed-graph-value marker-tooltip ${markerValuePlacement}`}
          style={{ left: `${marker.labelPercent}%` }}
          data-tooltip={marker.tooltipText}
          tabIndex={0}
        >
          <span className="marker-hitbox" />
          <span className="speed-graph-value-text">{marker.value}</span>
        </span>
      ))}
      {pointIsRange ? (
        <div className="speed-graph-point-range marker-tooltip" style={{ left: `${pointRangeLeft}%`, width: `${Math.max(1.2, pointRangeWidth)}%` }} data-tooltip={pointTooltip} tabIndex={0} />
      ) : (
        <div className="speed-graph-point marker-tooltip" style={{ left: `${pointLeft}%` }} data-tooltip={pointTooltip} tabIndex={0} />
      )}
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(() => readStorage(STORAGE.language, "ko"));
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
    return championsRoster.filter((entry) => entry.displayName.toLowerCase().includes(keyword)).slice(0, 10);
  }, [search]);

  const battleSearchResults = useMemo(
    () =>
      ["ally", "enemy"].reduce(
        (acc, side) => {
          const keyword = battleSearch[side].trim().toLowerCase();
          acc[side] = keyword ? championsRoster.filter((entry) => entry.displayName.toLowerCase().includes(keyword)).slice(0, 8) : [];
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
        const baseGraph = buildGraph(slot, slot.baseSpeed);
        const locked = side === "ally" ? allyActiveLocked : enemyActiveLocked;
        const deemphasized = locked && !slot.active;
        rows.push({
          id: `${side}-${index}-base`,
          side,
          index,
          label: slot.name,
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
            label: mega.label,
            icon: getDisplayIcon({ ...slot, megaChoice: mega.key }, true),
            graph: buildGraph(slot, mega.speed),
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
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.graph.max - a.graph.max;
    });
  }, [allySlots, enemySlots, battleState, allyActiveLocked, enemyActiveLocked]);

  const compareMax = Math.max(200, ...compareRows.map((row) => row.graph.max), 200);

  const rosterRows = useMemo(() => {
    const rows = [];
    championsRoster.forEach((entry) => {
      rows.push({
        id: entry.id,
        label: entry.displayName,
        icon: entry.icon,
        graph: buildRosterGraph(entry.speed),
        baseSpeed: entry.speed,
        isMega: false,
      });
      (MEGA_OPTIONS[entry.displayName] || []).forEach((mega) => {
        rows.push({
          id: `${entry.id}-${mega.key}`,
          label: mega.label,
          icon: CANONICAL_MEGA_ART[mega.label] || entry.icon,
          graph: buildRosterGraph(mega.speed),
          baseSpeed: mega.speed,
          isMega: true,
        });
      });
    });
    return rows.sort((a, b) => b.graph.max - a.graph.max);
  }, []);

  const rosterMax = Math.max(200, ...rosterRows.map((row) => row.graph.max), 200);

  const allyBattleSlot = allySlots[battleState.ally.index] || createSlot(0);
  const enemyBattleSlot = enemySlots[battleState.enemy.index] || createSlot(0);
  const allyBattleSpeed = battleState.ally.mega ? getSelectedMega(allyBattleSlot)?.speed || allyBattleSlot.baseSpeed : allyBattleSlot.baseSpeed;
  const enemyBattleSpeed = battleState.enemy.mega ? getSelectedMega(enemyBattleSlot)?.speed || enemyBattleSlot.baseSpeed : enemyBattleSlot.baseSpeed;
  const allyBattleGraph = slotHasPokemon(allyBattleSlot) ? buildGraph(allyBattleSlot, allyBattleSpeed, battleState.ally) : null;
  const enemyBattleGraph = slotHasPokemon(enemyBattleSlot) ? buildGraph(enemyBattleSlot, enemyBattleSpeed, battleState.enemy) : null;
  const battleMax = Math.max(200, allyBattleGraph?.max || 0, enemyBattleGraph?.max || 0);
  const verdict = allyBattleGraph && enemyBattleGraph ? getVerdict(allyBattleGraph, enemyBattleGraph, t) : null;

  const isDetailSlotVisible = slotHasPokemon(selectedSlot) && !isDetailPanelCleared;
  const selectedGraph = isDetailSlotVisible ? buildGraph(selectedSlot, selectedSlot.baseSpeed) : null;

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
                      <strong>{slot.name}</strong>
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
              {mega.label}
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
                        <span>{entry.displayName}</span>
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
                            <strong>{selectedSlot.name}</strong>
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
                                  {option.label}
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
                              {slotHasPokemon(teamSlot) ? teamSlot.name : `${t.slotEmpty} ${index + 1}`}
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
                                <span>{entry.displayName}</span>
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
                              <strong>{state.mega && getSelectedMega(slot) ? getSelectedMega(slot).label : slot.name}</strong>
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
                                      {option.label}
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
                              <button type="button" className={`toggle-chip ${state.ability ? "on" : ""}`} disabled={getSelectedAbility(slot).multiplier <= 1} onClick={() => setBattleState((current) => ({ ...current, [side]: { ...current[side], ability: !current[side].ability } }))}>
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
                          <img src={getDisplayIcon(allyBattleSlot, battleState.ally.mega)} alt={allyBattleSlot.name || t.myTeam} className="battle-result-icon" />
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
                          <img src={getDisplayIcon(enemyBattleSlot, battleState.enemy.mega)} alt={enemyBattleSlot.name || t.opponentTeam} className="battle-result-icon" />
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
                    <article key={row.id} className={`compare-row ${row.side} ${row.selected ? "selected" : ""} ${row.deemphasized ? "inactive" : ""}`}>
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
                      <div className={`icon-shell ${row.isMega ? "mega-on" : ""}`}>
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
    </div>
  );
}

export default App;
