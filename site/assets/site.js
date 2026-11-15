const grid = document.querySelector("#recipe-grid");
const searchInput = document.querySelector("#recipe-search");
const searchClear = document.querySelector("#search-clear");
const resetFiltersBtn = document.querySelector("#reset-filters");
const filterButtons = [...document.querySelectorAll("[data-category]")];
const resultCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const recipeDialog = document.querySelector("#recipe-dialog");
const dialogContent = document.querySelector("#dialog-content");

let recipes = [];
let selectedCategory = "全部";
let currentSlug = null;
let currentScale = 1;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function isPendingText(text) {
  return /(待確認|待補|未記錄)/.test(String(text));
}

/* PulsoIcon 24x24 Animated Icons (https://github.com/CityPulso/PulsoIcon) */
const PULSO_ICONS = {
  coffee: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-float-1" d="M10 2v2"/><path class="pi-float-2" d="M14 2v2"/><path class="pi-press" d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path class="pi-float-3" d="M6 2v2"/></svg>`,
  bean: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-wobble" d="M19.07 4.93A10 7 -45 0 0 4.93 19.07 10 7 -45 0 0 19.07 4.93z"/><path d="M4.93 19.07C11 19 13 5 19.07 4.93"/></svg>`,
  cupSoda: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-sway" d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path class="pi-sway" d="M5 8h14"/><path class="pi-sway" d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path class="pi-swing" d="m12 8 1-6h2"/></svg>`,
  cakeSlice: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-grow-x" d="M16 13H3"/><path class="pi-grow-x" d="M16 17H3"/><path class="pi-jelly" d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle class="pi-float-1" cx="9" cy="7" r="2"/></svg>`,
  milk: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-sway" d="M8 2h8"/><path class="pi-sway" d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/></svg>`,
  droplets: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-drop-1" d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path class="pi-drop-2" d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
  glassWater: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-sway" d="M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/></svg>`,
  iceCube: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect class="pi-wobble" x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8 9h3v3"/><path d="M13 15h3v-3"/></svg>`,
  timer: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line class="pi-spin" x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>`,
  flame: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-sway" d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>`,
  scale: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18"/><path class="pi-sway" d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path class="pi-sway" d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path class="pi-sway" d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/></svg>`,
  sparkles: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-twinkle" d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/></svg>`,
  arrowUpRight: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="pi-shoot" d="M7 7h10v10"/><path class="pi-shoot" d="M7 17 17 7"/></svg>`,
  arrowLeft: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`,
  arrowRight: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  check: `<svg class="pulso-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`
};

function categoryPulsoIcon(category) {
  switch (category) {
    case "手沖":
      return PULSO_ICONS.droplets;
    case "飲品":
    case "特調":
      return PULSO_ICONS.cupSoda;
    case "甜點":
      return PULSO_ICONS.cakeSlice;
    case "冰咖啡":
      return PULSO_ICONS.glassWater;
    case "奶咖":
      return PULSO_ICONS.milk;
    default:
      return PULSO_ICONS.coffee;
  }
}

/* 自動判讀冷熱飲與冰塊規格（提供吧台快速查閱徽章） */
function getRecipeServingSpec(recipe) {
  const ingredients = recipe.ingredients || [];
  const iceItem = ingredients.find((item) => item.name.includes("冰塊"));
  if (iceItem) {
    return {
      tone: "iced",
      icon: PULSO_ICONS.iceCube,
      label: `冰塊：${iceItem.amount}`
    };
  }
  if (recipe.category === "甜點") {
    return {
      tone: "bake",
      icon: PULSO_ICONS.cakeSlice,
      label: "烤箱烘焙"
    };
  }
  if (recipe.category === "手沖") {
    return {
      tone: "brew",
      icon: PULSO_ICONS.droplets,
      label: "手沖萃取"
    };
  }
  return {
    tone: "hot",
    icon: PULSO_ICONS.coffee,
    label: "熱飲出杯"
  };
}

