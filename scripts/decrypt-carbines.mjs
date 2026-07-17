import fs from 'fs';

const LOADOUTS_PATH = './data/all-mode-loadouts.json';
const BF6_PATH = 'D:/frontend/BF6_All_Weapons_Attachments.txt';
const WEAPONS = ['ak-205','grt-bc','m277','m417-a2','m4a1','qbz-192','sg-553r','sor-300sc','cz3a1','kv9','pp-19','pw5a3','pw7a2','sgx','sl9','scw-10','umg-40','drs-iar','kts100-mk8','l110','m60','m121-a2','m123k','m240l','m250','rpk-74m','rpkm','grt-cps','lmr27','m39-emr','svdm','svk-8'];
const MODES = ['battle-royale', 'ranked', 'big-maps', 'small-maps'];

const encNames = ['Hidden Component', 'Mystery', 'Classified Part', 'V Restricted', 'Wrong Attachment',
  'MK Tactical', 'Specialized Part', 'Elite Attachment', 'Exclusive', 'Locked', 'Dummy',
  'Advanced Part', 'Professional Item'];

function isEncrypted(name) {
  return encNames.some(e => name.includes(e));
}

const SLOT_MAP = {
  'Barrel': 'BARRELS',
  'Underbarrel': 'UNDERBARRELS',
  'Muzzle': 'MUZZLES',
  'Magazine': 'MAGAZINES',
  'Ammunition': 'AMMUNITION',
  'Ergonomics': 'ERGONOMICS',
  'Scope': 'SCOPES',
  'Top Accessory': 'TOP ACCESSORIES',
  'Right Accessory': 'RIGHT ACCESSORIES',
  'Left Accessory': 'LEFT ACCESSORIES',
  'Optic Accessory': 'OPTIC ACCESSORIES'
};

function parseBF6File() {
  const content = fs.readFileSync(BF6_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  const weapons = {};
  
  const weaponPatterns = [
    { slug: 'ak-205', pattern: '3. AK-205' },
    { slug: 'grt-bc', pattern: '4. GRT-BC' },
    { slug: 'm277', pattern: '6. M277' },
    { slug: 'm417-a2', pattern: '5. M417 A2' },
    { slug: 'm4a1', pattern: '1. M4A1' },
    { slug: 'qbz-192', pattern: '6. QBZ-192' },
    { slug: 'sg-553r', pattern: '7. SG 553R' },
    { slug: 'sor-300sc', pattern: '8. SOR-300SC' },
    { slug: 'cz3a1', pattern: 'CZ3A1' },
    { slug: 'kv9', pattern: '5. KV9' },
    { slug: 'pp-19', pattern: 'PP-19' },
    { slug: 'pw5a3', pattern: '5. PW5A3' },
    { slug: 'pw7a2', pattern: '6. PW7A2' },
    { slug: 'sgx', pattern: '1. SGX' },
    { slug: 'sl9', pattern: '4. SL9' },
    { slug: 'scw-10', pattern: '7. SCW-10' },
    { slug: 'umg-40', pattern: '10. UMG-40' },
    { slug: 'drs-iar', pattern: '8. DRS-IAR' },
    { slug: 'kts100-mk8', pattern: '5. KTS100 MK8' },
    { slug: 'l110', pattern: '2. L110' },
    { slug: 'm-60', pattern: '6. M/60' },
    { slug: 'm121-a2', pattern: '10. M121 A2' },
    { slug: 'm123k', pattern: '4. M123K' },
    { slug: 'm240l', pattern: '3. M240L' },
    { slug: 'm250', pattern: '1. M250' },
    { slug: 'rpk-74m', pattern: '9. RPK-74M' },
    { slug: 'rpkm', pattern: '7. RPKM' },
    { slug: 'grt-cps', pattern: '5. GRT-CPS' },
    { slug: 'lmr27', pattern: '3. LMR27' },
    { slug: 'm39-emr', pattern: '1. M39 EMR' },
    { slug: 'svdm', pattern: '4. SVDM' },
    { slug: 'svk-8-6', pattern: '2. SVK-8' }
  ];
  
  for (const { slug, pattern } of weaponPatterns) {
    let startLine = -1;
    let endLine = lines.length;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        startLine = i;
      } else if (startLine > 0 && lines[i].includes('------------------------------------------------------------') && i > startLine + 1) {
        endLine = i;
        break;
      }
    }
    
    if (startLine === -1) { console.log(`${slug}: not found`); continue; }
    
    weapons[slug] = parseWeaponSection(lines, startLine, endLine);
  }
  
  return weapons;
}

