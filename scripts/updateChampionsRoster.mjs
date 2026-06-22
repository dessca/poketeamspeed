import { mkdir, writeFile } from "node:fs/promises";
import { allMegaOptionsById, allPokemonRoster, championMegaOptionsById } from "../src/data/allPokemonRoster.js";

const AVAILABLE_POKEMON_URL = "https://www.serebii.net/pokemonchampions/pokemon.shtml";
const POKEDEX_PAGE_URL = (slug) => `https://www.serebii.net/pokedex-champions/${slug}/`;
const OFFICIAL_ARTWORK = (dexNo) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNo}.png`;

const MEGA_PREFIX_KO = "\uBA54\uAC00";
const MEGA_PREFIX_JA = "\u30E1\u30AC";

const FORM_SUFFIX_BY_FILE_SUFFIX = {
  a: "alola",
  g: "galar",
  h: "hisui",
};

const SPECIAL_FORM_BY_FILE = {
  "128-p": {
    formKey: "paldea-combat",
  },
  "670-e": {
    formKey: "eternal",
    icon: OFFICIAL_ARTWORK(10061),
    nameEn: "Floette (Eternal Flower)",
    nameJa: "\u30D5\u30E9\u30A8\u30C3\u30C6 (\u3048\u3044\u3048\u3093\u306E\u306F\u306A)",
    nameKo: "\uD50C\uB77C\uC5E3\uD14C (\uC601\uC6D0\uC758 \uAF43)",
    statTitle: "Eternal Floette",
  },
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

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
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
      isMega: decodeHtml(match.groups.name).startsWith("Mega "),
      name: decodeHtml(match.groups.name),
      slug: match.groups.slug,
      types,
    };
  });
}

function normalizeFormId(row) {
  const specialForm = SPECIAL_FORM_BY_FILE[row.file];
  if (specialForm?.formKey) return `${row.dex}-${specialForm.formKey}`;

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

function megaSuffix(name) {
  const key = normalizeMegaKey(name);
  if (key === "mega-x") return " X";
  if (key === "mega-y") return " Y";
  if (key === "mega-z") return " Z";
  return "";
}

function entryChampionId(entry) {
  return entry.championId || entry.id.replace(/^nat-/, "");
}

function getBaseDexId(id) {
  return String(id).match(/^\d{4}/)?.[0] || "";
}

function findExistingMegaOption(row) {
  for (const options of Object.values(championMegaOptionsById)) {
    const existing = options.find((option) => (option.labelEn || option.label) === row.name);
    if (existing) return existing;
  }

  const officialOptions = allMegaOptionsById[`nat-${row.dex}`] || allMegaOptionsById[row.dex] || [];
  return officialOptions.find((option) => (option.labelEn || option.label) === row.name);
}

function parseStatsByTitle(html) {
  const statsByTitle = new Map();
  const statsPattern =
    /<h2>Stats - (?<title>[^<]*)<\/h2>[\s\S]*?Base Stats - Total: \d+<\/td>(?<cells>[\s\S]*?)<\/tr>/g;

  for (const match of html.matchAll(statsPattern)) {
    const values = [...match.groups.cells.matchAll(/<td align="center" class="fooinfo">(\d+)<\/td>/g)].map((cell) =>
      Number(cell[1])
    );
    if (values.length >= 6) {
      statsByTitle.set(decodeHtml(match.groups.title), {
        speed: values[5],
      });
    }
  }

  return statsByTitle;
}

const pokedexPageCache = new Map();

async function getStats(row, title) {
  if (!pokedexPageCache.has(row.slug)) {
    pokedexPageCache.set(row.slug, parseStatsByTitle(await fetchText(POKEDEX_PAGE_URL(row.slug))));
  }

  const statsByTitle = pokedexPageCache.get(row.slug);
  const stats = statsByTitle.get(title);
  if (!stats) {
    throw new Error(`Missing stats for ${title} on ${row.slug}`);
  }
  return stats;
}

function createCustomEntry(row, sourceId, baseEntry) {
  const specialForm = SPECIAL_FORM_BY_FILE[row.file];
  if (!specialForm?.formKey) {
    throw new Error(`No custom entry config for ${sourceId}`);
  }

  return {
    ...baseEntry,
    id: `nat-${sourceId}`,
    formKey: specialForm.formKey,
    speed: undefined,
    types: row.types,
    icon: specialForm.icon || baseEntry.icon,
  };
}

function applySpecialFormMetadata(row, entry) {
  const specialForm = SPECIAL_FORM_BY_FILE[row.file];
  if (!specialForm?.formKey) return entry;

  return {
    ...entry,
    formKey: specialForm.formKey,
    names: {
      ...entry.names,
      en: specialForm.nameEn || row.name,
      ko: specialForm.nameKo || `${entry.names.ko} (${specialForm.nameEn || row.name})`,
      ja: specialForm.nameJa || `${entry.names.ja} (${specialForm.nameEn || row.name})`,
    },
    types: row.types,
    icon: specialForm.icon || entry.icon,
  };
}

function updateChampionFields(entry, sourceId, row, speed) {
  const nextEntry = { ...entry };
  nextEntry.isChampion = true;
  nextEntry.championId = sourceId;
  if (Number.isFinite(speed) && speed !== entry.speed) {
    nextEntry.championSpeed = speed;
  } else {
    delete nextEntry.championSpeed;
  }
  if (row.types.length > 0) nextEntry.types = row.types;
  return nextEntry;
}

function sortRoster(a, b) {
  if (a.dexNo !== b.dexNo) return a.dexNo - b.dexNo;
  if (a.formKey === b.formKey) return a.id.localeCompare(b.id);
  if (a.formKey === "base") return -1;
  if (b.formKey === "base") return 1;
  return a.formKey.localeCompare(b.formKey);
}

const rows = parseAvailablePokemon(await fetchText(AVAILABLE_POKEMON_URL));
const normalRows = rows.filter((row) => !row.isMega);
const megaRows = rows.filter((row) => row.isMega);
const sourceNormalIds = new Set(normalRows.map(normalizeFormId));

const rosterById = new Map(
  allPokemonRoster.map((entry) => {
    const nextEntry = { ...entry };
    delete nextEntry.isChampion;
    delete nextEntry.championId;
    delete nextEntry.championSpeed;
    return [entry.id, nextEntry];
  })
);

for (const row of normalRows) {
  const sourceId = normalizeFormId(row);
  const rosterId = `nat-${sourceId}`;
  const baseEntry = rosterById.get(`nat-${row.dex}`);
  const existingEntry = rosterById.get(rosterId);
  let entry = existingEntry || createCustomEntry(row, sourceId, baseEntry);
  const specialForm = SPECIAL_FORM_BY_FILE[row.file];
  entry = applySpecialFormMetadata(row, entry);
  const speed = specialForm?.statTitle ? (await getStats(row, specialForm.statTitle)).speed : entry.speed;
  if (!existingEntry && Number.isFinite(speed)) {
    entry = { ...entry, speed };
  }
  rosterById.set(rosterId, updateChampionFields(entry, sourceId, row, speed));
}

const sourceNormalIdsByDex = [...sourceNormalIds].reduce((groups, sourceId) => {
  const dex = getBaseDexId(sourceId);
  groups.set(dex, [...(groups.get(dex) || []), sourceId]);
  return groups;
}, new Map());

function getMegaTargetId(row) {
  const dexNormalIds = sourceNormalIdsByDex.get(row.dex) || [];
  if (row.dex === "0670" && dexNormalIds.includes("0670-eternal")) return "0670-eternal";
  return row.dex;
}

const nextChampionMegaOptionsById = {};
for (const row of megaRows) {
  const targetId = getMegaTargetId(row);
  const existing = findExistingMegaOption(row);
  const key = normalizeMegaKey(row.name);
  const baseEntry = rosterById.get(`nat-${targetId}`) || rosterById.get(`nat-${row.dex}`);
  const speed = existing?.speed ?? (await getStats(row, row.name)).speed;
  const suffix = megaSuffix(row.name);
  const option = existing
    ? { ...existing, key, labelEn: row.name, speed }
    : {
        key,
        label: `${MEGA_PREFIX_KO}${baseEntry.names.ko}${suffix}`,
        labelEn: row.name,
        labelJa: `${MEGA_PREFIX_JA}${baseEntry.names.ja}${suffix}`,
        speed,
      };

  nextChampionMegaOptionsById[targetId] = [...(nextChampionMegaOptionsById[targetId] || []), option];
}

const roster = [...rosterById.values()].sort(sortRoster);
const content = `// Generated by scripts/generateAllPokemonRoster.mjs.
// Base species plus regional forms and official/custom Mega Evolution options.
// Champions flags and custom Champions Mega options can be refreshed with scripts/updateChampionsRoster.mjs.

export const allPokemonRoster = ${JSON.stringify(roster, null, 2)};

export const allMegaOptionsById = ${JSON.stringify(allMegaOptionsById, null, 2)};

export const championMegaOptionsById = ${JSON.stringify(nextChampionMegaOptionsById, null, 2)};
`;

await mkdir("src/data", { recursive: true });
await writeFile("src/data/allPokemonRoster.js", content, "utf8");

const nextChampionCount = roster.filter((entry) => entry.isChampion).length;
const nextMegaCount = Object.values(nextChampionMegaOptionsById).reduce((total, options) => total + options.length, 0);
console.log(`Updated ${nextChampionCount} Champions entries and ${nextMegaCount} Champions Mega options.`);
console.log(`Removed Champions flags from ${allPokemonRoster.filter((entry) => entry.isChampion && !sourceNormalIds.has(entryChampionId(entry))).length} entries.`);
console.log(`Added Champions flags to ${normalRows.filter((row) => !allPokemonRoster.some((entry) => entryChampionId(entry) === normalizeFormId(row) && entry.isChampion)).length} entries.`);
