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

export function getMegaOptionsForEntry(megaOptions, entry) {
  if (!entry) return [];
  return megaOptions[entry.id] || megaOptions[getPrimaryRosterName(entry)] || [];
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
  return import("./allPokemonRoster");
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
