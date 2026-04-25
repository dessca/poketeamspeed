import { championsRoster, MEGA_OPTIONS_BY_ID } from "../data/championsRoster";
import {
  getEntityNames,
  getLocalizedMegaLabel,
  getLocalizedOptionHelp,
  getLocalizedOptionLabel,
  pickLocalizedText,
} from "./localization";

export const NATURE_OPTIONS = [
  { key: "slow", labelKo: "×0.9", labelEn: "×0.9", labelJa: "×0.9", values: [0.9] },
  { key: "neutral", labelKo: "×1.0", labelEn: "×1.0", labelJa: "×1.0", values: [1] },
  { key: "fast", labelKo: "×1.1", labelEn: "×1.1", labelJa: "×1.1", values: [1.1] },
  { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", values: [0.9, 1, 1.1] },
];

export const ITEMS = {
  none: { labelKo: "없음", labelEn: "None", labelJa: "なし", values: [1], point: 1 },
  scarf: { labelKo: "구애스카프", labelEn: "Scarf", labelJa: "こだわりスカーフ", values: [1.5], point: 1.5 },
  unknown: { labelKo: "모름", labelEn: "Unknown", labelJa: "不明", values: [1, 1.5], point: 1 },
};

const UNBURDEN_ABILITY_OPTION = {
  key: "unburden",
  labelKo: "곡예",
  labelEn: "Unburden",
  labelJa: "かるわざ",
  multiplier: 2,
  helpKo: "지닌 도구를 잃은 뒤 스피드 x2",
  helpEn: "Speed doubles after the held item is consumed or lost.",
  helpJa: "持ち物がなくなると素早さが2倍になります。",
};

const SPEED_ABILITY_OPTIONS = {
  swiftSwim: {
    key: "swift-swim",
    labelKo: "쓱쓱",
    labelEn: "Swift Swim",
    labelJa: "すいすい",
    multiplier: 2,
    helpKo: "비가 올 때 스피드 x2",
    helpEn: "Speed doubles during rain.",
    helpJa: "雨のとき、素早さが2倍になります。",
  },
  chlorophyll: {
    key: "chlorophyll",
    labelKo: "엽록소",
    labelEn: "Chlorophyll",
    labelJa: "ようりょくそ",
    multiplier: 2,
    helpKo: "날씨가 쾌청일 때 스피드 x2",
    helpEn: "Speed doubles in harsh sunlight.",
    helpJa: "にほんばれのとき、素早さが2倍になります。",
  },
  sandRush: {
    key: "sand-rush",
    labelKo: "모래헤치기",
    labelEn: "Sand Rush",
    labelJa: "すなかき",
    multiplier: 2,
    helpKo: "날씨가 모래바람일 때 스피드 x2",
    helpEn: "Speed doubles during a sandstorm.",
    helpJa: "すなあらしのとき、素早さが2倍になります。",
  },
  slushRush: {
    key: "slush-rush",
    labelKo: "눈치우기",
    labelEn: "Slush Rush",
    labelJa: "ゆきかき",
    multiplier: 2,
    helpKo: "눈일 때 스피드 x2",
    helpEn: "Speed doubles during snow.",
    helpJa: "雪のとき、素早さが2倍になります。",
  },
  quickFeet: {
    key: "quick-feet",
    labelKo: "속보",
    labelEn: "Quick Feet",
    labelJa: "はやあし",
    multiplier: 1.5,
    helpKo: "상태이상일 때 스피드 x1.5",
    helpEn: "Speed is multiplied by 1.5 while affected by a status condition.",
    helpJa: "状態異常のとき、素早さが1.5倍になります。",
  },
  slowStart: {
    key: "slow-start",
    labelKo: "슬로스타트",
    labelEn: "Slow Start",
    labelJa: "スロースタート",
    multiplier: 0.5,
    helpKo: "등장 후 5턴 동안 스피드 x0.5",
    helpEn: "Speed is halved for five turns after entering battle.",
    helpJa: "登場してから5ターンの間、素早さが半分になります。",
  },
};

const createSpeedAbilityOptions = (fallbackAbility, speedAbility) => createMultiSpeedAbilityOptions(fallbackAbility, [speedAbility]);

const createMultiSpeedAbilityOptions = (fallbackAbility, speedAbilities) => [
  fallbackAbility,
  ...speedAbilities,
  { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, ...speedAbilities.map((ability) => ability.multiplier)] },
];