function recipeIllustration(recipe) {
  const slug = recipe.slug || "";
  const category = recipe.category || "";

  if (slug === "basque-cheesecake") {
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <ellipse cx="44" cy="69" rx="30" ry="6" fill="#e5d5be" stroke="#3b2316" stroke-width="1.8"/>
        <path d="M22 36c0-7 10-12 22-12s22 5 22 12v24c0 6-10 10-22 10s-22-4-22-10V36Z" fill="#f2d399" stroke="#3b2316" stroke-width="2.2"/>
        <ellipse cx="44" cy="36" rx="22" ry="10" fill="#6b3418" stroke="#3b2316" stroke-width="2"/>
        <path d="M31 35c5-3 18-3 25 1" stroke="#b87442" stroke-width="2" stroke-linecap="round"/>
        <path d="M26 44c4 8 8 12 18 12s14-4 18-12" stroke="#fcf6ea" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  if (slug === "creme-brulee") {
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <ellipse cx="44" cy="67" rx="29" ry="5" fill="#e5d5be" stroke="#3b2316" stroke-width="1.8"/>
        <path d="M20 42h48l-4 19a6 6 0 0 1-6 5H30a6 6 0 0 1-6-5l-4-19Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
        <path d="M26 48v12m6-12v12m6-12v12m6-12v12m6-12v12m6-12v12" stroke="#d9cbb7" stroke-width="1.6" stroke-linecap="round"/>
        <ellipse cx="44" cy="42" rx="24" ry="7" fill="#f3cf85" stroke="#3b2316" stroke-width="2"/>
        <ellipse cx="44" cy="42" rx="18" ry="4.5" fill="#8f491e"/>
        <path d="M54 24 43 40" stroke="#e09b5b" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
  }

  /* 檸檬可樂：氣泡可樂與檸檬片、半杯冰 */
  if (slug === "lemon-cola") {
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <path d="M26 20h36l-4 46a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6l-4-46Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
        <path d="M28 29h32l-3 37a5 5 0 0 1-5 4H36a5 5 0 0 1-5-4l-3-37Z" fill="#3b1d12"/>
        <circle cx="57" cy="21" r="9" fill="#f8e16c" stroke="#c88a2b" stroke-width="2"/>
        <circle cx="42" cy="42" r="7" fill="#f8e16c" stroke="#c88a2b" stroke-width="1.6"/>
        <rect x="33" y="47" width="9" height="9" rx="2" transform="rotate(-10 33 47)" fill="#f7efe2" stroke="#9c5e35" stroke-width="1.5"/>
        <circle cx="38" cy="34" r="1.8" fill="#f7ebd9"/><circle cx="49" cy="36" r="1.5" fill="#f7ebd9"/><circle cx="45" cy="58" r="1.8" fill="#f7ebd9"/>
        <path d="M49 12 42 36" stroke="#e09b5b" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`;
  }

  /* 檸檬美式 / 蘋果美式：濃縮分層果香冰美式 */
  if (slug === "lemon-americano" || slug === "apple-americano") {
    const juiceColor = slug === "apple-americano" ? "#eab664" : "#f2d479";
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <path d="M26 21h36l-4 45a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6l-4-45Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
        <path d="M27 29h34l-1.2 14H28.2L27 29Z" fill="#5e3219"/>
        <path d="M28.2 43h31.6l-2 23a5 5 0 0 1-5 4H35.2a5 5 0 0 1-5-4l-2-23Z" fill="${juiceColor}"/>
        <circle cx="58" cy="21" r="8.5" fill="#f7df86" stroke="#b35a42" stroke-width="2"/>
        <rect x="34" y="45" width="9" height="9" rx="2" transform="rotate(-8 34 45)" fill="#fcf8f1" stroke="#9c5e35" stroke-width="1.5"/>
        <rect x="46" y="49" width="9" height="9" rx="2" transform="rotate(11 46 49)" fill="#fcf8f1" stroke="#9c5e35" stroke-width="1.5"/>
      </svg>`;
  }

  /* 冰拿鐵 / 冰香草拿鐵 / 冰黑糖拿鐵 / 冰奶茶：漸層鮮奶與冰塊 */
  if (slug.startsWith("iced-") && (category === "奶咖" || slug === "iced-milk-tea")) {
    const isBrownSugar = slug.includes("brown-sugar");
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <path d="M26 21h36l-4 45a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6l-4-45Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
        <path d="M27.2 29h33.6l-1.2 14H28.4L27.2 29Z" fill="#7a4424"/>
        <path d="M28.4 43h31.2l-2 23a5 5 0 0 1-5 4H35.4a5 5 0 0 1-5-4l-2-23Z" fill="#f5ead8"/>
        ${isBrownSugar ? `<path d="M30 48c5 4 8-2 13 3s8-1 14 4M31 58c6 3 11-2 17 2" stroke="#8a421a" stroke-width="2.4" stroke-linecap="round"/>` : ""}
        <rect x="34" y="34" width="9" height="9" rx="2" transform="rotate(-8 34 34)" fill="#fcf8f1" stroke="#3b2316" stroke-width="1.5"/>
        <rect x="46" y="36" width="9" height="9" rx="2" transform="rotate(10 46 36)" fill="#fcf8f1" stroke="#3b2316" stroke-width="1.5"/>
      </svg>`;
  }

  /* 熱美式 / 熱紅茶 / 熱綠茶 / 熱金桔茶：溫潤馬克杯與熱氣 */
  if (slug.startsWith("hot-") && category === "飲品" && !slug.includes("milk")) {
    const liquidColor = slug.includes("green") || slug.includes("citrus")
      ? "#c89f49"
      : slug.includes("black-tea")
        ? "#9e4722"
        : "#4e2a16";
    return `
      <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <path d="M22 29h36v21a16 16 0 0 1-16 16h-4a16 16 0 0 1-16-16V29Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
        <path d="M58 35h6a6 6 0 0 1 0 12h-6" stroke="#fcf8f1" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M58 35h6a6 6 0 0 1 0 12h-6" stroke="#3b2316" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="40" cy="30" rx="17" ry="4" fill="${liquidColor}" stroke="#3b2316" stroke-width="1.8"/>
        <path d="M33 21c-2-4 2-5 0-9m13 9c-2-4 2-5 0-9" stroke="#e09b5b" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M18 68h44" stroke="#e09b5b" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
  }

  switch (category) {
    case "手沖":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M22 22h44l-14 26h-16L22 22Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M62 26h6a5 5 0 0 1 0 10h-9" stroke="#fcf8f1" stroke-width="3.4" stroke-linecap="round"/>
          <path d="M62 26h6a5 5 0 0 1 0 10h-9" stroke="#3b2316" stroke-width="2" stroke-linecap="round"/>
          <path d="M26 48h36M31 48l-4 22a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4l-4-22" fill="#f5ead8" stroke="#3b2316" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M29 60h30l-2 10a3 3 0 0 1-3 2H34a3 3 0 0 1-3-2l-2-10Z" fill="#7a4424"/>
          <path d="M31 60c8 3 18 3 26 0" stroke="#c89464" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M38 15c-2-4 2-5 0-9m12 9c-2-4 2-5 0-9" stroke="#e09b5b" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    case "飲品":
    case "特調":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M27 20h34l-3 46a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7l-3-46Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
          <path d="M28 28h32l-1 14H29l-1-14Z" fill="#c77d36"/>
          <path d="M29 42h30l-2 24a6 6 0 0 1-6 5H37a6 6 0 0 1-6-5l-2-24Z" fill="#e8b878"/>
          <circle cx="58" cy="20" r="9" fill="#f4d5c6" stroke="#b35a42" stroke-width="2"/>
          <rect x="35" y="45" width="8" height="8" rx="1.5" transform="rotate(-10 35 45)" fill="#fcf8f1" stroke="#9c5e35" stroke-width="1.6"/>
          <rect x="46" y="50" width="8" height="8" rx="1.5" transform="rotate(12 46 50)" fill="#fcf8f1" stroke="#9c5e35" stroke-width="1.6"/>
          <path d="M48 12l-6 26" stroke="#e09b5b" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`;
    case "甜點":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <ellipse cx="45" cy="70" rx="29" ry="5" stroke="#e09b5b" stroke-width="1.8"/>
          <path d="m18 50 29-23 24 19-28 24-25-20Z" fill="#f0d39d" stroke="#3b2316" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M18 50v9l25 15v-9L18 50Zm25 15 28-19v9L43 74v-9Z" fill="#c48352" stroke="#3b2316" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="m24 49 23-18 17 14-23 18-17-14Z" fill="#fcf6ea" stroke="#3b2316" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M28 46c7-6 13-11 20-15 5 4 10 8 15 13" stroke="#b35a42" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="48" cy="33" r="4" fill="#b35a42"/>
          <path d="M48 29c-2-3-5-3-6-2m10 4c3-3 5-2 6-1" stroke="#e09b5b" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`;
    case "冰咖啡":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M26 22h36l-4 44a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6l-4-44Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
          <path d="M28 33h32l-3 33a5 5 0 0 1-5 4H36a5 5 0 0 1-5-4l-3-33Z" fill="#6b3c21"/>
          <path d="M28 33h32" stroke="#c89464" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="33" y="39" width="10" height="10" rx="2" transform="rotate(-8 33 39)" fill="#f7efe2" stroke="#3b2316" stroke-width="1.6"/>
          <rect x="45" y="44" width="10" height="10" rx="2" transform="rotate(10 45 44)" fill="#f7efe2" stroke="#3b2316" stroke-width="1.6"/>
        </svg>`;
    default:
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M21 30h38v19a17 17 0 0 1-17 17h-4a17 17 0 0 1-17-17V30Z" fill="#fcf8f1" stroke="#3b2316" stroke-width="2.2"/>
          <path d="M59 36h6a6 6 0 0 1 0 12h-7" stroke="#fcf8f1" stroke-width="3.6" stroke-linecap="round"/>
          <path d="M59 36h6a6 6 0 0 1 0 12h-7" stroke="#3b2316" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="40" cy="31" rx="18" ry="4" fill="#9c5e35" stroke="#3b2316" stroke-width="1.8"/>
          <path d="M33 43c3-4 7-5 7-1 0-4 4-3 7 1 1 5-7 9-7 9s-8-4-7-9Z" fill="#9c5e35"/>
          <path d="M34 22c-2-4 2-5 0-9m12 9c-2-4 2-5 0-9" stroke="#e09b5b" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 68h44" stroke="#e09b5b" stroke-width="2.6" stroke-linecap="round"/>
        </svg>`;
  }
}

function scaleAmountText(amount, factor) {
  if (factor === 1) return String(amount);
  const raw = String(amount);
  if (raw.includes("°C") || raw.includes("「")) return raw;

  return raw.replace(/\d[\d,]*(?:\.\d+)?/g, (match) => {
    const clean = match.replace(/,/g, "");
    const num = parseFloat(clean) * factor;
    if (Number.isNaN(num)) return match;
    const hasComma = match.includes(",") || num >= 1000;
    if (Number.isInteger(num)) {
      return hasComma ? num.toLocaleString("en-US") : String(num);
    }
    const rounded = Number(num.toFixed(1));
    return hasComma ? rounded.toLocaleString("en-US") : String(rounded);
  });
}

function updateCategoryCounts() {
  filterButtons.forEach((button) => {
    const cat = button.dataset.category;
    const count = cat === "全部"
      ? recipes.length
      : recipes.filter((item) => item.category === cat).length;
    const formatted = String(count).padStart(2, "0");
    let badge = button.querySelector("span:not(.chip-icon)");
    if (!badge) {
      badge = document.createElement("span");
      button.appendChild(badge);
    }
    badge.textContent = formatted;
    /* 若該分類目前為 0 筆（例如特調），自動隱藏按鈕避免空分類干擾 */
    if (cat !== "全部") {
      button.hidden = count === 0;
    }
  });
}

function recipeCard(recipe, index) {
  const accent = ["rose", "sage", "cream"].includes(recipe.accent) ? recipe.accent : "cream";
  const menuNo = `NO.${String(index + 1).padStart(2, "0")}`;
  const servingSpec = getRecipeServingSpec(recipe);
  const totalIngredients = (recipe.ingredients || []).length;
  const previewIngredients = (recipe.ingredients || [])
    .slice(0, 4)
    .map((ing) => {
      const cleanName = ing.name.replace(/（.*?）/g, "");
      const shortAmount = String(ing.amount).replace(/（.*?）/g, "").trim();
      return `<span class="card-ingredient-pill"><b>${escapeHTML(cleanName)}</b><em>${escapeHTML(shortAmount)}</em></span>`;
    })
    .join("");
  const extraCount = totalIngredients > 4 ? `<span class="card-ingredient-pill is-more">+${totalIngredients - 4} 項</span>` : "";

  return `
    <article class="recipe-card accent-${accent}" style="--card-index:${index}" data-recipe="${escapeHTML(recipe.slug)}">
      <div class="card-art" aria-hidden="true">
        <span class="card-art-label">
          ${categoryPulsoIcon(recipe.category)}
          ${escapeHTML(recipe.category)}
        </span>
        <span class="card-art-yield">${menuNo}</span>
        <span class="card-orbit orbit-one"></span><span class="card-orbit orbit-two"></span>
        ${recipeIllustration(recipe)}
        <span class="card-art-mark">${escapeHTML(recipe.title.slice(0, 1))}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="meta-badge meta-tone-${servingSpec.tone}">
            ${servingSpec.icon}
            ${escapeHTML(servingSpec.label)}
          </span>
          <span class="meta-badge">
            ${PULSO_ICONS.flame}
            ${escapeHTML(recipe.level)}
          </span>
        </div>
        <h3>${escapeHTML(recipe.title)}</h3>
        <p>${escapeHTML(recipe.summary)}</p>
        <div class="card-ingredients-preview" aria-label="主要材料與用量">
          ${previewIngredients}${extraCount}
        </div>
        <div class="card-footer-row">
          <span class="card-yield-text">
            ${PULSO_ICONS.scale}
            ${escapeHTML(recipe.yield)}
          </span>
          <button class="card-open" type="button" data-recipe="${escapeHTML(recipe.slug)}" aria-label="查看${escapeHTML(recipe.title)}配方明細">
            <span>製作步驟</span>
            <span class="card-open-icon" aria-hidden="true">${PULSO_ICONS.arrowUpRight}</span>
          </button>
        </div>
      </div>
    </article>`;
}

function getVisibleRecipes() {
  if (!searchInput) return recipes;
  const query = searchInput.value.trim().toLocaleLowerCase("zh-Hant");
  return recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "全部" || recipe.category === selectedCategory;
    const ingredientNames = (recipe.ingredients || []).map((i) => `${i.name} ${i.amount}`).join(" ");
    const haystack = [recipe.title, recipe.category, recipe.summary, recipe.note, ingredientNames]
      .join(" ")
      .toLocaleLowerCase("zh-Hant");
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function renderRecipes() {
  if (!grid || !searchInput) return;
  const query = searchInput.value.trim();
  if (searchClear) {
    searchClear.hidden = query.length === 0;
  }

  const visibleRecipes = getVisibleRecipes();
  const groupCounts = visibleRecipes.reduce(
    (acc, item) => {
      const key = item.category === "甜點" ? "甜點" : "飲品";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  let previousGroup = "";
  grid.innerHTML = visibleRecipes.map((recipe, index) => {
    const group = recipe.category === "甜點" ? "甜點" : "飲品";
    const groupIcon = group === "甜點" ? PULSO_ICONS.cakeSlice : PULSO_ICONS.cupSoda;
    const groupEn = group === "甜點" ? "PATISSERIE & SWEETS" : "BARISTA DRINKS & COFFEE";
    const heading = group !== previousGroup
      ? `<div class="recipe-group-heading">
          <div class="group-heading-title">
            <span class="group-heading-icon" aria-hidden="true">${groupIcon}</span>
            <h3>${group}</h3>
            <span class="group-heading-en">${groupEn}</span>
          </div>
          <span class="group-heading-count">共 ${groupCounts[group]} 款配方</span>
        </div>`
      : "";
    previousGroup = group;
    return heading + recipeCard(recipe, index);
  }).join("");

  const categoryLabel = selectedCategory === "全部" ? "全部類別" : `「${selectedCategory}」`;
  resultCount.textContent = query
    ? `${categoryLabel}中包含「${query}」共找到 ${visibleRecipes.length} 份配方`
    : `目前顯示 ${categoryLabel} · 共 ${visibleRecipes.length} 份配方`;

  emptyState.hidden = visibleRecipes.length !== 0;
}

function renderDialogContent(recipe, scale = 1) {
  const accent = ["rose", "sage", "cream"].includes(recipe.accent) ? recipe.accent : "cream";
  const currentIndex = recipes.findIndex((item) => item.slug === recipe.slug);
  const prevRecipe = recipes[(currentIndex - 1 + recipes.length) % recipes.length];
  const nextRecipe = recipes[(currentIndex + 1) % recipes.length];
  const servingSpec = getRecipeServingSpec(recipe);

  dialogContent.innerHTML = `
    <div class="dialog-header-band accent-${accent}">
      <div class="dialog-kicker-row">
        <span class="dialog-cat-pill">
          ${categoryPulsoIcon(recipe.category)}
          ${escapeHTML(recipe.category)}
        </span>
        <span class="dialog-serving-pill tone-${servingSpec.tone}">
          ${servingSpec.icon}
          ${escapeHTML(servingSpec.label)}
        </span>
      </div>
      <h2 id="dialog-title">${escapeHTML(recipe.title)}</h2>
      <p class="dialog-summary">${escapeHTML(recipe.summary)}</p>
      <div class="dialog-facts">
        <div class="dialog-badges">
          <span>${PULSO_ICONS.scale} 份量：${escapeHTML(scaleAmountText(recipe.yield, scale))}</span>
          <span>${PULSO_ICONS.flame} 難度：${escapeHTML(recipe.level)}</span>
        </div>
        <div class="serving-scaler" role="group" aria-label="調整配方份量">
          <span class="scaler-label">份量換算</span>
          ${[1, 2, 3]
            .map(
              (factor) =>
                `<button type="button" class="scaler-btn ${scale === factor ? "is-active" : ""}" data-scale="${factor}" aria-pressed="${scale === factor}">${factor}x</button>`
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="dialog-body">
      <section class="dialog-section">
        <div class="dialog-section-header">
          <h3>準備材料（共 ${recipe.ingredients.length} 項）</h3>
          <span class="dialog-hint">點擊項目可打勾備料</span>
        </div>
        <ul class="ingredient-list">
          ${recipe.ingredients
            .map((item) => {
              const scaledAmount = scaleAmountText(item.amount, scale);
              const pendingAmount = isPendingText(item.amount) || isPendingText(item.name);
              return `
            <li role="checkbox" aria-checked="false" tabindex="0" class="${pendingAmount ? "has-pending-amount" : ""}">
              <span class="ingredient-check" aria-hidden="true">${PULSO_ICONS.check}</span>
              <span class="ingredient-name">${escapeHTML(item.name)}</span>
              <span class="ingredient-amount ${pendingAmount ? "is-pending" : ""}">${escapeHTML(scaledAmount)}</span>
            </li>`;
            })
            .join("")}
        </ul>
      </section>
      <section class="dialog-section">
        <div class="dialog-section-header">
          <h3>製作與沖煮步驟</h3>
        </div>
        <ol class="instruction-list">
          ${recipe.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}
        </ol>
      </section>
      <div class="recipe-note">
        <span aria-hidden="true">${PULSO_ICONS.sparkles}</span>
        <div>
          <strong>吧台調整筆記</strong>
          <p>${escapeHTML(recipe.note)}</p>
        </div>
      </div>
      ${
        recipes.length > 1
          ? `<div class="dialog-footer-nav">
              <button type="button" class="dialog-nav-btn" data-nav-slug="${escapeHTML(prevRecipe.slug)}">
                ${PULSO_ICONS.arrowLeft}
                <span>${escapeHTML(prevRecipe.title)}</span>
              </button>
              <button type="button" class="dialog-nav-btn" data-nav-slug="${escapeHTML(nextRecipe.slug)}">
                <span>${escapeHTML(nextRecipe.title)}</span>
                ${PULSO_ICONS.arrowRight}
              </button>
            </div>`
          : ""
      }
    </div>`;
}

function showRecipe(slug) {
  const recipe = recipes.find((item) => item.slug === slug);
  if (!recipe || !recipeDialog) return;

  currentSlug = slug;
  currentScale = 1;
  renderDialogContent(recipe, currentScale);

  if (!recipeDialog.open) {
    recipeDialog.showModal();
  }
}

async function loadRecipes() {
  if (!grid) return;
  try {
    const response = await fetch("content/recipes.json?v=20261115-bar-ui", { cache: "no-store" });
    if (!response.ok) throw new Error("配方資料讀取失敗");
    recipes = await response.json();
    updateCategoryCounts();
    renderRecipes();
  } catch (error) {
    resultCount.textContent = "暫時無法載入配方，請稍後重新整理。";
    console.error(error);
  }
}

function setActiveCategory(category) {
  selectedCategory = category;
  filterButtons.forEach((item) => {
    const active = item.dataset.category === category;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderRecipes);
}

if (searchClear && searchInput) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    renderRecipes();
  });
}

if (resetFiltersBtn && searchInput) {
  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    setActiveCategory("全部");
    renderRecipes();
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveCategory(button.dataset.category);
    renderRecipes();
  });
});

