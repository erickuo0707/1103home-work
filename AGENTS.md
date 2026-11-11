# 萃光咖啡筆記｜AI 協作規則

## 專案目的

「萃光咖啡筆記」是繁體中文的咖啡飲品、甜點配方與沖煮筆記網站。網站把配方、材料比例和調整心得整理成容易閱讀、容易新增的內容，讓訪客能依想喝的飲品或想做的甜點找到方向，再按材料與器材微調。

這個專案也示範一套可重複使用的 AI 協作方式：配方以 JSON 資料維護，文章頁依共用頁面模板製作，版型與互動集中在共用 CSS/JavaScript。

## 開始修改前

1. 閱讀本文件和 `README.md`。
2. 依工作範圍檢查 `site/index.html`、`site/brew-guide.html`、`site/assets/site.css`、`site/assets/site.js` 與 `site/content/recipes.json`。
3. 先確認需求是新增配方、修改共用版型，或新增主題頁，再只修改相關檔案。
4. 若資料欄位或路徑需要改動，先說明影響範圍，並同步更新本文件與 README。

## 專案結構

```text
coffee-notes/
├── AGENTS.md                     # AI 協作規則，所有修改的第一份參考
├── README.md                     # 專案介紹、本機預覽與發布方式
├── templates/
│   └── page-template.html         # 新增主題頁時複製使用
├── site/                         # GitHub Pages 發布根目錄
│   ├── index.html                 # 首頁與可搜尋、篩選的配方索引
│   ├── brew-guide.html            # 手沖入門內容頁
│   ├── assets/
│   │   ├── site.css               # 全站色彩、排版、卡片與響應式樣式
│   │   └── site.js                # 讀取配方資料、搜尋、分類與詳細視窗
│   └── content/
│       └── recipes.json           # 咖啡飲品與甜點的唯一配方資料來源
└── .github/workflows/pages.yml    # 將 site/ 發布到 GitHub Pages
```

## 內容與資料規則

### 配方資料

- 配方只能寫在 `site/content/recipes.json`，不能把配方內容另外硬編碼在 `site/assets/site.js`。
- 檔案必須是 JSON 陣列。新增一個物件，不要改動既有物件的 `slug`。
- 每筆資料必須包含下列欄位：

```json
{
  "slug": "kebab-case-unique-id",
  "title": "繁體中文配方名稱",
  "category": "特調或甜點",
  "accent": "rose",
  "summary": "一句話說明味道與配方特色。",
  "time": "5 分鐘",
  "level": "簡單",
  "yield": "1 杯",
  "ingredients": [
    { "amount": "1 份", "name": "材料名稱" }
  ],
  "steps": ["清楚、可照做的步驟。"],
  "note": "註明可調整的比例，或這筆配方仍在試作。"
}
```

- `slug` 使用小寫英文、數字與連字號，且必須唯一。
- `category` 目前使用 `冰咖啡`、`奶咖`、`手沖`、`特調`、`甜點`；新增分類時，需同步更新 `site/index.html` 的分類按鈕，並在 `site/assets/site.js` 提供對應插畫。首頁總筆數由 JavaScript 自動計算，不要另寫固定數字。
- `accent` 只使用 `rose`、`sage`、`cream`；新增色系時，先在 `site/assets/site.css` 定義樣式。
- 標題、摘要、材料與步驟使用自然的繁體中文；份量要有單位，步驟用動詞開頭。
- 未實測或會受豆子、器材、品牌影響的比例，明確標示為「起始比例」或「試作筆記」，不要寫成唯一標準。
- 原筆記未提供的份量、單位、溫度或烘烤時間，標示為「未記錄」或「待確認」並寫入 `note`；不可自行推算成確定數值。
- 新增配方後，檢查 JSON 逗號、欄位拼字與 `slug` 唯一性；不要加入外部追蹤碼、API 金鑰或個人資料。

### 新增主題頁

1. 複製 `templates/page-template.html`，存到 `site/pages/<slug>.html`。
2. 使用小寫英文連字號命名檔案；將模板中的 `{{PAGE_TITLE}}`、`{{PAGE_SUMMARY}}`、`{{PAGE_LABEL}}` 與 `{{PAGE_CONTENT}}` 全部換成完成內容。
3. 保留模板的語言設定、頁首、頁尾、語意化標題順序、共用 CSS 路徑與行動版版面。
4. 在首頁或相關頁面加入連結；相對資源路徑需符合 `site/pages/` 的目錄深度。
5. 在 README 的「網站頁面」清單新增頁名與用途。

### 新增配方分類頁以外的內容

較短的沖煮知識可新增為主題頁；可重複查找與比較的飲品，則新增至配方 JSON。不要把長篇教學塞進配方卡，也不要為單筆配方複製一份新首頁。

## 介面與程式規則

- 維持目前的視覺方向：暖米白底色、深咖啡文字、鼠尾草綠與柔和莓果色點綴；使用留白、細線和清楚的字級層次。
- 介面文字使用繁體中文。保留「萃光咖啡筆記」品牌名稱，首頁內容需同時容納咖啡飲品與甜點；不加入虛構評價、數據或專業認證。
- 網站使用原生 HTML、CSS、JavaScript；除非使用者明確要求，勿加入框架、套件、建置工具、後端或 API。
- 全站樣式放在 `site/assets/site.css`，共用互動放在 `site/assets/site.js`。避免為單一配方建立專屬程式分支。
- HTML 使用語意化標籤與正確標題層級；互動控制項需有可讀名稱、鍵盤操作方式和清楚的焦點狀態。
- 保持手機、平板、桌面都可閱讀；不要只靠顏色傳達分類或狀態。
- 網站內部連結使用相對路徑，讓 GitHub Pages 專案子路徑也能正常運作。不要依賴外部字型或 CDN。
- SVG 裝飾圖若新增，標示為 `aria-hidden="true"`；若圖片有內容用途，提供繁體中文替代文字。
- 不新增 Cookie、登入、表單收集、分析追蹤或外部服務，除非需求明確要求並同步說明資料流。

## 修改與交付流程

1. 先辨認要改資料、版型、互動或文件。
2. 保持本專案是靜態、免建置的網站；保留 `site/` 為 GitHub Pages 發布目錄。
3. 若修改配方欄位，請一起更新 JSON 範例、`site/assets/site.js`、本文件和 README。
4. 可用 `python -m http.server 8000 --directory site` 在本機預覽，再開啟首頁及沖煮指南，檢視導覽、搜尋、分類篩選、配方詳細視窗和不同螢幕寬度。
5. GitHub Pages 由 `.github/workflows/pages.yml` 發布；修改部署目錄前，需同步更新 workflow 與 README。
6. 回報完成時，簡要列出改動檔案、預覽方式及仍待確認的配方試作項目。