const createUnburdenAbilityOptions = (fallbackAbility) => createSpeedAbilityOptions(fallbackAbility, UNBURDEN_ABILITY_OPTION);
const NO_SPEED_ABILITY = { key: "none", labelKo: "보정 없음", labelEn: "No boost", labelJa: "補正なし", multiplier: 1 };

export const ABILITY_OPTIONS_BY_NAME = {
  이상해꽃: [
    { key: "none", labelKo: "심록", labelEn: "Overgrow", labelJa: "しんりょく", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", labelJa: "ようりょくそ", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight.", helpJa: "にほんばれのとき、素早さが2倍になります。" },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, 2] },
  ],
  샤크니아: [
    { key: "none", labelKo: "거친피부", labelEn: "Rough Skin", labelJa: "さめはだ", multiplier: 1 },
    {
      key: "speed-boost",
      labelKo: "가속",
      labelEn: "Speed Boost",
      labelJa: "かそく",
      multiplier: 1.5,
      helpKo: "턴 종료마다 스피드가 1랭크 오르며, 이 도구에서는 1랭크 기준 x1.5로 계산합니다.",
      helpEn: "Raises Speed by one stage at the end of each turn. This tool models it as x1.5.",
      helpJa: "ターン終了ごとに素早さが1段階上がり、このツールでは1段階を x1.5 として計算します。",
    },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, 1.5] },
  ],
  몰드류: [
    { key: "none", labelKo: "틀깨기", labelEn: "Mold Breaker", labelJa: "かたやぶり", multiplier: 1 },
    { key: "sand-rush", labelKo: "모래헤치기", labelEn: "Sand Rush", labelJa: "すなかき", multiplier: 2, helpKo: "날씨가 모래바람일 때 스피드 x2", helpEn: "Speed doubles during a sandstorm.", helpJa: "すなあらしのとき、素早さが2倍になります。" },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, 2] },
  ],
  엘풍: [
    { key: "none", labelKo: "짓궂은마음", labelEn: "Prankster", labelJa: "いたずらごころ", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", labelJa: "ようりょくそ", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight.", helpJa: "にほんばれのとき、素早さが2倍になります。" },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, 2] },
  ],
  스코빌런: [
    { key: "none", labelKo: "불면", labelEn: "Insomnia", labelJa: "ふみん", multiplier: 1 },
    { key: "chlorophyll", labelKo: "엽록소", labelEn: "Chlorophyll", labelJa: "ようりょくそ", multiplier: 2, helpKo: "날씨가 쾌청일 때 스피드 x2", helpEn: "Speed doubles in harsh sunlight.", helpJa: "にほんばれのとき、素早さが2倍になります。" },
    { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1, 2] },
  ],
  골덕: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  강챙이: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  쏘드라: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  왕콘치: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  잉어킹: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  암스타: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  투구푸스: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  침바루: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  만타인: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  킹드라: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  대짱이: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  로파파: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  비구술: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  아말도: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  빈티나: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  헌테일: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  분홍장이: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  시라칸: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  사랑동이: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  플로젤: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  네오라이트: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  두빅굴: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  늑골라: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  툰베어: createMultiSpeedAbilityOptions(NO_SPEED_ABILITY, [SPEED_ABILITY_OPTIONS.swiftSwim, SPEED_ABILITY_OPTIONS.slushRush]),
  갈가부기: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  꼬치조: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  대쓰여너: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  장침바루: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  라플레시아: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  우츠보트: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  나시: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  아르코: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  솜솜코: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  해루미: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  다탱구: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  트로피우스: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  체리버: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  덩쿠림보: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  리피아: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  모아머: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  드레디어: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  마라카치: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  바라철록: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  고지: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  "알로라 고지": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slushRush),
  "알로라 모래두지": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slushRush),
  하데리어: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  바랜드: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  루가루암: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  "루가루암(황혼)": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  "루가루암(한낮)": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  "루가루암(한밤)": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  파치래곤: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  어래곤: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  묘두기: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.sandRush),
  파치르돈: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slushRush),
  어치르돈: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slushRush),
  우락고래: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slushRush),
  "히스이 드레디어": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.chlorophyll),
  "히스이 침바루": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
  시라소몬: createUnburdenAbilityOptions({ key: "none", labelKo: "이판사판", labelEn: "Reckless", labelJa: "すてみ", multiplier: 1 }),
  나무지기: createUnburdenAbilityOptions({ key: "none", labelKo: "심록", labelEn: "Overgrow", labelJa: "しんりょく", multiplier: 1 }),
  나무돌이: createUnburdenAbilityOptions({ key: "none", labelKo: "심록", labelEn: "Overgrow", labelJa: "しんりょく", multiplier: 1 }),
  나무킹: createUnburdenAbilityOptions({ key: "none", labelKo: "심록", labelEn: "Overgrow", labelJa: "しんりょく", multiplier: 1 }),
  흔들풍손: createUnburdenAbilityOptions({ key: "none", labelKo: "유폭", labelEn: "Aftermath", labelJa: "ゆうばく", multiplier: 1 }),
  둥실라이드: createUnburdenAbilityOptions({ key: "none", labelKo: "유폭", labelEn: "Aftermath", labelJa: "ゆうばく", multiplier: 1 }),
  쌔비냥: createUnburdenAbilityOptions({ key: "none", labelKo: "유연", labelEn: "Limber", labelJa: "じゅうなん", multiplier: 1 }),
  레파르다스: createUnburdenAbilityOptions({ key: "none", labelKo: "유연", labelEn: "Limber", labelJa: "じゅうなん", multiplier: 1 }),
  어지리더: createUnburdenAbilityOptions({ key: "none", labelKo: "촉촉바디", labelEn: "Hydration", labelJa: "うるおいボディ", multiplier: 1 }),
  나룸퍼프: createUnburdenAbilityOptions({ key: "none", labelKo: "스위트베일", labelEn: "Sweet Veil", labelJa: "スイートベール", multiplier: 1 }),
  나루림: createUnburdenAbilityOptions({ key: "none", labelKo: "스위트베일", labelEn: "Sweet Veil", labelJa: "スイートベール", multiplier: 1 }),
  루차불: createUnburdenAbilityOptions({ key: "none", labelKo: "유연", labelEn: "Limber", labelJa: "じゅうなん", multiplier: 1 }),
  폭슬라이: createUnburdenAbilityOptions({ key: "none", labelKo: "도주", labelEn: "Run Away", labelJa: "にげあし", multiplier: 1 }),
  포푸니크: createUnburdenAbilityOptions({ key: "none", labelKo: "프레셔", labelEn: "Pressure", labelJa: "プレッシャー", multiplier: 1 }),
  태깅구르: createUnburdenAbilityOptions({ key: "none", labelKo: "독수", labelEn: "Poison Touch", labelJa: "どくしゅ", multiplier: 1 }),
  쥬피썬더: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  그랑블루: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  깜지곰: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  링곰: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  그라에나: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  지그제구리: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  직구리: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  "가라르 지그제구리": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  "가라르 직구리": createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  버섯꼬: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  펜드라: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.quickFeet),
  레지기가스: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.slowStart),
  메가대짱이: createSpeedAbilityOptions(NO_SPEED_ABILITY, SPEED_ABILITY_OPTIONS.swiftSwim),
};

