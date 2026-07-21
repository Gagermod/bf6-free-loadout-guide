import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/tma27/.local/share/mimocode/mimocode.db', { open: true, readOnly: true });

// Get user text parts from key sessions via message join
const sessionIds = [
  'ses_0946286ebffeuRpTNKfUkbzfyT',
  'ses_099875829ffeO2dSB45lXev7hs',
  'ses_09a3dc99dffezheFVfyY87584I',
];

for (const sid of sessionIds) {
  console.log(`\n========== SESSION: ${sid} ==========`);
  
  // Get user message parts via message join
  const userParts = db.prepare(`
    SELECT p.time_created, json_extract(p.data, '$.text') as text
    FROM part p
    JOIN message m ON m.id = p.message_id
    WHERE p.session_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND json_extract(p.data, '$.type') = 'text'
      AND length(json_extract(p.data, '$.text')) > 3
    ORDER BY p.time_created
  `).all(sid);
  
  console.log(`User text parts: ${userParts.length}`);
  for (const p of userParts) {
    const text = (p.text || '').substring(0, 250).replace(/\n/g, ' ');
    console.log(`  [${new Date(p.time_created).toISOString()}] ${text}`);
  }
}

db.close();
