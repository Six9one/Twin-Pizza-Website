import React, { useEffect, useMemo, useState } from "react";
import {
  TWIN_MENU,
  MEAT_OPTIONS,
  SAUCE_OPTIONS,
  DRINK_OPTIONS,
  GARNISH_SALAD_SET,
  GARNISH_SOUFFLET,
  type MenuItem,
  type SizeOption,
  type ExtraOption,
  type MeatOption,
  type SauceOption,
  type GarnishOption,
  type MenuCombo,
} from "./data/menu";

// --------------------------------------------------
// Small helpers
const priceFmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

// --------------------------------------------------
// Cart types
type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  size?: SizeOption | null;

  meats?: MeatOption[];
  sauces?: SauceOption[]; // supports multi
  garnishes?: GarnishOption[];
  drink?: string | null; // for menus midi

  combo?: MenuCombo | null;
};

const computeLinePrice = (line: CartLine) => {
  const sizeDelta = line.size ? line.size.priceDelta : 0;
  const meatsTotal = (line.meats || []).reduce((s, m) => s + (m.price || 0), 0);
  const garnishesTotal = (line.garnishes || []).reduce(
    (s, g) => s + (g.price || 0),
    0
  );
  const comboPrice = line.combo?.price || 0;

  return (
    (line.item.base_price + sizeDelta + meatsTotal + garnishesTotal + comboPrice) *
    line.quantity
  );
};

// --------------------------------------------------
// Wizard profiles (per category)
type WizardStep = "pizza" | "drink" | "meat" | "sauce" | "garnish" | "qty";
type WizardProfile = {
  saucesMulti?: boolean;
  garnishes?: GarnishOption[];
  garnishesMulti?: boolean;
  steps: WizardStep[];
};

function getWizardProfile(item: MenuItem): WizardProfile {
  switch (item.category_slug) {
    case "menus-midi":
      return { steps: ["pizza", "drink", "qty"] };
    case "tacos":
      return { steps: ["meat", "sauce", "qty"] }; // viande -> sauce (1)
    case "souffles":
      return {
        saucesMulti: true,
        garnishes: GARNISH_SOUFFLET,
        garnishesMulti: true,
        steps: ["meat", "sauce", "garnish", "qty"],
      };
    case "makloub":
      return { steps: ["meat", "sauce", "qty"] };
    case "mlawi":
      return {
        garnishes: GARNISH_SALAD_SET,
        garnishesMulti: true,
        steps: ["meat", "sauce", "garnish", "qty"],
      };
    case "panini":
      return { steps: ["meat", "sauce", "qty"] };
    default:
      return { steps: ["qty"] };
  }
}

// --------------------------------------------------
// UI Pickers (meat / sauce / garnish / drink / qty)