const MEGA_SPEED_ABILITY_BLOCKED_LABELS = new Set(["메가이상해꽃", "메가샤크니아"]);

export const DEFAULT_ABILITY_OPTIONS = [
  { key: "none", labelKo: "보정 없음", labelEn: "No boost", labelJa: "補正なし", multiplier: 1 },
  { key: "unknown", labelKo: "모름", labelEn: "Unknown", labelJa: "不明", multiplier: 1, values: [1] },
];

export const CANONICAL_MEGA_ART = {
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
  메가눈여아: "https://static.rotomlabs.net/images/official-artwork/0478-froslass-mega.webp",
};

const CANONICAL_MEGA_ART_BY_EN = {
  "Mega Clefable": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10278.png",
  "Mega Victreebel": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10279.png",
  "Mega Starmie": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10280.png",
  "Mega Dragonite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10281.png",
  "Mega Meganium": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10282.png",
  "Mega Feraligatr": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10283.png",
  "Mega Skarmory": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10284.png",
  "Mega Chimecho": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10306.png",
  "Mega Emboar": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10286.png",
  "Mega Excadrill": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10287.png",
  "Mega Chandelure": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10291.png",
  "Mega Golurk": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10313.png",
  "Mega Chesnaught": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10292.png",
  "Mega Delphox": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10293.png",
  "Mega Greninja": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10294.png",
  "Mega Floette": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10296.png",
  "Mega Meowstic": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10314.png",
  "Mega Hawlucha": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10300.png",
  "Mega Crabominable": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10315.png",
  "Mega Scovillain": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10320.png",
  "Mega Glimmora": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10321.png",
};

