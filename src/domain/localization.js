export function pickLocalizedText(language, values) {
  return values[language] ?? values.en ?? values.ko ?? "";
}

export function getLocalizedOptionLabel(option, language) {
  if (!option) return "";
  return pickLocalizedText(language, {
    ko: option.labelKo,
    en: option.labelEn,
    ja: option.labelJa,
  });
}

export function getLocalizedOptionHelp(option, language, fallbackText = "") {
  if (!option) return fallbackText;
  return (
    pickLocalizedText(language, {
      ko: option.helpKo,
      en: option.helpEn,
      ja: option.helpJa,
    }) || fallbackText
  );
}

export function getLocalizedCurrentSpeedLabel(language) {
  return pickLocalizedText(language, {
    ko: "현재 스피드",
    en: "Current Speed",
    ja: "現在の素早さ",
  });
}

export function getEntityNames(entity) {
  const ko = entity?.names?.ko ?? entity?.displayName ?? entity?.name ?? "";
  const en = entity?.names?.en ?? entity?.displayNameEn ?? entity?.nameEn ?? ko;
  const ja = entity?.names?.ja ?? entity?.displayNameJa ?? entity?.nameJa ?? en ?? ko;
  return { ko, en, ja };
}

export function getLocalizedName(entity, language) {
  if (!entity) return "";
  const { ko: koName, en: enName, ja: jaName } = getEntityNames(entity);
  if (language === "ja") return jaName || enName || koName;
  if (language === "en") return enName || koName;
  return koName;
}

export function getLocalizedMegaLabel(mega, language) {
  if (!mega) return "";
  if (language === "ja") return mega.labelJa || mega.labelEn || mega.label;
  if (language === "en") return mega.labelEn || mega.label;
  return mega.label;
}