if (grid) {
  grid.addEventListener("click", (event) => {
    const cardOrBtn = event.target.closest("[data-recipe]");
    if (cardOrBtn) showRecipe(cardOrBtn.dataset.recipe);
  });
}

if (recipeDialog) {
  recipeDialog.addEventListener("click", (event) => {
    if (event.target === recipeDialog) {
      recipeDialog.close();
      return;
    }

    const scaleBtn = event.target.closest("[data-scale]");
    if (scaleBtn && currentSlug) {
      currentScale = Number(scaleBtn.dataset.scale) || 1;
      const recipe = recipes.find((item) => item.slug === currentSlug);
      if (recipe) renderDialogContent(recipe, currentScale);
      return;
    }

    const navBtn = event.target.closest("[data-nav-slug]");
    if (navBtn) {
      showRecipe(navBtn.dataset.navSlug);
      return;
    }

    const ingredientRow = event.target.closest(".ingredient-list li");
    if (ingredientRow) {
      const checked = ingredientRow.classList.toggle("is-checked");
      ingredientRow.setAttribute("aria-checked", String(checked));
    }
  });

  recipeDialog.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".ingredient-list li")) {
      event.preventDefault();
      const checked = event.target.classList.toggle("is-checked");
      event.target.setAttribute("aria-checked", String(checked));
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (searchInput && event.key === "/" && document.activeElement !== searchInput && (!recipeDialog || !recipeDialog.open)) {
    event.preventDefault();
    searchInput.focus();
  }
});