function parseWeaponSection(lines, startLine, endLine) {
  const attachments = {};
  let currentSlot = null;
  
  for (let i = startLine; i < endLine; i++) {
    const trimmed = lines[i].trim();
    
    if (trimmed.match(/^[A-Z\s]+:$/)) {
      currentSlot = trimmed.replace(':', '').trim();
      if (!attachments[currentSlot]) attachments[currentSlot] = [];
      continue;
    }
    
    if (currentSlot && trimmed.startsWith('- ')) {
      const match = trimmed.match(/^- (.+?) \| (\d+) AP \| (.+)$/);
      if (match) {
        const [, name, costStr, unlockStr] = match;
        const cost = parseInt(costStr);
        let mastery = 0;
        let unlock = null;
        
        const masteryMatch = unlockStr.match(/Mastery (\d+)/);
        if (masteryMatch) {
          mastery = parseInt(masteryMatch[1]);
        } else if (unlockStr.includes('Season')) {
          unlock = unlockStr;
        }
        
        attachments[currentSlot].push({ name, cost, mastery, unlock });
      }
    }
  }
  
  return attachments;
}

function findAttachment(ref, bf6Slot, cost, mastery) {
  if (!ref[bf6Slot]) return null;
  
  let match = ref[bf6Slot].find(a => a.cost === cost && a.mastery === mastery);
  if (match) return match.name;
  
  match = ref[bf6Slot].find(a => a.cost === cost && a.mastery === 0 && !a.unlock);
  if (match) return match.name;
  
  match = ref[bf6Slot].find(a => a.cost === cost);
  if (match) return match.name;
  
  return null;
}

function decryptWeapon(weaponSlug, bf6Ref) {
  const loadouts = JSON.parse(fs.readFileSync(LOADOUTS_PATH, 'utf8'));
  const ref = bf6Ref[weaponSlug];
  
  if (!ref) {
    console.log(`${weaponSlug}: no BF6 reference data`);
    return 0;
  }
  
  let fixes = 0;
  
  for (const mode of MODES) {
    if (!loadouts[weaponSlug]?.[mode]) continue;
    
    for (let rank = 1; rank <= 40; rank++) {
      const rankStr = String(rank);
      const rankData = loadouts[weaponSlug][mode][rankStr];
      if (!rankData) continue;
      
      for (const [slot, att] of Object.entries(rankData)) {
        if (!isEncrypted(att.name)) continue;
        
        const bf6Slot = SLOT_MAP[slot] || slot.toUpperCase();
        const realName = findAttachment(ref, bf6Slot, att.cost, att.mastery);
        
        if (realName) {
          console.log(`${weaponSlug} ${mode} R${rank} ${slot}: ${att.name} -> ${realName}`);
          att.name = realName;
          fixes++;
        } else {
          console.log(`${weaponSlug} ${mode} R${rank} ${slot}: ${att.name} (${att.cost} AP, M${att.mastery}) - NO MATCH`);
        }
      }
    }
  }
  
  fs.writeFileSync(LOADOUTS_PATH, JSON.stringify(loadouts, null, 2));
  return fixes;
}

const bf6Ref = parseBF6File();
console.log('Parsed:', Object.keys(bf6Ref).join(', '));

let totalFixes = 0;
for (const weapon of WEAPONS) {
  const fixes = decryptWeapon(weapon, bf6Ref);
  totalFixes += fixes;
  console.log(`${weapon}: ${fixes} fixes\n`);
}

console.log(`Total: ${totalFixes} fixes`);
