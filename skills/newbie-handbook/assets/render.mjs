// newbie-handbook 渲染器：HTML → A4 PDF（含向量文字、可點連結）+ 逐頁 QA 截圖
// 用法：  node render.mjs [input.html] [output.pdf]
// 預設：  input=index.html  output="<input 檔名>.pdf"
// QA 截圖：輸出 qa-page-NN.png（供逐頁肉眼校稿；交付前請自行刪除）
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const input = process.argv[2] || 'index.html';
const output = process.argv[3] || input.replace(/\.html?$/i, '') + '.pdf';

const inPath = path.resolve(input);
if (!fs.existsSync(inPath)) { console.error('找不到輸入檔:', inPath); process.exit(1); }

// 解析 playwright：先試本地，失敗再抓 global（npm root -g）
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const groot = execSync('npm root -g').toString().trim();
  const mod = await import(pathToFileURL(path.join(groot, 'playwright', 'index.js')).href);
  chromium = mod.chromium ?? mod.default?.chromium;
}
if (!chromium) { console.error('無法載入 playwright，請先安裝：npm i -g playwright && npx playwright install chromium'); process.exit(1); }

// 開瀏覽器：先用 Playwright 自帶的；自帶的執行檔不在（常見於 Playwright 更新後版本對不上），改用電腦上已裝好的 Google Chrome。
// 兩個都開不起來，就印一段白話說明、exit 1，不把英文錯誤堆疊直接丟給使用者。
const firstLine = (e) => String(e?.message ?? e).split('\n').map((s) => s.trim()).find(Boolean) || '沒有錯誤訊息';
const isMissingBrowser = (e) => /Executable doesn't exist/i.test(String(e?.message ?? e));

function explainAndExit(lines, helpLine) {
  console.error(['', ...lines, '', '找人幫忙時，把下面這一行整行複製給對方：', `  ${helpLine}`, ''].join('\n'));
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch();
} catch (e1) {
  if (!isMissingBrowser(e1)) {
    explainAndExit([
      '✗ PDF 沒有產出來：瀏覽器打不開。',
      '',
      '發生什麼事：產 PDF 要在背景開一個瀏覽器，把手冊網頁印成 PDF。這次卡在瀏覽器啟動，原因不是瀏覽器沒裝。',
      '手冊的內容沒有壞，HTML 原稿還在，只差最後印成 PDF 這一步。',
      '',
      '你可以怎麼做：',
      '  1. 原封不動再跑一次同一行指令。',
      '  2. 重跑還是出現這段說明，就找人幫忙。',
    ], `[render.mjs] 瀏覽器啟動失敗：${firstLine(e1)}`);
  }
  try {
    browser = await chromium.launch({ channel: 'chrome' });
    console.log('ℹ 找不到 Playwright 自帶的瀏覽器，這次改用電腦上的 Google Chrome 產 PDF。');
  } catch (e2) {
    explainAndExit([
      '✗ PDF 沒有產出來：這台電腦上找不到能用的瀏覽器。',
      '',
      '發生什麼事：產 PDF 要在背景開一個瀏覽器，把手冊網頁印成 PDF。',
      'Playwright 自帶的瀏覽器不在這台電腦上（Playwright 更新過之後常見），改用電腦上的 Google Chrome 也沒開成功。',
      '手冊的內容沒有壞，HTML 原稿還在，只差最後印成 PDF 這一步。',
      '',
      '你可以怎麼做（擇一）：',
      '  1. 電腦上沒有 Google Chrome 的話，先安裝 Google Chrome，裝好後再跑一次同一行指令。',
      '  2. 請會用終端機的人跑下面這一行，把 Playwright 自帶的瀏覽器下載回來，跑完再產一次 PDF：',
      '       npx playwright install chromium',
    ], `[render.mjs] 自帶瀏覽器：${firstLine(e1)} ｜ 改用 Chrome：${firstLine(e2)}`);
  }
}

const outDir = path.dirname(path.resolve(output));
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(pathToFileURL(inPath).href, { waitUntil: 'networkidle' });

await page.pdf({ path: path.resolve(output), format: 'A4', printBackground: true, preferCSSPageSize: true });
console.log('✓ PDF:', path.resolve(output));

const sections = await page.$$('.page');
for (let i = 0; i < sections.length; i++) {
  await sections[i].screenshot({ path: path.join(outDir, `qa-page-${String(i + 1).padStart(2, '0')}.png`) });
}
console.log(`✓ QA 截圖 ${sections.length} 張（qa-page-NN.png，校稿完請刪）`);

await browser.close();
