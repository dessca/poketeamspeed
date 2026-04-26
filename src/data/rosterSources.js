import { allMegaOptionsById, allPokemonRoster } from "./allPokemonRoster";
import { championsRoster, MEGA_OPTIONS } from "./championsRoster";

export const ROSTER_SOURCES = {
  champions: "champions",
  national: "national",
};

export const ROSTER_SORTS = {
  speed: "speed",
  name: "name",
  dex: "dex",
};

export const EMPTY_ROSTER = [];
export const EMPTY_MEGA_OPTIONS = {};

export function getRosterEntryNames(entry) {
  const ko = entry?.names?.ko ?? entry?.displayName ?? entry?.name ?? "";
  const en = entry?.names?.en ?? entry?.displayNameEn ?? entry?.nameEn ?? ko;
  const ja = entry?.names?.ja ?? entry?.displayNameJa ?? entry?.nameJa ?? en ?? ko;
  return { ko, en, ja };
}

export function getPrimaryRosterName(entry) {
  return getRosterEntryNames(entry).ko;
}

export function getRosterSearchNames(entry) {
  const names = getRosterEntryNames(entry);
  return [...new Set([names.ko, names.en, names.ja].filter(Boolean))];
}

const MEGA_OPTION_OVERRIDES_BY_ICON_ID = {
  "10307": {
    key: "mega-z",
    label: "메가앱솔Z",
    labelEn: "Mega Absol Z",
    labelJa: "メガアブソルZ",
  },
  "10309": {
    key: "mega-z",
    label: "메가한카리아스Z",
    labelEn: "Mega Garchomp Z",
    labelJa: "メガガブリアスZ",
  },
  "10310": {
    key: "mega-z",
    label: "메가루카리오Z",
    labelEn: "Mega Lucario Z",
    labelJa: "メガルカリオZ",
  },
  "10322": {
    icon: "https://static.rotomlabs.net/images/official-artwork/0978-tatsugiri-mega-curly.webp",
  },
};

function getOfficialArtworkIconId(icon) {
  const match = String(icon || "").match(/official-artwork\/(\d+)\.png$/);
  return match?.[1] || "";
}

function normalizeMegaOptions(options) {
  if (!Array.isArray(options)) return [];

  const usedKeys = new Map();
  const seenEquivalentOptions = new Set();

  return options
    .filter((option) => {
      const equivalentKey = [option.labelEn || option.label, option.speed].join(":");
      if (seenEquivalentOptions.has(equivalentKey)) return false;
      seenEquivalentOptions.add(equivalentKey);
      return true;
    })
    .map((option, index) => {
      const override = MEGA_OPTION_OVERRIDES_BY_ICON_ID[getOfficialArtworkIconId(option.icon)] || {};
      const baseKey = override.key || option.key || `mega-${index + 1}`;
      const keyCount = usedKeys.get(baseKey) || 0;
      usedKeys.set(baseKey, keyCount + 1);

      return {
        ...option,
        ...override,
        key: keyCount === 0 ? baseKey : `${baseKey}-${keyCount + 1}`,
      };
    });
}

export function getMegaOptionsForEntry(megaOptions, entry) {
  if (!entry) return [];
  return normalizeMegaOptions(
    megaOptions[entry.id] || megaOptions[entry.championId] || megaOptions[getPrimaryRosterName(entry)] || []
  );
}

function indexMegaOptionsByEntryId(roster, megaOptions) {
  const byId = Object.fromEntries(
    roster
      .map((entry) => [entry.id, megaOptions[entry.id] || megaOptions[getPrimaryRosterName(entry)]])
      .filter(([, options]) => Array.isArray(options) && options.length > 0)
  );

  return { ...megaOptions, ...byId };
}

export function loadNationalRosterBundle() {
  return Promise.resolve({ allPokemonRoster, allMegaOptionsById });
}

export function getRosterSourceData(source, nationalRosterBundle) {
  if (source !== ROSTER_SOURCES.national) {
    return {
      roster: championsRoster,
      megaOptions: indexMegaOptionsByEntryId(championsRoster, MEGA_OPTIONS),
      loading: false,
    };
  }

  const nationalMegaOptions = nationalRosterBundle?.allMegaOptionsById || EMPTY_MEGA_OPTIONS;

  return {
    roster: nationalRosterBundle?.allPokemonRoster || EMPTY_ROSTER,
    megaOptions: indexMegaOptionsByEntryId(nationalRosterBundle?.allPokemonRoster || EMPTY_ROSTER, {
      ...nationalMegaOptions,
      ...MEGA_OPTIONS,
    }),
    loading: !nationalRosterBundle,
  };
}

export { championsRoster, MEGA_OPTIONS };
