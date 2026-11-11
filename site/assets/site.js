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

function categoryIllustration(category) {
  switch (category) {
    case "手沖":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M22 22h44l-14 26h-16L22 22Z" fill="#faf8f2" stroke="#3f5041" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M62 26h6a5 5 0 0 1 0 10h-9" stroke="#3f5041" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M26 48h36M31 48l-4 22a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4l-4-22" fill="#f3efe4" stroke="#3f5041" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M31 62c8 3 18 3 26 0" stroke="#b66d52" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M38 15c-2-4 2-5 0-9m12 9c-2-4 2-5 0-9" stroke="#697963" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    case "特調":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M27 20h34l-3 46a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7l-3-46Z" fill="#faf8f2" stroke="#3f5041" stroke-width="2.2"/>
          <path d="M29 36c10 4 20 4 30 0" stroke="#b66d52" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="58" cy="20" r="9" fill="#eedcd3" stroke="#b66d52" stroke-width="2"/>
          <rect x="35" y="42" width="8" height="8" rx="1.5" transform="rotate(-10 35 42)" stroke="#697963" stroke-width="1.8"/>
          <rect x="46" y="48" width="8" height="8" rx="1.5" transform="rotate(12 46 48)" stroke="#697963" stroke-width="1.8"/>
          <path d="M48 12l-6 26" stroke="#3f5041" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    case "冰咖啡":
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M26 22h36l-4 44a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6l-4-44Z" fill="#faf8f2" stroke="#3f5041" stroke-width="2.2"/>
          <path d="M28 34h32" stroke="#b66d52" stroke-width="2" stroke-linecap="round"/>
          <rect x="33" y="39" width="10" height="10" rx="2" transform="rotate(-8 33 39)" fill="#e6e2d4" stroke="#3f5041" stroke-width="1.8"/>
          <rect x="45" y="44" width="10" height="10" rx="2" transform="rotate(10 45 44)" fill="#e6e2d4" stroke="#3f5041" stroke-width="1.8"/>
          <circle cx="38" cy="60" r="2" fill="#697963"/>
          <circle cx="48" cy="59" r="1.5" fill="#b66d52"/>
        </svg>`;
    default:
      return `
        <svg class="card-illustration" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <path d="M21 30h38v19a17 17 0 0 1-17 17h-4a17 17 0 0 1-17-17V30Z" fill="#faf8f2" stroke="#3f5041" stroke-width="2.2"/>
          <path d="M59 36h6a6 6 0 0 1 0 12h-7" stroke="#3f5041" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M26 40c8 4 18 4 28 0" stroke="#b66d52" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M34 22c-2-4 2-5 0-9m12 9c-2-4 2-5 0-9" stroke="#697963" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 68h44" stroke="#3f5041" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`;
  }
}

function scaleAmountText(amount, factor) {
  if (factor === 1) return amount;
  return String(amount).replace(/\d+(?:\.\d+)?/g, (match) => {
    const num = parseFloat(match) * factor;
    return Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, "");
  });
}

function updateCategoryCounts() {
  filterButtons.forEach((button) => {
    const cat = button.dataset.category;
    const count = cat === "全部"
      ? recipes.length
      : recipes.filter((item) => item.category === cat).length;
    const formatted = String(count).padStart(2, "0");
    let badge = button.querySelector("span");
    if (!badge) {
      badge = document.createElement("span");
      button.appendChild(badge);
    }
    badge.textContent = formatted;
  });
}

function recipeCard(recipe, index) {
  const accent = ["rose", "sage", "cream"].includes(recipe.accent) ? recipe.accent : "cream";
  const previewIngredients = (recipe.ingredients || [])
    .slice(0, 3)
    .map((ing) => `<span class="card-ingredient-pill">${escapeHTML(ing.name)}</span>`)
    .join("");

  return `
    <article class="recipe-card accent-${accent}" style="--card-index:${index}" data-recipe="${escapeHTML(recipe.slug)}">
      <div class="card-art" aria-hidden="true">
        <span class="card-art-label">${escapeHTML(recipe.category)}</span>
        <span class="card-art-yield">${escapeHTML(recipe.yield)}</span>
        <span class="card-orbit orbit-one"></span><span class="card-orbit orbit-two"></span>
        ${categoryIllustration(recipe.category)}
        <span class="card-art-mark">${escapeHTML(recipe.title.slice(0, 1))}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span>⏱ ${escapeHTML(recipe.time)}</span>
          <span class="card-meta-dot" aria-hidden="true">·</span>
          <span>難度：${escapeHTML(recipe.level)}</span>
        </div>
        <h3>${escapeHTML(recipe.title)}</h3>
        <p>${escapeHTML(recipe.summary)}</p>
        <div class="card-ingredients-preview" aria-label="主要材料">${previewIngredients}</div>
        <button class="card-open" type="button" data-recipe="${escapeHTML(recipe.slug)}" aria-label="查看${escapeHTML(recipe.title)}配方明細">查看完整配方與比例 <span aria-hidden="true">↗</span></button>
      </div>
    </article>`;
}

function getVisibleRecipes() {
  if (!searchInput) return recipes;
  const query = searchInput.value.trim().toLocaleLowerCase("zh-Hant");
  return recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "全部" || recipe.category === selectedCategory;
    const ingredientNames = (recipe.ingredients || []).map((i) => i.name).join(" ");
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
  grid.innerHTML = visibleRecipes.map(recipeCard).join("");

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

  dialogContent.innerHTML = `
    <div class="dialog-header-band accent-${accent}">
      <p class="eyebrow">${escapeHTML(recipe.category)} <span>／ ${escapeHTML(recipe.time)}</span></p>
      <h2 id="dialog-title">${escapeHTML(recipe.title)}</h2>
      <p class="dialog-summary">${escapeHTML(recipe.summary)}</p>
      <div class="dialog-facts">
        <div class="dialog-badges">
          <span>份量：${escapeHTML(scaleAmountText(recipe.yield, scale))}</span>
          <span>難度：${escapeHTML(recipe.level)}</span>
          <span>時間：${escapeHTML(recipe.time)}</span>
        </div>
        <div class="serving-scaler" role="group" aria-label="調整配方杯數">
          <span class="scaler-label">杯數換算</span>
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
          <h3>準備材料</h3>
          <span class="dialog-hint">點擊項目可標記已備妥</span>
        </div>
        <ul class="ingredient-list">
          ${recipe.ingredients
            .map(
              (item) => `
            <li role="checkbox" aria-checked="false" tabindex="0">
              <span class="ingredient-check" aria-hidden="true">✓</span>
              <span class="ingredient-amount">${escapeHTML(scaleAmountText(item.amount, scale))}</span>
              <span>${escapeHTML(item.name)}</span>
            </li>`
            )
            .join("")}
        </ul>
      </section>
      <section class="dialog-section">
        <div class="dialog-section-header">
          <h3>製作步驟</h3>
        </div>
        <ol class="instruction-list">
          ${recipe.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}
        </ol>
      </section>
      <p class="recipe-note"><span aria-hidden="true">✳</span><span>${escapeHTML(recipe.note)}</span></p>
      ${
        recipes.length > 1
          ? `<div class="dialog-footer-nav">
              <button type="button" class="dialog-nav-btn" data-nav-slug="${escapeHTML(prevRecipe.slug)}">← ${escapeHTML(prevRecipe.title)}</button>
              <button type="button" class="dialog-nav-btn" data-nav-slug="${escapeHTML(nextRecipe.slug)}">${escapeHTML(nextRecipe.title)} →</button>
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
    const response = await fetch("content/recipes.json");
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

loadRecipes();
