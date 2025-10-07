// ---------- Types ----------
export type SizeOption = { label: string; priceDelta: number; meatsLimit?: number };
export type ExtraOption = { label: string; price: number };
export type MeatOption = { label: string; price?: number };
export type SauceOption = { label: string };
export type GarnishOption = { label: string; price?: number };
export type MenuCombo = { label: string; price: number };

export type MenuItem = {
  id: string;
  name: string;
  category_slug: string; // pizzas, tacos, souffles, makloub, mlawi, panini, menus-midi, drinks, fries...
  base_price: number;
  image_url?: string;

  // item options
  sizes?: SizeOption[];
  extras?: ExtraOption[];
  meats_limit?: number;
  meats?: MeatOption[];
  sauces?: SauceOption[];
  sauces_multi?: boolean;
  garnishes?: GarnishOption[];
  garnishes_multi?: boolean;
  combos?: MenuCombo[];

  force_wizard?: boolean; // open wizard only (no quick add)
};

export type Drink = { label: string; price?: number };

// ---------- Global options ----------
export const MEAT_OPTIONS: MeatOption[] = [
  { label: "Poulet" },
  { label: "Tenders" },
  { label: "Viande hachée" },
  { label: "Merguez" },
  { label: "Cordon bleu" },
  { label: "Nuggets" },
  { label: "Escalope marinée" },
];

export const SAUCE_OPTIONS: SauceOption[] = [
  { label: "Algerienne" },
  { label: "Ketchup" },
  { label: "Mayonnaise" },
  { label: "Barbecue" },
  { label: "Blanche" },
  { label: "Biggy" },
  { label: "Samouraï" },
  { label: "Andalouse" },
];

export const GARNISH_SOUFFLET: GarnishOption[] = [
  { label: "Pommes de terre" },
  { label: "Oignons" },
  { label: "Olives" },
];

export const GARNISH_SALAD_SET: GarnishOption[] = [
  { label: "Salade" },
  { label: "Tomate" },
  { label: "Oignons" },
  { label: "Olives" },
];

export const DRINK_OPTIONS: Drink[] = [
  { label: "Coca 33cl" },
  { label: "Coca Zero 33cl" },
  { label: "Fanta 33cl" },
  { label: "Orangina 33cl" },
  { label: "Eau 50cl" },
];

// ---------- Demo images ----------
const pic = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;

// ---------- Demo menu ----------
export const TWIN_MENU: MenuItem[] = [
  // PIZZAS (exemple de quelques pizzas, tu ajouteras tout ton catalogue)
  {
    id: "pz-marg",
    name: "Margherita",
    category_slug: "pizzas",
    base_price: 18,
    image_url: pic("pizza-marg"),
    sizes: [
      { label: "Senior", priceDelta: 0 },
      { label: "Mega", priceDelta: 7 },
    ],
    force_wizard: true,
  },
  {
    id: "pz-veg",
    name: "Végétarienne",
    category_slug: "pizzas",
    base_price: 18,
    image_url: pic("pizza-veg"),
    sizes: [
      { label: "Senior", priceDelta: 0 },
      { label: "Mega", priceDelta: 7 },
    ],
    force_wizard: true,
  },
  {
    id: "pz-calz",
    name: "Calzone",
    category_slug: "pizzas",
    base_price: 18,
    image_url: pic("pizza-calz"),
    sizes: [
      { label: "Senior", priceDelta: 0 },
      { label: "Mega", priceDelta: 7 },
    ],
    force_wizard: true,
  },

  // MENUS MIDI (2 produits)
  {
    id: "midi-senior",
    name: "Menu Midi — Pizza Senior + Boisson",
    category_slug: "menus-midi",
    base_price: 10,
    image_url: pic("midi-senior"),
    force_wizard: true,
  },
  {
    id: "midi-mega",
    name: "Menu Midi — Pizza Mega + Boisson",
    category_slug: "menus-midi",
    base_price: 15,
    image_url: pic("midi-mega"),
    force_wizard: true,
  },

  // TACOS
  {
    id: "tacos-solo",
    name: "Tacos Solo",
    category_slug: "tacos",
    base_price: 7.5,
    image_url: pic("tacos-solo"),
    meats_limit: 1,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false, // 1 sauce seulement
    force_wizard: true,
  },
  {
    id: "tacos-double",
    name: "Tacos Double",
    category_slug: "tacos",
    base_price: 9,
    image_url: pic("tacos-double"),
    meats_limit: 2,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false,
    force_wizard: true,
  },
  {
    id: "tacos-triple",
    name: "Tacos Triple",
    category_slug: "tacos",
    base_price: 10.5,
    image_url: pic("tacos-triple"),
    meats_limit: 3,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false,
    force_wizard: true,
  },

  // SOUFFLÉ
  {
    id: "souffle-solo",
    name: "Soufflé Solo",
    category_slug: "souffles",
    base_price: 7.5,
    image_url: pic("souffle-solo"),
    meats_limit: 1,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: true, // MULTI sauces
    garnishes: GARNISH_SOUFFLET, // PDT/Oignons/Olives uniquement
    garnishes_multi: true,
    force_wizard: true,
  },

  // MAKLOUB
  {
    id: "makloub",
    name: "Makloub",
    category_slug: "makloub",
    base_price: 7,
    image_url: pic("makloub"),
    meats_limit: 1,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false,
    force_wizard: true,
  },

  // MLAWI
  {
    id: "mlawi",
    name: "Mlawi",
    category_slug: "mlawi",
    base_price: 7,
    image_url: pic("mlawi"),
    meats_limit: 1,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false,
    garnishes: GARNISH_SALAD_SET, // Salade/Tomate/Oignons/Olives
    garnishes_multi: true,
    force_wizard: true,
  },

  // PANINI
  {
    id: "panini",
    name: "Panini",
    category_slug: "panini",
    base_price: 5.5,
    image_url: pic("panini"),
    meats_limit: 1,
    meats: MEAT_OPTIONS,
    sauces: SAUCE_OPTIONS,
    sauces_multi: false,
    force_wizard: true,
  },

  // Boissons & Frites (simples)
  {
    id: "fries",
    name: "Frites",
    category_slug: "fries",
    base_price: 3,
    image_url: pic("fries"),
    force_wizard: true,
  },
  {
    id: "drink-coca",
    name: "Boisson 33cl",
    category_slug: "drinks",
    base_price: 2,
    image_url: pic("drink"),
    force_wizard: true,
  },
];
