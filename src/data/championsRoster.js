import { allPokemonRoster, championMegaOptionsById } from "./allPokemonRoster.js";

function toChampionEntry(entry) {
  return {
    ...entry,
    id: entry.championId || entry.id.replace(/^nat-/, ""),
    speed: entry.championSpeed ?? entry.speed,
  };
}

export const championsRoster = allPokemonRoster.filter((entry) => entry.isChampion).map(toChampionEntry);

export const MEGA_OPTIONS_BY_ID = championMegaOptionsById;

export const MEGA_OPTIONS = MEGA_OPTIONS_BY_ID;
