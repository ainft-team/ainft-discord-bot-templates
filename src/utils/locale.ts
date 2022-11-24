export const getLanguageCodeFromLocale = (locale: string) => {
  // example: en-US => en, ko => ko
  return new Intl.Locale(locale).language;
}