// Meat
function MeatPicker({
  limit,
  options,
  value,
  onChange,
}: {
  limit: number;
  options: MeatOption[];
  value: MeatOption[];
  onChange: (v: MeatOption[]) => void;
}) {
  function toggle(m: MeatOption) {
    const arr = [...value];
    const i = arr.findIndex((x) => x.label === m.label);
    if (i >= 0) arr.splice(i, 1);
    else if (arr.length < limit) arr.push(m);
    onChange(arr);
  }
  const active = (m: MeatOption) => value.some((x) => x.label === m.label);
  return (
    <div className="space-y-2">
      <div className="font-medium">Viande(s) <span className="text-xs text-neutral-500">(max {limit})</span></div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((m) => (
          <button
            key={m.label}
            onClick={() => toggle(m)}
            className={`px-3 py-2 rounded-xl border text-sm ${
              active(m) ? "bg-neutral-900 text-white" : "bg-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sauce
function SaucePicker({
  options,
  multi,
  value,
  onChange,
}: {
  options: SauceOption[];
  multi?: boolean;
  value: SauceOption[] | SauceOption | null;
  onChange: (v: SauceOption[] | SauceOption | null) => void;
}) {
  function toggle(s: SauceOption) {
    if (!multi) return onChange(s);
    const arr = Array.isArray(value) ? [...value] : [];
    const i = arr.findIndex((x) => x.label === s.label);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(s);
    onChange(arr);
  }
  const isActive = (s: SauceOption) =>
    multi
      ? Array.isArray(value) && value.some((v) => v.label === s.label)
      : (value as SauceOption | null)?.label === s.label;

  return (
    <div className="space-y-2">
      <div className="font-medium">Sauce{multi ? "s" : ""}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((s) => (
          <button
            key={s.label}
            onClick={() => toggle(s)}
            className={`px-3 py-2 rounded-xl border text-sm ${
              isActive(s) ? "bg-neutral-900 text-white" : "bg-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Garnish
function GarnishPicker({
  options,
  value,
  onChange,
}: {
  options: GarnishOption[];
  value: GarnishOption[];
  onChange: (v: GarnishOption[]) => void;
}) {
  function toggle(g: GarnishOption) {
    const arr = [...value];
    const i = arr.findIndex((x) => x.label === g.label);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(g);
    onChange(arr);
  }
  const active = (g: GarnishOption) => value.some((x) => x.label === g.label);
  return (
    <div className="space-y-2">
      <div className="font-medium">Garnitures</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((g) => (
          <button
            key={g.label}
            onClick={() => toggle(g)}
            className={`px-3 py-2 rounded-xl border text-sm ${
              active(g) ? "bg-neutral-900 text-white" : "bg-white"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Drink
function DrinkPicker({
  options,
  value,
  onChange,
}: {
  options: { label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="font-medium">Boisson</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((d) => (
          <button
            key={d.label}
            onClick={() => onChange(d.label)}
            className={`px-3 py-2 rounded-xl border text-sm ${
              value === d.label ? "bg-neutral-900 text-white" : "bg-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Qty
function QtyPicker({
  value,
  setValue,
}: {
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="p-2 rounded-lg border"
        onClick={() => setValue(Math.max(1, value - 1))}
      >
        −
      </button>
      <span className="text-sm w-8 text-center">{value}</span>
      <button className="p-2 rounded-lg border" onClick={() => setValue(value + 1)}>
        +
      </button>
    </div>
  );
}

// --------------------------------------------------
// App
export default function App() {
  const [menu] = useState<MenuItem[]>(TWIN_MENU);
  const CATEGORIES = useMemo(
    () => [
      { slug: "menus-midi", name: "Menus midi" },
      { slug: "pizzas", name: "Pizzas" },
      { slug: "tacos", name: "Tacos" },
      { slug: "souffles", name: "Soufflés" },
      { slug: "makloub", name: "Makloub" },
      { slug: "mlawi", name: "Mlawi" },
      { slug: "panini", name: "Panini" },
      { slug: "croques", name: "Croques" },
      { slug: "tex-mex", name: "Tex-mex" },
      { slug: "fries", name: "Frites" },
      { slug: "drinks", name: "Boissons" },
    ],
    []
  );
  const [activeCat, setActiveCat] = useState("menus-midi");

  // cart
  const [cart, setCart] = useState<CartLine[]>([]);
  const cartTotal = useMemo(
    () => cart.reduce((s, l) => s + computeLinePrice(l), 0),
    [cart]
  );

  function addToCartFromWizard(line: Omit<CartLine, "id">) {
    const id =
      (crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2);
    setCart((prev) => [...prev, { id, ...line }]);
  }

  // items by category
  const itemsByCat = useMemo(() => {
    const r: Record<string, MenuItem[]> = {};
    for (const c of CATEGORIES) r[c.slug] = menu.filter((m) => m.category_slug === c.slug);
    return r;
  }, [menu, CATEGORIES]);

  // wizard state
  const [wizardItem, setWizardItem] = useState<MenuItem | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="py-3 flex items-center gap-3">
          <span className="font-extrabold text-lg text-amber-600">Twin Pizza</span>
          <span className="ml-2 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">Grand-Couronne</span>
          <div className="ml-auto text-sm">{cart.length} article(s) — {priceFmt(cartTotal)}</div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[52px] bg-neutral-50/95 backdrop-blur py-3 z-20">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActiveCat(c.slug)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                activeCat === c.slug
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white hover:bg-neutral-100"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid items */}
      <section className="py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {CATEGORIES.find((c) => c.slug === activeCat)?.name}
          </h2>
          <span className="text-sm text-neutral-500">
            {(itemsByCat[activeCat]?.length || 0)} articles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(itemsByCat[activeCat] || []).map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded-full bg-amber-500 text-white shadow">
                  {priceFmt(item.base_price)}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <div className="font-semibold drop-shadow-sm">{item.name}</div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <button
                  onClick={() => setWizardItem(item)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50"
                >
                  Choisir
                </button>
                {/* IMPORTANT: no quick add button here */}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wizard Modal */}
      {wizardItem && (
        <WizardModal
          item={wizardItem}
          onClose={() => setWizardItem(null)}
          onConfirm={(line) => {
            addToCartFromWizard(line);
            setWizardItem(null);
          }}
        />
      )}
    </div>
  );
}

// --------------------------------------------------
// Wizard Modal (one component to rule them all)

function WizardModal({
  item,
  onClose,
  onConfirm,
}: {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (line: Omit<CartLine, "id">) => void;
}) {
  const profile = getWizardProfile(item);
  const steps = profile.steps;
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  // states
  const [qty, setQty] = useState(1);
  const [meats, setMeats] = useState<MeatOption[]>([]);
  const [sauceSingle, setSauceSingle] = useState<SauceOption | null>(null);
  const [sauceMulti, setSauceMulti] = useState<SauceOption[]>([]);
  const [garnishes, setGarnishes] = useState<GarnishOption[]>([]);
  const [drink, setDrink] = useState<string | null>(null);

  // for menu midi: choose a pizza
  const pizzasSenior = TWIN_MENU.filter((p) => p.category_slug === "pizzas"); // demo
  const [chosenPizza, setChosenPizza] = useState<MenuItem | null>(null);

  // simple validation
  const canNext = useMemo(() => {
    if (step === "pizza") return !!chosenPizza;
    if (step === "meat" && item.meats_limit) return meats.length > 0 && meats.length <= item.meats_limit;
    if (step === "sauce") {
      return profile.saucesMulti ? sauceMulti.length > 0 : !!sauceSingle;
    }
    if (step === "drink") return !!drink;
    return true;
  }, [step, chosenPizza, meats, sauceSingle, sauceMulti, drink, item.meats_limit, profile.saucesMulti]);

  function next() {
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
  }
  function prev() {
    if (stepIdx === 0) onClose();
    else setStepIdx(stepIdx - 1);
  }

  function finalize() {
    const sauces = profile.saucesMulti ? sauceMulti : (sauceSingle ? [sauceSingle] : []);
    // Base item to store (for menus-midi, we push the menu item; pizza choice stored in extras text if you want)
    const base: Omit<CartLine, "id"> = {
      item,
      quantity: qty,
      meats,
      sauces,
      garnishes,
      drink,
    };
    onConfirm(base);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={item.image_url || `https://picsum.photos/seed/${item.id}/800/450`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <div className="text-xs text-neutral-500">Étape {stepIdx + 1}/{steps.length}</div>
            </div>
            <button className="p-2 rounded-lg hover:bg-neutral-100" onClick={onClose}>✕</button>
          </div>

          {/* STEPS */}
          {step === "pizza" && (
            <div className="space-y-2">
              <div className="font-medium">Choix de la pizza</div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto hide-scrollbar">
                {pizzasSenior.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setChosenPizza(p)}
                    className={`px-3 py-2 rounded-xl border text-sm text-left ${
                      chosenPizza?.id === p.id ? "bg-neutral-900 text-white" : "bg-white"
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-neutral-500">Base tomate / crème (selon carte)</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "drink" && (
            <DrinkPicker options={DRINK_OPTIONS} value={drink} onChange={setDrink} />
          )}

          {step === "meat" && item.meats && item.meats_limit && (
            <MeatPicker
              limit={item.meats_limit}
              options={item.meats}
              value={meats}
              onChange={setMeats}
            />
          )}

          {step === "sauce" && item.sauces && (
            <SaucePicker
              options={item.sauces}
              multi={profile.saucesMulti || item.sauces_multi}
              value={(profile.saucesMulti || item.sauces_multi) ? sauceMulti : sauceSingle}
              onChange={(v) => {
                if (Array.isArray(v)) setSauceMulti(v);
                else setSauceSingle(v as SauceOption | null);
              }}
            />
          )}

          {step === "garnish" && profile.garnishes && (
            <GarnishPicker
              options={profile.garnishes}
              value={garnishes}
              onChange={setGarnishes}
            />
          )}

          {step === "qty" && (
            <QtyPicker value={qty} setValue={setQty} />
          )}

          {/* Footer */}
          <div className="pt-2 border-t flex items-center justify-between gap-3">
            <button className="px-3 py-2 rounded-xl border" onClick={prev}>
              {stepIdx === 0 ? "Annuler" : "Retour"}
            </button>

            {!isLast ? (
              <button
                disabled={!canNext}
                onClick={next}
                className="px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={finalize}
                className="px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
              >
                Ajouter au panier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
