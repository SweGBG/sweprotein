// Everything you are likely to edit lives here: texts (SV/EN), flavours and the scene video.
export type Lang = "sv" | "en";

export const site = {
  name: "SweProtein",
  url: "https://sweprotein.vercel.app",
  /**
   * Scroll-scrubbed film for the big scene (made in MiniMax H3, see /h3/README.md).
   * Put the finished file in public/video/. Until it exists, the scene is drawn in code instead.
   */
  sceneVideo: "/video/sweprotein-scene.mp4",
  scenePoster: "/video/sweprotein-poster.jpg",
};

const sv = {
  introSub: "PROTEINSHAKE · GÖTEBORG",
  navCta: "Se smakerna",
  heroSub: "Proteinshake av riktiga bär",
  scroll: "SCROLLA",
  l1h: "Allt faller på plats.",
  l1p: "Jordgubbar, kakao och havre. Råvaror du känner igen, rakt ner i flaskan.",
  l2h: "30 gram protein. Noll tvekan.",
  stats: ["30 G PROTEIN", "9 G SOCKER", "LAKTOSFRI", "330 ML"],
  l3h: "Drick styrkan.",
  l3p: "Kall, krämig och klar på tre sekunder. Skaka, öppna, kör.",
  l3b: "Hitta din smak",
  fEy: "Fyra smaker",
  fH: "Välj din styrka.",
  fP: "Varje flaska är mixad på mjölkprotein och riktig frukt. Ingen pulverburk, ingen shaker att diska.",
  nEy: "Läs etiketten",
  nH: "Inget att gömma.",
  points: [
    ["30 g", "mjölkprotein per flaska, lika mycket som fem ägg."],
    ["9 g", "socker, allt från frukten. Inget tillsatt."],
    ["0 %", "laktos. Snäll mot magen efter passet."],
  ],
  tH: "Näringsvärde",
  tPer: "per flaska 330 ml · Jordgubb",
  rows: [
    ["Energi", "880 kJ / 210 kcal", ""],
    ["Fett", "3,5 g", ""],
    ["varav mättat fett", "2,1 g", "sub"],
    ["Kolhydrater", "14 g", ""],
    ["varav sockerarter", "9 g", "sub"],
    ["Protein", "30 g", "hi"],
    ["Salt", "0,30 g", ""],
  ],
  tIng: "Ingredienser: laktosfri mjölk, mjölkprotein, jordgubbspuré (8 %), havre, rödbetsjuice, naturlig arom.",
  oEy: "Lansering våren 2027",
  oH: "Först i kylen.",
  oP: "Skriv upp dig så hör vi av oss när SweProtein finns i butik nära dig.",
  oLabel: "E-post",
  oPh: "din@epost.se",
  oBtn: "Skriv upp mig",
  oOk: "Tack! Det här är en demo, så inget skickades.",
  bottle: "30 G PROTEIN · JORDGUBB",
  foot: "SweProtein är ett påhittat varumärke. Demosajt byggd av SweGBG Agency.",
};

export type Dict = typeof sv;

const en: Dict = {
  introSub: "PROTEIN SHAKE · GOTHENBURG",
  navCta: "See the flavours",
  heroSub: "Protein shake made with real berries",
  scroll: "SCROLL",
  l1h: "Everything falls into place.",
  l1p: "Strawberries, cocoa and oats. Ingredients you recognise, straight into the bottle.",
  l2h: "30 grams of protein. Zero doubt.",
  stats: ["30 G PROTEIN", "9 G SUGAR", "LACTOSE FREE", "330 ML"],
  l3h: "Drink the strength.",
  l3p: "Cold, creamy and ready in three seconds. Shake, open, go.",
  l3b: "Find your flavour",
  fEy: "Four flavours",
  fH: "Pick your strength.",
  fP: "Every bottle is blended from milk protein and real fruit. No tub of powder, no shaker to wash.",
  nEy: "Read the label",
  nH: "Nothing to hide.",
  points: [
    ["30 g", "of milk protein per bottle, as much as five eggs."],
    ["9 g", "of sugar, all from the fruit. Nothing added."],
    ["0 %", "lactose. Easy on the stomach after training."],
  ],
  tH: "Nutrition",
  tPer: "per 330 ml bottle · Strawberry",
  rows: [
    ["Energy", "880 kJ / 210 kcal", ""],
    ["Fat", "3.5 g", ""],
    ["of which saturates", "2.1 g", "sub"],
    ["Carbohydrate", "14 g", ""],
    ["of which sugars", "9 g", "sub"],
    ["Protein", "30 g", "hi"],
    ["Salt", "0.30 g", ""],
  ],
  tIng: "Ingredients: lactose-free milk, milk protein, strawberry purée (8%), oats, beetroot juice, natural flavouring.",
  oEy: "Launching spring 2027",
  oH: "First in the fridge.",
  oP: "Sign up and we'll let you know when SweProtein is in a shop near you.",
  oLabel: "Email",
  oPh: "you@email.com",
  oBtn: "Sign me up",
  oOk: "Thanks! This is a demo, so nothing was sent.",
  bottle: "30 G PROTEIN · STRAWBERRY",
  foot: "SweProtein is a fictional brand. Demo site built by SweGBG Agency.",
};

export const dict: Record<Lang, Dict> = { sv, en };

export type Kind = "berry" | "choc" | "mango" | "blue" | "oat";
export type Flavour = { id: string; bg: string; fg: string; kind: Kind; name: Record<Lang, string>; tag: Record<Lang, string>; desc: Record<Lang, string> };

export const flavours: Flavour[] = [
  { id: "jordgubb", bg: "#ef3f6b", fg: "#2a0712", kind: "berry", name: { sv: "Jordgubb", en: "Strawberry" }, tag: { sv: "Bästsäljare", en: "Best seller" },
    desc: { sv: "Svenska jordgubbar och en skvätt rödbeta för färgen.", en: "Swedish strawberries and a splash of beetroot for colour." } },
  { id: "choklad", bg: "#6b3a26", fg: "#fbf1ec", kind: "choc", name: { sv: "Choklad", en: "Chocolate" }, tag: { sv: "Efter passet", en: "Post-workout" },
    desc: { sv: "Mörk kakao, lite havssalt och krämig havre.", en: "Dark cocoa, a pinch of sea salt and creamy oats." } },
  { id: "mango", bg: "#f6a623", fg: "#2b1600", kind: "mango", name: { sv: "Mango", en: "Mango" }, tag: { sv: "Frukost", en: "Breakfast" },
    desc: { sv: "Mogen mango och passionsfrukt. Smakar sommar.", en: "Ripe mango and passion fruit. Tastes like summer." } },
  { id: "blabar", bg: "#3b3f9e", fg: "#f2f0ff", kind: "blue", name: { sv: "Blåbär", en: "Blueberry" }, tag: { sv: "Nyhet", en: "New" },
    desc: { sv: "Skogsblåbär och bourbonvanilj.", en: "Wild blueberries and bourbon vanilla." } },
];
