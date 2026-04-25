import { mkdir, writeFile } from "node:fs/promises";

const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species?limit=2000";
const OFFICIAL_ARTWORK = (dexNo) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNo}.png`;

const toDexId = (dexNo) => String(dexNo).padStart(4, "0");

const REGIONAL_FORM_CONFIGS = [
  {
    test: (name) => name.endsWith("-alola"),
    formKey: () => "alola",
    ko: (name) => `알로라 ${name}`,
    en: (name) => `Alolan ${name}`,
    ja: (name) => `アローラ ${name}`,
  },
  {
    test: (name) => name.endsWith("-galar") || name.endsWith("-galar-standard"),
    formKey: () => "galar",
    ko: (name) => `가라르 ${name}`,
    en: (name) => `Galarian ${name}`,
    ja: (name) => `ガラル ${name}`,
  },
  {
    test: (name) => name.endsWith("-hisui"),
    formKey: () => "hisui",
    ko: (name) => `히스이 ${name}`,
    en: (name) => `Hisuian ${name}`,
    ja: (name) => `ヒスイ ${name}`,
  },
  {
    test: (name) => name.endsWith("-paldea"),
    formKey: () => "paldea",
    ko: (name) => `팔데아 ${name}`,
    en: (name) => `Paldean ${name}`,
    ja: (name) => `パルデア ${name}`,
  },
  {
    test: (name) => name === "tauros-paldea-combat-breed",
    formKey: () => "paldea-combat",
    ko: () => "팔데아 컴뱃종 켄타로스",
    en: () => "Tauros (Paldean Combat Breed)",
    ja: () => "ケンタロス(パルデア・コンバット種)",
  },
  {
    test: (name) => name === "tauros-paldea-blaze-breed",
    formKey: () => "paldea-blaze",
    ko: () => "팔데아 블레이즈종 켄타로스",
    en: () => "Tauros (Paldean Blaze Breed)",
    ja: () => "ケンタロス(パルデア・ブレイズ種)",
  },
  {
    test: (name) => name === "tauros-paldea-aqua-breed",
    formKey: () => "paldea-water",
    ko: () => "팔데아 워터종 켄타로스",
    en: () => "Tauros (Paldean Aqua Breed)",
    ja: () => "ケンタロス(パルデア・ウォーター種)",
  },
  {
    test: (name) => name === "basculin-white-striped",
    formKey: () => "hisui",
    ko: (name) => `히스이 ${name}`,
    en: (name) => `Hisuian ${name}`,
    ja: (name) => `ヒスイ ${name}`,
  },
];

function pickName(names, language) {
  return names.find((entry) => entry.language.name === language)?.name || "";
}

function getIdFromUrl(url) {
  const match = String(url).match(/\/pokemon-species\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

function getMegaKey(pokemonName) {
  if (pokemonName.endsWith("-mega-x")) return "mega-x";
  if (pokemonName.endsWith("-mega-y")) return "mega-y";
  if (pokemonName.endsWith("-mega-z")) return "mega-z";
  if (pokemonName.includes("-mega")) return "mega";
  return null;
}

function getMegaSuffix(key) {
  if (key === "mega-x") return "X";
  if (key === "mega-y") return "Y";
  if (key === "mega-z") return "Z";
  return "";
}

function getRegionalFormConfig(pokemonName) {
  if (pokemonName.includes("-totem")) return null;
  return REGIONAL_FORM_CONFIGS.find((config) => config.test(pokemonName)) || null;
}

function getRegionalFormKey(pokemonName) {
  return getRegionalFormConfig(pokemonName)?.formKey(pokemonName) || "";
}

function createRegionalFormNames(config, names) {
  return {
    ko: config.ko(names.ko),
    en: config.en(names.en),
    ja: config.ja(names.ja),
  };
}

async function loadExistingCuratedData() {
  try {
    const existing = await import(`../src/data/allPokemonRoster.js?refresh=${Date.now()}`);
    const isCuratedForm = (entry) =>
      entry.isChampion ||
      entry.championId ||
      entry.championSpeed !== undefined ||
      String(entry.icon || "").startsWith("/pokemon-icons/");
    const curatedById = new Map(
      existing.allPokemonRoster
        .filter((entry) => entry.isChampion || entry.championId || entry.championSpeed !== undefined)
        .map((entry) => [entry.id, entry])
    );
    const curatedForms = existing.allPokemonRoster.filter((entry) => entry.formKey !== "base" && isCuratedForm(entry));

    return {
      curatedById,
      curatedForms,
      championMegaOptionsById: existing.championMegaOptionsById || {},
    };
  } catch {
    return {
      curatedById: new Map(),
      curatedForms: [],
      championMegaOptionsById: {},
    };
  }
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index], index);
      }
    })
  );

  return results;
}

const existingCuratedData = await loadExistingCuratedData();
const speciesList = await fetchJson(SPECIES_URL);
const speciesRefs = speciesList.results
  .map((entry) => ({ ...entry, dexNo: getIdFromUrl(entry.url) }))
  .filter((entry) => Number.isInteger(entry.dexNo))
  .sort((a, b) => a.dexNo - b.dexNo);

const speciesPayloads = await mapConcurrent(speciesRefs, 12, async (entry) => {
  const [species, pokemon] = await Promise.all([
    fetchJson(entry.url),
    fetchJson(`https://pokeapi.co/api/v2/pokemon/${entry.dexNo}`),
  ]);

  const speed = pokemon.stats.find((stat) => stat.stat.name === "speed")?.base_stat;
  if (!Number.isFinite(speed)) return null;

  const englishName = pickName(species.names, "en") || pokemon.name;
  const koreanName = pickName(species.names, "ko") || englishName;
  const japaneseName = pickName(species.names, "ja-Hrkt") || pickName(species.names, "ja") || englishName;

  const baseEntry = {
    id: `nat-${toDexId(entry.dexNo)}`,
    dexNo: entry.dexNo,
    formKey: "base",
    names: {
      ko: koreanName,
      en: englishName,
      ja: japaneseName,
    },
    speed,
    icon: OFFICIAL_ARTWORK(entry.dexNo),
  };

  const regionalVarieties = species.varieties.filter((variety) => getRegionalFormConfig(variety.pokemon.name));
  const regionalForms = await mapConcurrent(regionalVarieties, 4, async (variety) => {
    const config = getRegionalFormConfig(variety.pokemon.name);
    const formKey = getRegionalFormKey(variety.pokemon.name);
    if (!config || !formKey) return null;

    const formPokemon = await fetchJson(variety.pokemon.url);
    const formSpeed = formPokemon.stats.find((stat) => stat.stat.name === "speed")?.base_stat;
    if (!Number.isFinite(formSpeed)) return null;

    return {
      id: `nat-${toDexId(entry.dexNo)}-${formKey}`,
      dexNo: entry.dexNo,
      formKey,
      names: createRegionalFormNames(config, baseEntry.names),
      speed: formSpeed,
      icon: OFFICIAL_ARTWORK(formPokemon.id),
    };
  });

  const megaVarieties = species.varieties.filter((variety) => getMegaKey(variety.pokemon.name));
  const megaOptions = await mapConcurrent(megaVarieties, 4, async (variety) => {
    const key = getMegaKey(variety.pokemon.name);
    const suffix = getMegaSuffix(key);
    const megaPokemon = await fetchJson(variety.pokemon.url);
    const megaSpeed = megaPokemon.stats.find((stat) => stat.stat.name === "speed")?.base_stat;
    if (!Number.isFinite(megaSpeed)) return null;

    return {
      key,
      label: `메가${koreanName}${suffix}`,
      labelEn: `Mega ${englishName}${suffix ? ` ${suffix}` : ""}`,
      labelJa: `メガ${japaneseName}${suffix}`,
      speed: megaSpeed,
      icon: OFFICIAL_ARTWORK(megaPokemon.id),
    };
  });

  return {
    entry: baseEntry,
    regionalForms: regionalForms.filter(Boolean),
    megaOptions: megaOptions.filter(Boolean),
  };
});