export function getMegaArt(mega) {
  if (!mega) return "";
  return mega.icon || CANONICAL_MEGA_ART[mega.label] || CANONICAL_MEGA_ART_BY_EN[mega.labelEn] || "";
}

export function slotHasPokemon(slot) {
  return Boolean(slot.name && slot.baseSpeed);
}

function getStatPointFormulaTerm(statPoints) {
  return statPoints * 2;
}

function level50Speed(baseSpeed, statPoints, natureFactor) {
  const raw = Math.floor(((baseSpeed * 2 + 31 + getStatPointFormulaTerm(statPoints)) * 50) / 100 + 5);
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
  if (factor === 1.5) {
    return pickLocalizedText(language, {
      ko: "구애스카프",
      en: "Choice Scarf",
      ja: "こだわりスカーフ",
    });
  }
  return pickLocalizedText(language, {
    ko: "구애스카프 미착용",
    en: "No Choice Scarf applied",
    ja: "こだわりスカーフ未適用",
  });
}

function getAbilityLabelFromFactor(factor, slot, language = "ko", battleState = null) {
  if (factor === 1) {
    return pickLocalizedText(language, {
      ko: "특성 미적용",
      en: "No Speed ability applied",
      ja: "素早さ特性未適用",
    });
  }
  const matched = getAbilityOptions(slot, battleState).find((option) => option.multiplier === factor && option.key !== "unknown");
  if (matched) {
    const label = getLocalizedOptionLabel(matched, language);
    return pickLocalizedText(language, {
      ko: `특성 ${label}`,
      en: `Ability ${label}`,
      ja: `特性 ${label}`,
    });
  }
  return pickLocalizedText(language, {
    ko: "특성 발동",
    en: "Ability activated",
    ja: "特性発動",
  });
}

function getNatureLabelFromFactor(factor, language = "ko") {
  if (factor === 0.9) return pickLocalizedText(language, { ko: "성격 x0.9", en: "Nature x0.9", ja: "せいかく x0.9" });
  if (factor === 1.1) return pickLocalizedText(language, { ko: "성격 x1.1", en: "Nature x1.1", ja: "せいかく x1.1" });
  return pickLocalizedText(language, { ko: "성격 x1.0", en: "Nature x1.0", ja: "せいかく x1.0" });
}

export function summarizeTooltipLines(lines, language = "ko", maxLines = 4) {
  const unique = [...new Set(lines.filter(Boolean))];
  if (unique.length <= maxLines) return unique;
  return [
    ...unique.slice(0, maxLines),
    pickLocalizedText(language, {
      ko: `외 ${unique.length - maxLines}가지 경우`,
      en: `+${unique.length - maxLines} more cases`,
      ja: `ほか ${unique.length - maxLines} 件`,
    }),
  ];
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
    pickLocalizedText(language, {
      ko: `포인트 ${ev} · ${getNatureLabelFromFactor(natureFactor, language)}`,
      en: `Points ${ev} · ${getNatureLabelFromFactor(natureFactor, language)}`,
      ja: `ポイント ${ev} · ${getNatureLabelFromFactor(natureFactor, language)}`,
    }),
    pickLocalizedText(language, {
      ko: `기본 실수치 ${baseStat}`,
      en: `Base Speed stat ${baseStat}`,
      ja: `基本実数値 ${baseStat}`,
    }),
  ];

  if (itemFactor !== 1) labels.push(getItemLabelFromFactor(itemFactor, language));
  if (abilityFactor !== 1) labels.push(getAbilityLabelFromFactor(abilityFactor, slot, language, battleState));

  if (battleState) {
    if (battleState.mega) labels.push(pickLocalizedText(language, { ko: "메가진화", en: "Mega Evolution", ja: "メガシンカ" }));
    if (battleState.tailwind) labels.push(pickLocalizedText(language, { ko: "순풍", en: "Tailwind", ja: "おいかぜ" }));
    if (battleState.paralysis) labels.push(pickLocalizedText(language, { ko: "마비", en: "Paralysis", ja: "まひ" }));
    if (battleState.rank !== 0) labels.push(pickLocalizedText(language, { ko: `랭크 ${battleState.rank}`, en: `Stage ${battleState.rank}`, ja: `ランク ${battleState.rank}` }));
  }

  return labels.join(" · ");
}

