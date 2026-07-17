import fs from 'fs';

const WEAPONS = ['m2010-esr', 'mini-scout', 'psr', 'sv-98', 'db-12', 'm1014', 'm87a1', 'ggh-22', 'm357-trait', 'm44', 'm45a1', 'p18', 'vz-61', 'es57', '185ks-k'];
const MODES = ['battle-royale', 'ranked', 'big-maps', 'small-maps'];
const LOADOUTS_PATH = './data/all-mode-loadouts.json';

const loadouts = JSON.parse(fs.readFileSync(LOADOUTS_PATH, 'utf8'));

for (const weapon of WEAPONS) {
  // Try both slug formats (svk-8-6 and svk-86)
  let scrapedPath = `scripts/${weapon}-scraped.json`;
  if (!fs.existsSync(scrapedPath) && weapon === 'svk-8-6') {
    scrapedPath = `scripts/svk-86-scraped.json`;
  }
  if (!fs.existsSync(scrapedPath)) {
    console.log(`${weapon}: scraped file not found, skipping`);
    continue;
  }
  
  const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
  
  for (const mode of MODES) {
    if (!scraped[mode]) {
      console.log(`${weapon} ${mode}: not in scraped data, skipping`);
      continue;
    }
    
    if (!loadouts[weapon]) {
      console.log(`${weapon}: not in loadouts, skipping`);
      continue;
    }
    
    if (!loadouts[weapon][mode]) {
      console.log(`${weapon} ${mode}: not in loadouts, skipping`);
      continue;
    }
    
    const modeData = scraped[mode];
    let changes = 0;
    
    // Apply ALL ranks from scrape (correct weights from wzstats)
    for (let rank = 1; rank <= 40; rank++) {
      const rankStr = String(rank);
      const scrapedRank = modeData[rankStr];
      if (!scrapedRank || !scrapedRank.build) continue;
      
      const currentRank = loadouts[weapon][mode][rankStr];
      if (!currentRank) {
        console.log(`${weapon} ${mode} rank ${rank}: MISSING in current data, adding`);
        loadouts[weapon][mode][rankStr] = scrapedRank.build;
        changes++;
        continue;
      }
      
      // Replace entire build from scrape (correct weights from wzstats)
      loadouts[weapon][mode][rankStr] = scrapedRank.build;
      changes++;
    }
    
    console.log(`${weapon} ${mode}: ${changes} changes applied`);
  }
}

fs.writeFileSync(LOADOUTS_PATH, JSON.stringify(loadouts, null, 2));
console.log('\nDone! File saved.');