// Brew Guide Interactive Ratio Calculator
const calcCoffee = document.querySelector("#calc-coffee");
const calcRatio = document.querySelector("#calc-ratio");
if (calcCoffee && calcRatio) {
  const coffeeVal = document.querySelector("#calc-coffee-val");
  const ratioVal = document.querySelector("#calc-ratio-val");
  const bloomOut = document.querySelector("#calc-bloom");
  const totalOut = document.querySelector("#calc-total");
  const stampCoffee = document.querySelector("#stamp-coffee");
  const stampWater = document.querySelector("#stamp-water");

  function updateBrewCalc() {
    const coffee = Number(calcCoffee.value);
    const ratio = Number(calcRatio.value);
    const totalWater = Math.round(coffee * ratio);
    const bloomWater = Math.round(coffee * 2.3);

    if (coffeeVal) coffeeVal.textContent = `${coffee} g`;
    if (ratioVal) ratioVal.textContent = `1 : ${ratio}`;
    if (bloomOut) bloomOut.textContent = `約 ${bloomWater} g`;
    if (totalOut) totalOut.textContent = `${totalWater} g`;
    if (stampCoffee) stampCoffee.textContent = `${coffee} g`;
    if (stampWater) stampWater.textContent = `${totalWater} g`;
  }

  calcCoffee.addEventListener("input", updateBrewCalc);
  calcRatio.addEventListener("input", updateBrewCalc);
  updateBrewCalc();
}