function formatPointSummary(slot, baseSpeed, battleState, language = "ko") {
  const item = ITEMS[slot.itemSetting] || ITEMS.none;
  const pointItemFactor = slot.itemSetting === "unknown" ? 1 : item.point;
  const pointAbilityFactor = getPointAbilityFactor(slot, battleState);
  const itemLabel = getItemLabelFromFactor(pointItemFactor, language);
  const abilityLabel = getAbilityLabelFromFactor(pointAbilityFactor, slot, language, battleState);
  const battleLabels = [];
  if (battleState) {
    if (battleState.mega) battleLabels.push(pickLocalizedText(language, { ko: "메가진화", en: "Mega Evolution", ja: "メガシンカ" }));
    if (battleState.ability && canActivateBattleAbility(slot, battleState)) battleLabels.push(pickLocalizedText(language, { ko: "특성 발동", en: "Ability active", ja: "特性発動" }));
    if (battleState.tailwind) battleLabels.push(pickLocalizedText(language, { ko: "순풍", en: "Tailwind", ja: "おいかぜ" }));
    if (battleState.paralysis) battleLabels.push(pickLocalizedText(language, { ko: "마비", en: "Paralysis", ja: "まひ" }));
    if (battleState.rank !== 0) battleLabels.push(pickLocalizedText(language, { ko: `랭크 ${battleState.rank}`, en: `Stage ${battleState.rank}`, ja: `ランク ${battleState.rank}` }));
  }

  return [
    `${itemLabel} / ${abilityLabel}`,
    pickLocalizedText(language, {
      ko: `무보정 ${level50Speed(baseSpeed, 0, 1)} · 준속 ${level50Speed(baseSpeed, 32, 1)} · 최속 ${level50Speed(baseSpeed, 32, 1.1)}`,
      en: `Unboosted ${level50Speed(baseSpeed, 0, 1)} · Neutral ${level50Speed(baseSpeed, 32, 1)} · Max ${level50Speed(baseSpeed, 32, 1.1)}`,
      ja: `無補正 ${level50Speed(baseSpeed, 0, 1)} · 準速 ${level50Speed(baseSpeed, 32, 1)} · 最速 ${level50Speed(baseSpeed, 32, 1.1)}`,
    }),
    battleLabels.length ? battleLabels.join(", ") : pickLocalizedText(language, { ko: "현재 확정 구간", en: "Currently confirmed range", ja: "現在確定している範囲" }),
  ];
}

function formatPointRangeSummary(slot, baseSpeed, battleState, language = "ko") {
  const pointSummary = formatPointSummary(slot, baseSpeed, battleState, language);
  return summarizeTooltipLines(pointSummary, language);
}

