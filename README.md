# newbie-handbook

把一段技術流程，翻譯成完全不懂技術的人可以邊看邊照做的 A4 圖文 PDF 手冊。

## 為什麼會有這個 skill

請 AI 寫教學文件，最常見的兩種壞掉方式是：

1. **一開始就沒問對問題**，結果整份手冊的範圍、難度、格式都偏掉，寫得再漂亮也要重做。
2. **寫出來很像 AI 寫的**——開場戴一頂時代大帽子、每個步驟後面喊一次加油、結尾一句萬用祝福，讀者看完還是不知道自己有沒有做對。

這個 skill 用三件事處理這兩個問題：

- **Grilling 前置三題**：動筆前先問「教什麼／給誰／拿去幹嘛」，等回覆才動筆。這三題決定手冊 60–80% 的架構。
- **微步驟規則**：一步一動作、每步交代「做什麼→在哪做→看到什麼算成功」、每步都有卡關出口。
- **教學情境專用的去 AI 味清單**：24 條禁用規則，每條附一組教學句正反例，並且帶一份假陽性白名單——步驟編號、正式語域、簡短指令句都不算 AI 味，不會被誤殺。

成品是米白＋橘色調的 A4 直式 PDF，每個步驟配一張真實截圖或介面示意圖，經 Playwright 渲染並逐頁視覺校稿。成品保持中立：不放署名、社群帳號、QR code、可點連結或行銷導流。讀者要照著貼上或比對的網址（例如登入設定用的回呼網址）會用純文字印出來，但不做成可點的連結。

步驟圖的來源照四層優先序挑：使用者提供真圖 > Playwright 實拍公開網頁 > 官方文件圖（標註出處）> CSS 介面示意（誠實標示）。教的是網頁工具、那個頁面又不用登入就看得到的時候，它會用你為了輸出 PDF 本來就裝好的 Playwright 直接把畫面拍下來當步驟圖，不必只能畫示意。登入牆後面的頁面它不會代你登入去拍，手機 App 的原生畫面也拍不到，這兩種情況退回你自己提供的截圖或介面示意，並且照實標示是哪一種。

要登入才看得到的後台，第一版會先用介面示意做成「草稿版」，同時附一份「照做時要截哪幾張圖」的清單。你拿真帳號照做一遍、把截圖傳回來，換成真圖、按鈕字樣也照真圖改過之後，才標成正式版。

## 安裝

需要 Claude Code（或任何支援 Agent Skills 的執行環境）。先取得這個 repo：

```bash
git clone https://github.com/DennisWei9898/newbie-handbook.git
```

不想用 git 的話，直接從 GitHub 頁面下載 ZIP 解壓縮也一樣。

把 skill 資料夾整包複製到你的 skills 目錄：

```bash
mkdir -p ~/.claude/skills
cp -R newbie-handbook/skills/newbie-handbook ~/.claude/skills/
ls ~/.claude/skills/newbie-handbook
```

最後那行應該列出 `SKILL.md`、`assets`、`references` 三項。**`references/` 一定要跟著複製**——核心規則都在裡面，少了它 skill 會停下來要求你確認資料夾有沒有複製完整。

渲染 PDF 需要 Playwright。還沒裝過的話：

```bash
npm install -g playwright
npx playwright install chromium
```

產 PDF 時如果找不到 Playwright 自帶的瀏覽器（Playwright 更新過之後常見），`render.mjs` 會自動改用電腦上的 Google Chrome。兩個都開不起來，它會印一段白話說明，告訴你發生什麼事、可以怎麼做。

## 用法

裝好之後，直接用自然語言描述你要的手冊就會觸發，例如：

> 幫我做一份手冊，教完全不會用電腦的同事把公司的共用資料夾同步到他的筆電。

接下來會發生的事：

1. **它會先問你三題**（教什麼／給誰／拿去幹嘛），然後停下來等你回答。這是刻意的——不回答它不會開始寫。任務很瑣碎、或你一句話已經把三件事講齊了，它會直接跳過。
2. 收到回答後複述一次它的理解，確認沒有會錯意。
3. 查官方文件核對指令、網址與按鈕名稱。
4. 從 `assets/template.html` 開一份 `index.html`，逐頁填內容。
5. 渲染成 PDF，同時輸出逐頁 QA 截圖：

```bash
node render.mjs index.html "安裝手冊.pdf"
```

6. 逐頁看過 QA 截圖檢查跑版與內容，修好之後刪掉截圖，交付 PDF 與 HTML 原稿。

想直接看成品長什麼樣子，`examples/` 裡有一份完整跑出來的手冊（HTML 原稿與 PDF）。

## 目錄結構

```
newbie-handbook/
├── README.md
├── LICENSE
├── examples/                       完整跑過一次的手冊成品（HTML + PDF）
└── skills/
    └── newbie-handbook/
        ├── SKILL.md                入口：定位、鐵律、工作流程
        ├── references/
        │   ├── grilling.md         前置提問三題、複述鎖定、跳過判準、追問樹、外部條件檢查
        │   ├── writing-eli5-cba.md 結論先行、白話翻譯、生活化比喻、三輪自檢、留白門檻、截圖可點元素檢查
        │   ├── microsteps.md       微步驟粒度 14 條
        │   ├── deai-teaching.md    去 AI 味禁用清單 24 條、假陽性白名單、機器閘自測
        │   └── real-screenshots.md 畫面來源四層優先序、Playwright 實拍、圖上標記、四條邊界、登入後台兩階段、中英並列字樣
        └── assets/
            ├── template.html       A4 六頁骨架、設計系統與步驟頁新元件
            └── render.mjs          HTML → A4 PDF ＋ 逐頁 QA 截圖，找不到瀏覽器時改用 Chrome
```

## 授權

MIT，見 `LICENSE`。