async function loadBeanPresets() {
  const selector = document.querySelector("#bean-select");
  const profile = document.querySelector("#bean-profile");
  if (!selector || !calcRatio) return;

  try {
    const response = await fetch("content/beans.json?v=20261115-bean-picker", { cache: "no-store" });
    if (!response.ok) throw new Error("豆款資料讀取失敗");
    const beans = await response.json();

    beans.forEach((bean) => {
      const option = document.createElement("option");
      option.value = bean.id;
      option.textContent = `${bean.name}（建議 1:${bean.suggestedRatio}）`;
      selector.appendChild(option);
    });

    function renderBeanCard(bean) {
      if (!bean) {
        profile.innerHTML = `
          <div class="bean-empty-hint">
            ${PULSO_ICONS.bean}
            <span>選擇上方豆款，即可帶入<strong>建議起始粉水比</strong>、烘焙度與風味筆記。</span>
          </div>`;
        return;
      }

      const flavorTags = String(bean.profile || "")
        .split(/[、,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => `<span class="bean-flavor-pill">${escapeHTML(tag)}</span>`)
        .join("");

      profile.innerHTML = `
        <div class="bean-card-head">
          <div class="bean-meta-pills">
            <span class="bean-origin-pill">${PULSO_ICONS.bean} ${escapeHTML(bean.origin)}</span>
            <span class="bean-roast-pill">${escapeHTML(bean.roast)}</span>
          </div>
          <span class="bean-ratio-badge">建議起始 1 : ${escapeHTML(bean.suggestedRatio)}</span>
        </div>
        <div class="bean-flavors" aria-label="常見風味">${flavorTags}</div>
        <p class="bean-advice">${PULSO_ICONS.sparkles} <span>${escapeHTML(bean.advice)}</span></p>`;
    }

    renderBeanCard(null);

    selector.addEventListener("change", () => {
      const bean = beans.find((item) => item.id === selector.value);
      if (!bean) {
        renderBeanCard(null);
        return;
      }

      calcRatio.value = String(bean.suggestedRatio);
      calcRatio.dispatchEvent(new Event("input", { bubbles: true }));
      renderBeanCard(bean);
    });
  } catch (error) {
    selector.disabled = true;
    profile.textContent = "豆款建議暫時無法載入，仍可使用下方粉水比滑桿自行試算。";
    console.error(error);
  }
}

loadRecipes();
loadBeanPresets();
