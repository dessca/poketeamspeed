import { allPokemonRoster, championMegaOptionsById } from "../src/data/allPokemonRoster.js";

const AVAILABLE_POKEMON_URL = "https://www.serebii.net/pokemonchampions/pokemon.shtml";

const FORM_SUFFIX_BY_FILE_SUFFIX = {
  a: "alola",
  g: "galar",
  h: "hisui",
};

const SPECIAL_FORM_BY_FILE = {
  "128-p": "paldea-combat",
  "670-e": "eternal",
};

function decodeHtml(value) {
  return value
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "E")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseAvailablePokemon(html) {
  const rowPattern =
    /#(?<dex>\d{4})\s*<\/td>[\s\S]*?<img src="(?<img>\/pokemonhome\/pokemon\/small\/[^"]+)"[^>]*alt="(?<alt>[^"]+)"[\s\S]*?<a href="\/pokedex-champions\/(?<slug>[^/]+)\/">(?<name>[^<]+)<br\s*\/><\/a>[\s\S]*?<td align="center" class="foo(?:info|ben|hin)">(?<types>[\s\S]*?)<\/td>/g;

  return [...html.matchAll(rowPattern)].map((match) => {
    const file = match.groups.img.split("/").pop().replace(/\.png$/, "");
    const types = [...match.groups.types.matchAll(/\/pokemon\/([^./]+)\.shtml/g)].map((typeMatch) => typeMatch[1]);

    return {
      dex: match.groups.dex,
      file,
      img: match.groups.img,
      name: decodeHtml(match.groups.name),
      slug: match.groups.slug,
      types,
    };
  });
}

function normalizeFormId(row) {
  const specialForm = SPECIAL_FORM_BY_FILE[row.file];
  if (specialForm) return `${row.dex}-${specialForm}`;

  const [, suffix] = row.file.match(/^\d+-([a-z]+)$/) || [];
  const form = FORM_SUFFIX_BY_FILE_SUFFIX[suffix];
  return form ? `${row.dex}-${form}` : row.dex;
}

function normalizeMegaKey(name) {
  if (name.endsWith(" X")) return "mega-x";
  if (name.endsWith(" Y")) return "mega-y";
  if (name.endsWith(" Z")) return "mega-z";
  return "mega";
}

function getBaseDexId(id) {
  return String(id).match(/^\d{4}/)?.[0] || "";
}

function formatList(items) {
  return items.length ? items.join("\n") : "(none)";
}

const response = await fetch(AVAILABLE_POKEMON_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch ${AVAILABLE_POKEMON_URL}: ${response.status}`);
}

const rows = parseAvailablePokemon(await response.text());
const normalRows = rows.filter((row) => !row.name.startsWith("Mega "));
const megaRows = rows.filter((row) => row.name.startsWith("Mega "));

const sourceNormalIds = new Set(normalRows.map(normalizeFormId));
const sourceNormalIdsByDex = [...sourceNormalIds].reduce((groups, sourceId) => {
  const dex = getBaseDexId(sourceId);
  groups.set(dex, [...(groups.get(dex) || []), sourceId]);
  return groups;
}, new Map());
const currentChampionEntries = allPokemonRoster.filter((entry) => entry.isChampion);
const currentNormalIds = new Set(currentChampionEntries.map((entry) => entry.championId || entry.id.replace(/^nat-/, "")));

function getMegaTargetId(row) {
  const dexNormalIds = sourceNormalIdsByDex.get(row.dex) || [];
  if (row.dex === "0670" && dexNormalIds.includes("0670-eternal")) return "0670-eternal";
  return row.dex;
}

const currentMegaIds = new Set(
  Object.entries(championMegaOptionsById).flatMap(([id, options]) =>
    options.map((option) => `${id}:${option.labelEn || option.label}:${option.key || normalizeMegaKey(option.labelEn || option.label)}`)
  )
);
const sourceMegaIds = new Set(
  megaRows.map((row) => `${getMegaTargetId(row)}:${row.name}:${normalizeMegaKey(row.name)}`)
);

const additions = [...sourceNormalIds].filter((id) => !currentNormalIds.has(id)).sort();
const removals = [...currentNormalIds].filter((id) => !sourceNormalIds.has(id)).sort();
const megaAdditions = [...sourceMegaIds].filter((id) => !currentMegaIds.has(id)).sort();
const megaRemovals = [...currentMegaIds].filter((id) => !sourceMegaIds.has(id)).sort();

console.log(`source normal: ${sourceNormalIds.size}`);
console.log(`current normal: ${currentNormalIds.size}`);
console.log(`source mega options: ${sourceMegaIds.size}`);
console.log(`current mega options: ${currentMegaIds.size}`);
console.log("");
console.log("normal additions");
console.log(formatList(additions));
console.log("");
console.log("normal removals");
console.log(formatList(removals));
console.log("");
console.log("mega additions");
console.log(formatList(megaAdditions));
console.log("");
console.log("mega removals");
console.log(formatList(megaRemovals));
