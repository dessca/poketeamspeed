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

export function loadNationalRosterBundle() {
  return import("./allPokemonRoster");
}

export function getRosterSourceData(source, nationalRosterBundle) {
  if (source !== ROSTER_SOURCES.national) {
    return {
      roster: championsRoster,
      megaOptions: MEGA_OPTIONS,
      loading: false,
    };
  }

  const nationalMegaOptions = nationalRosterBundle?.allMegaOptionsByName || EMPTY_MEGA_OPTIONS;

  return {
    roster: nationalRosterBundle?.allPokemonRoster || EMPTY_ROSTER,
    megaOptions: { ...nationalMegaOptions, ...MEGA_OPTIONS },
    loading: !nationalRosterBundle,
  };
}

export { championsRoster, MEGA_OPTIONS };
