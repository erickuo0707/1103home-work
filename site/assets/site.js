const grid = document.querySelector("#recipe-grid");
const searchInput = document.querySelector("#recipe-search");
const filterButtons = [...document.querySelectorAll("[data-category]")];
const resultCount = document.querySelector("#results-count");
const recipeTotal = document.querySelector("#recipe-total");
const emptyState = document.querySelector("#empty-state");
const recipeDialog = document.querySelector("#recipe-dialog");
const dialogContent = document.querySelector("#dialog-content");

let recipes = [];
let selectedCategory = "全部";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function recipeCard(recipe, index) {
  const accent = ["rose", "sage", "cream"].includes(recipe.accent) ? recipe.accent : "cream";
  return `
    <article class="recipe-card accent-${accent}" style="--card-index:${index}">
      <div class="card-art" aria-hidden="true">
        <span class="card-art-label">${escapeHTML(recipe.category)}</span>
        <span class="card-orbit orbit-one"></span><span class="card-orbit orbit-two"></span>
        <span class="card-cup"><span></span></span>
        <span class="card-art-mark">${escapeHTML(recipe.title.slice(0, 1))}</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><span>${escapeHTML(recipe.time)}</span><span>${escapeHTML(recipe.level)}</span></div>
        <h3>${escapeHTML(recipe.title)}</h3>
        <p>${escapeHTML(recipe.summary)}</p>
        <button class="card-open" type="button" data-recipe="${escapeHTML(recipe.slug)}" aria-label="查看${escapeHTML(recipe.title)}配方">看配方 <span aria-hidden="true">↗</span></button>
      </div>
    </article>`;
}

function renderRecipes() {
  const query = searchInput.value.trim().toLocaleLowerCase("zh-Hant");
  const visibleRecipes = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "全部" || recipe.category === selectedCategory;
    const haystack = [recipe.title, recipe.category, recipe.summary, recipe.note].join(" ").toLocaleLowerCase("zh-Hant");
    return matchesCategory && (!query || haystack.includes(query));
  });

  grid.innerHTML = visibleRecipes.map(recipeCard).join("");
  resultCount.textContent = `找到 ${visibleRecipes.length} 份配方`;
  emptyState.hidden = visibleRecipes.length !== 0;
}

function showRecipe(slug) {
  const recipe = recipes.find((item) => item.slug === slug);
  if (!recipe) return;

  dialogContent.innerHTML = `
    <p class="eyebrow">${escapeHTML(recipe.category)} <span>／ ${escapeHTML(recipe.time)}</span></p>
    <h2 id="dialog-title">${escapeHTML(recipe.title)}</h2>
    <p class="dialog-summary">${escapeHTML(recipe.summary)}</p>
    <div class="dialog-facts"><span>${escapeHTML(recipe.yield)}</span><span>${escapeHTML(recipe.level)}</span></div>
    <section class="dialog-section"><h3>準備材料</h3><ul class="ingredient-list">${recipe.ingredients.map((item) => `<li><span>${escapeHTML(item.amount)}</span>${escapeHTML(item.name)}</li>`).join("")}</ul></section>
    <section class="dialog-section"><h3>製作步驟</h3><ol class="instruction-list">${recipe.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol></section>
    <p class="recipe-note"><span aria-hidden="true">✳</span>${escapeHTML(recipe.note)}</p>`;

  recipeDialog.showModal();
}

async function loadRecipes() {
  try {
    const response = await fetch("content/recipes.json");
    if (!response.ok) throw new Error("配方資料讀取失敗");
    recipes = await response.json();
    recipeTotal.textContent = String(recipes.length).padStart(2, "0");
    renderRecipes();
  } catch (error) {
    resultCount.textContent = "暫時無法載入配方，請稍後重新整理。";
    console.error(error);
  }
}

searchInput.addEventListener("input", renderRecipes);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderRecipes();
  });
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recipe]");
  if (button) showRecipe(button.dataset.recipe);
});

recipeDialog.addEventListener("click", (event) => {
  if (event.target === recipeDialog) recipeDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput && !recipeDialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
});

loadRecipes();