const generatedRegionalForms = speciesPayloads.flatMap((payload) => payload?.regionalForms || []);
const curatedFormIds = new Set(existingCuratedData.curatedForms.map((entry) => entry.id));

const roster = [
  ...speciesPayloads
    .map((payload) => payload?.entry)
    .filter(Boolean)
    .map((entry) => {
      const curated = existingCuratedData.curatedById.get(entry.id);
      if (!curated) return entry;

      return {
        ...entry,
        ...(curated.isChampion ? { isChampion: true } : {}),
        ...(curated.championId ? { championId: curated.championId } : {}),
        ...(curated.championSpeed !== undefined ? { championSpeed: curated.championSpeed } : {}),
      };
    }),
  ...generatedRegionalForms.filter((entry) => !curatedFormIds.has(entry.id)),
  ...existingCuratedData.curatedForms,
].sort((a, b) => {
  if (a.dexNo !== b.dexNo) return a.dexNo - b.dexNo;
  if (a.formKey === b.formKey) return a.id.localeCompare(b.id);
  if (a.formKey === "base") return -1;
  if (b.formKey === "base") return 1;
  return a.formKey.localeCompare(b.formKey);
});
const allMegaOptionsById = Object.fromEntries(
  speciesPayloads
    .filter((payload) => payload?.entry && payload.megaOptions.length > 0)
    .map((payload) => [payload.entry.id, payload.megaOptions])
);
const content = `// Generated by scripts/generateAllPokemonRoster.mjs.
// Base species plus regional forms and official/custom Mega Evolution options.

export const allPokemonRoster = ${JSON.stringify(roster, null, 2)};

export const allMegaOptionsById = ${JSON.stringify(allMegaOptionsById, null, 2)};

export const championMegaOptionsById = ${JSON.stringify(existingCuratedData.championMegaOptionsById, null, 2)};
`;

await mkdir("src/data", { recursive: true });
await writeFile("src/data/allPokemonRoster.js", content, "utf8");

console.log(`Generated ${roster.length} Pokemon entries and ${Object.keys(allMegaOptionsById).length} Mega-capable species.`);
