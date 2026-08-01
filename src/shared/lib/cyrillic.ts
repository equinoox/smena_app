// Serbian Cyrillic -> Latin transliteration. One-way conversion is lossless/unambiguous
// (unlike Latin -> Cyrillic, where digraphs like "nj"/"lj" are ambiguous), so a simple
// char map is correct here. Used to normalize Mapbox geocoding results for Serbia, which
// often come back in Cyrillic regardless of the requested response language.
const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: "A", а: "a", Б: "B", б: "b", В: "V", в: "v", Г: "G", г: "g",
  Д: "D", д: "d", Ђ: "Đ", ђ: "đ", Е: "E", е: "e", Ж: "Ž", ж: "ž",
  З: "Z", з: "z", И: "I", и: "i", Ј: "J", ј: "j", К: "K", к: "k",
  Л: "L", л: "l", Љ: "Lj", љ: "lj", М: "M", м: "m", Н: "N", н: "n",
  Њ: "Nj", њ: "nj", О: "O", о: "o", П: "P", п: "p", Р: "R", р: "r",
  С: "S", с: "s", Т: "T", т: "t", Ћ: "Ć", ћ: "ć", У: "U", у: "u",
  Ф: "F", ф: "f", Х: "H", х: "h", Ц: "C", ц: "c", Ч: "Č", ч: "č",
  Џ: "Dž", џ: "dž", Ш: "Š", ш: "š",
};

const CYRILLIC_PATTERN = /[Ѐ-ӿ]/;

export function toLatin(text: string): string {
  if (!CYRILLIC_PATTERN.test(text)) return text;
  return text.replace(/[Ѐ-ӿ]/g, (char) => CYRILLIC_TO_LATIN[char] ?? char);
}
