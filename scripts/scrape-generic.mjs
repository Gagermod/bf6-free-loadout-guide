import { chromium } from 'playwright';
import fs from 'fs';

const WEAPON = process.argv[2] || 'ak-205';
const URL = `https://wzstats.gg/battlefield-6/best-loadouts/${WEAPON}`;
const OUTPUT = `scripts/${WEAPON}-scraped.json`;

function isEncrypted(name) {
  return ['Hidden Component','Mystery','Classified Part','V Restricted','Wrong Attachment',
    'MK Tactical','Specialized Part','Elite Attachment','Exclusive','Locked','Dummy','Advanced Part','Professional Item'].some(e => name.includes(e));
}

async function scrapeSection(page, sectionIdx, modeName) {
  console.log(`\n=== ${modeName} (section ${sectionIdx}) ===`);
  await page.evaluate((idx) => {
    const sections = document.querySelectorAll('section.mode-section');
    for (const s of sections) { s.classList.remove('mode-active'); s.style.display = 'none'; }
    if (sections[idx]) { sections[idx].classList.add('mode-active'); sections[idx].style.display = ''; sections[idx].style.visibility = 'visible'; }
  }, sectionIdx);
  await page.waitForTimeout(1000);
  await page.evaluate((idx) => {
    const sections = document.querySelectorAll('section.mode-section');
    const slider = sections[idx]?.querySelector('input[type="range"]');
    if (slider) { slider.focus(); slider.style.display = ''; }
  }, sectionIdx);
  await page.keyboard.press('Home');
  await page.waitForTimeout(600);
  const results = {};
  for (let rank = 1; rank <= 40; rank++) {
    if (rank > 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300); }
    const result = await page.evaluate((idx) => {
      const sections = document.querySelectorAll('section.mode-section');
      const section = sections[idx];
      if (!section) return { items: [], totalText: '', sv: 0 };
      const attList = section.querySelector('.attachments-list');
      if (!attList) return { items: [], totalText: '', sv: 0 };
      const items = [];
      for (const row of attList.querySelectorAll('.attachment-row')) {
        const item = row.querySelector('.attachment-item');
        if (!item) continue;
        const name = item.querySelector('.attachment-name')?.textContent?.trim() || '';
        const slotText = item.querySelector('.slot-name')?.textContent?.trim() || '';
        const levelEl = item.querySelector('.unlock-weapon-content-label');
        const levelText = levelEl?.textContent?.trim() || '';
        const slotMatch = slotText.match(/^([A-Za-z\s-]+?)\s+([\d]+)\s*$/);
        const slot = slotMatch ? slotMatch[1].trim() : slotText;
        const cost = slotMatch ? parseInt(slotMatch[2]) : 0;
        const levelMatch = levelText.match(/Level\s+(\d+)/);
        const mastery = levelMatch ? parseInt(levelMatch[1]) : 0;
        let unlock = null;
        if (levelText && !levelText.startsWith('Level')) unlock = levelText;
        items.push({ slot, name, cost, mastery, unlock });
      }
      let totalText = '';
      const match = (section.innerText || '').match(/(\d+)\/100/);
      if (match) totalText = match[0];
      const slider = section.querySelector('input[type="range"]');
      return { items, totalText, sv: slider ? parseInt(slider.value) : 0 };
    }, sectionIdx);
    let total = 0;
    const build = {};
    for (const item of result.items) { total += item.cost; build[item.slot] = { name: item.name, cost: item.cost, mastery: item.mastery, unlock: item.unlock }; }
    results[rank] = { build, total, totalText: result.totalText, slots: result.items.length };
    const enc = result.items.filter(i => isEncrypted(i.name)).length;
    console.log(`Rank ${rank}: ${total}/100 (${result.items.length}) ${result.totalText} sv=${result.sv} enc=${enc}`);
  }
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section.mode-section');
    for (const s of sections) s.classList.remove('mode-active');
    if (sections[0]) { sections[0].classList.add('mode-active'); sections[0].style.display = ''; }
  });
  return results;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log(`Loading ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  const sectionCount = await page.evaluate(() => document.querySelectorAll('section.mode-section').length);
  console.log(`Found ${sectionCount} mode sections`);
  
  const MODE_KEYS = ['battle-royale', 'ranked', 'big-maps', 'small-maps'];
  const allResults = {};
  for (let sIdx = 0; sIdx < Math.min(sectionCount, 4); sIdx++) {
    allResults[MODE_KEYS[sIdx]] = await scrapeSection(page, sIdx, MODE_KEYS[sIdx]);
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(allResults, null, 2));
  console.log(`\nSaved to ${OUTPUT}`);
  await browser.close();
}

main().catch(console.error);
