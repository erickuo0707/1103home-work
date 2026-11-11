# 萃光咖啡筆記

一個用來整理咖啡配方與沖煮心得的繁體中文小網站。配方採 JSON 資料維護，網站以原生 HTML、CSS、JavaScript 製作，不需安裝套件或建置。

## 專案簡介

首頁提供配方搜尋、分類篩選與配方詳細視窗；沖煮指南示範如何記錄手沖比例與調整變因。這個專案的重點是讓內容能持續增加：新增配方只需補上符合規格的資料，新增主題頁則可複製頁面模板。

## 網站頁面

- `site/index.html`：配方索引、搜尋、分類篩選與配方明細。
- `site/brew-guide.html`：手沖入門與記錄方法。
- `templates/page-template.html`：建立新主題頁的起始模板，不會發布到網站。

## 本機預覽

在專案根目錄執行：

```powershell
python -m http.server 8000 --directory site
```

再以瀏覽器開啟 `http://localhost:8000`。使用本機伺服器可讓瀏覽器正常讀取 JSON 配方資料。

## 新增配方

1. 閱讀根目錄的 `AGENTS.md`。
2. 在 `site/content/recipes.json` 新增一筆完整資料，沿用既有欄位與分類。
3. 確認 `slug` 唯一、JSON 格式正確，並把未實測的比例標為起始比例或試作筆記。
4. 預覽首頁，確認搜尋、分類與明細視窗能呈現新配方。

## 新增主題頁

複製 `templates/page-template.html` 到 `site/pages/<slug>.html`，依 `AGENTS.md` 替換模板欄位、保留共用樣式與相對路徑，再加入導覽連結並更新本 README 的網站頁面清單。

## GitHub Pages

GitHub Actions 會將 `site/` 發布為靜態網站。將專案推送到 GitHub 的 `main` 分支後，在儲存庫 Settings → Pages 將來源設為 GitHub Actions；之後每次推送都會自動更新網站。

- GitHub Repository：https://github.com/erickuo0707/1103home-work
- 網頁成果：預期網址為 `https://erickuo0707.github.io/1103home-work/`，以 GitHub Pages 部署結果為準

## AI 延伸方式

AI 開始修改前先讀 `AGENTS.md`，因此會知道資料要放在哪裡、欄位如何命名、哪些分類可用、頁面如何沿用版型，以及哪些比例需要註明為試作。這能減少每次新增內容時重複解釋，也讓網站資料與版型保持一致。