function getBattleSummaryLabels(slot, battleState, abilityFactor, language = "ko") {
  if (!battleState) return [];

  const labels = [];
  if (battleState.mega) labels.push(pickLocalizedText(language, { ko: "메가진화", en: "Mega Evolution", ja: "メガシンカ" }));
  if (battleState.ability && abilityFactor !== 1) {
    labels.push(pickLocalizedText(language, { ko: "특성 발동", en: "Ability active", ja: "特性発動" }));
  }
  if (battleState.tailwind) labels.push(pickLocalizedText(language, { ko: "순풍", en: "Tailwind", ja: "おいかぜ" }));
  if (battleState.paralysis) labels.push(pickLocalizedText(language, { ko: "마비", en: "Paralysis", ja: "まひ" }));
  if (battleState.rank !== 0) labels.push(pickLocalizedText(language, { ko: `랭크 ${battleState.rank}`, en: `Stage ${battleState.rank}`, ja: `ランク ${battleState.rank}` }));
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

export function getGraphSegmentRenderPriority(segment) {
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

export function getGraphBarHeight(uncertaintyCount, segmentKind, tone = "neutral") {
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

export function formatRange(min, max) {
  return min === max ? `${min}` : `${min}~${max}`;
}

function formatLayerSummary(title, slot, itemFactor, abilityFactor, branches, battleState, language = "ko") {
  const natureLine = branches
    .map((branch) => `${getNatureLabelFromFactor(branch.natureFactor, language)} ${formatRange(branch.min, branch.max)}`)
    .join(
      pickLocalizedText(language, {
        ko: " · ",
        en: " | ",
        ja: " ・ ",
      })
    );

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
    tooltip: formatLayerSummary(
      pickLocalizedText(language, {
        ko: titleKo,
        en: titleEn,
        ja: titleEn,
      }),
      slot,
      itemFactor,
      abilityFactor,
      range.branches,
      battleState,
      language
    ),
  };
}

const CHAMPION_ENTRY_BY_NAME = new Map(
  championsRoster.flatMap((entry) => Object.values(getEntityNames(entry)).filter(Boolean).map((name) => [name, entry]))
);

function getPotentialAbilityFactors(slot, battleState = null) {
  const selectedAbility = getSelectedAbility(slot, battleState);
  const modifyingFactors = [...new Set(getAbilityValues(slot, battleState).filter((value) => value !== 1))];

  if (!modifyingFactors.length) return [];
  if (slot.abilitySetting !== "unknown") {
    if (selectedAbility.multiplier === 1) return [];
    return [selectedAbility.multiplier];
  }

  return modifyingFactors;
}

export function getMegaChoices(slot) {
  const rosterId = slot.rosterId || CHAMPION_ENTRY_BY_NAME.get(slot.name)?.id;
  return MEGA_OPTIONS_BY_ID[rosterId] || [];
}

export function getCompareMegaChoices(slot) {
  const choices = getMegaChoices(slot);
  if (slot.megaChoice === "") return [];
  if (slot.megaChoice === "unknown") return choices;
  return choices.filter((option) => option.key === slot.megaChoice);
}

export function getSelectedMega(slot) {
  const options = getMegaChoices(slot);
  if (slot.megaChoice === "unknown") return null;
  return options.find((option) => option.key === slot.megaChoice) || null;
}

function getAbilityLookupName(slot, battleState = null) {
  if (slot?.abilityOptionName) return slot.abilityOptionName;
  if (battleState?.mega) return getSelectedMega(slot)?.label || slot.name;
  return slot.name;
}

export function getAbilityOptions(slot, battleState = null) {
  return ABILITY_OPTIONS_BY_NAME[getAbilityLookupName(slot, battleState)] || DEFAULT_ABILITY_OPTIONS;
}

export function hasSpeedAbilityOptions(slot, battleState = null) {
  return Boolean(ABILITY_OPTIONS_BY_NAME[getAbilityLookupName(slot, battleState)]);
}

function getSelectedAbility(slot, battleState = null) {
  const options = getAbilityOptions(slot, battleState);
  return options.find((option) => option.key === slot.abilitySetting) || options[0];
}

function getAbilityValues(slot, battleState = null) {
  const selected = getSelectedAbility(slot, battleState);
  return selected.values || [selected.multiplier];
}

function megaBlocksSpeedAbility(slot, battleState = null) {
  if (!battleState?.mega) return false;
  const mega = getSelectedMega(slot);
  return Boolean(mega && MEGA_SPEED_ABILITY_BLOCKED_LABELS.has(mega.label));
}

export function canActivateBattleAbility(slot, battleState = null) {
  const selected = getSelectedAbility(slot, battleState);
  return selected.multiplier !== 1 && !megaBlocksSpeedAbility(slot, battleState);
}

function getPointAbilityFactor(slot, battleState = null) {
  const selected = getSelectedAbility(slot, battleState);

  if (!battleState) {
    return slot.abilitySetting === "unknown" ? 1 : selected.multiplier;
  }

  if (slot.abilitySetting === "unknown") return 1;
  if (!canActivateBattleAbility(slot, battleState)) return 1;
  return battleState.ability ? selected.multiplier : 1;
}

function getMarkerAbilityValues(slot, battleState = null) {
  const selected = getSelectedAbility(slot, battleState);

  if (!battleState) {
    return slot.abilitySetting === "unknown" ? getAbilityValues(slot, battleState) : [selected.multiplier];
  }

  if (!canActivateBattleAbility(slot, battleState)) return [1];

  if (slot.abilitySetting === "unknown") {
    const modifyingValues = getAbilityValues(slot, battleState).filter((value) => value !== 1);
    return battleState.ability ? modifyingValues : [1, ...modifyingValues];
  }

  return [battleState.ability ? selected.multiplier : 1];
}

export function getAbilityHelpText(slot, language, fallbackText, battleState = null) {
  const selected = getSelectedAbility(slot, battleState);
  return getLocalizedOptionHelp(selected, language, fallbackText);
}

export function getDisplayIcon(slot, megaActive = false) {
  if (!megaActive) return slot.icon;
  const mega = getSelectedMega(slot);
  if (!mega) return slot.icon;
  return getMegaArt(mega) || slot.icon;
}

export function buildGraph(slot, baseSpeed, battleState = null, language = "ko") {
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

export function getGraphPriorityRange(graph) {
  return {
    max: graph.priorityMax ?? graph.pointMax ?? graph.point ?? 0,
    min: graph.priorityMin ?? graph.pointMin ?? graph.point ?? 0,
  };
}

export function buildRosterGraph(entry, speed = entry.speed, language = "ko", abilityOptionName = "") {
  const names = getEntityNames(entry);
  return buildGraph(
    {
      names,
      name: names.ko,
      nameEn: names.en,
      nameJa: names.ja,
      rosterId: entry.id,
      nature: "unknown",
      itemSetting: "unknown",
      abilitySetting: "unknown",
      abilityOptionName,
      evUnknown: true,
      evValue: 32,
      megaChoice: "",
    },
    speed,
    null,
    language
  );
}

export function getVerdict(allyGraph, enemyGraph, t) {
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

export function createBattleSlotState(index = 0) {
  return { index, mega: false, ability: false, tailwind: false, paralysis: false, rank: 0 };
}

export function resetBattleTransientState(entry, index = entry.index, persistent = {}) {
  return {
    ...createBattleSlotState(index),
    mega: Boolean(persistent.mega),
    tailwind: entry.tailwind,
  };
}

export function normalizeBattleSideState(raw) {
  if (Array.isArray(raw)) {
    return [0, 1].map((index) => ({ ...createBattleSlotState(index), ...(raw[index] || {}) }));
  }

  if (raw && typeof raw === "object") {
    return [{ ...createBattleSlotState(0), ...raw }, createBattleSlotState(1)];
  }

  return [createBattleSlotState(0), createBattleSlotState(1)];
}

export function normalizeBattleState(raw) {
  return {
    ally: normalizeBattleSideState(raw?.ally),
    enemy: normalizeBattleSideState(raw?.enemy),
  };
}

export function normalizeBattleSearchState(raw) {
  const normalizeSide = (value) => {
    if (Array.isArray(value)) return [String(value[0] || ""), String(value[1] || "")];
    if (typeof value === "string") return [value, ""];
    return ["", ""];
  };

  return {
    ally: normalizeSide(raw?.ally),
    enemy: normalizeSide(raw?.enemy),
  };
}

export function getDoubleBattleOrderEntries(battleUnits, language, labels) {
  return [...battleUnits.ally, ...battleUnits.enemy]
    .filter(({ graph }) => Boolean(graph))
    .map((entry) => ({
      ...entry,
      title: entry.side === "ally" ? labels.myTeam : labels.opponentTeam,
      label:
        entry.state.mega && getSelectedMega(entry.slot)
          ? getLocalizedMegaLabel(getSelectedMega(entry.slot), language)
          : labels.getLocalizedName(entry.slot, language),
      icon: getDisplayIcon(entry.slot, entry.state.mega),
    }))
    .sort((a, b) => {
      if (b.graph.point !== a.graph.point) return b.graph.point - a.graph.point;
      if (b.graph.max !== a.graph.max) return b.graph.max - a.graph.max;
      return b.graph.min - a.graph.min;
    });
}
