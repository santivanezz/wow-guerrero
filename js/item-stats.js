// =====================================================================
// Lee las estadísticas de un objeto desde el tooltip de Wowhead (inglés).
// Lo usan la página (objetos nuevos) y el generador de datos (Node).
// =====================================================================
const RANURAS_EN = ['Two-Hand', 'One-Hand', 'Main Hand', 'Off Hand', 'Held In Off-hand', 'Head', 'Neck', 'Shoulder', 'Back', 'Chest', 'Shirt', 'Tabard', 'Wrist', 'Hands', 'Waist', 'Legs', 'Feet', 'Finger', 'Trinket', 'Ranged', 'Thrown', 'Projectile', 'Relic'];
const SUBCLASES_EN = ['Axe', 'Mace', 'Sword', 'Polearm', 'Staff', 'Dagger', 'Fist Weapon', 'Shield', 'Plate', 'Mail', 'Leather', 'Cloth', 'Gun', 'Bow', 'Crossbow', 'Wand', 'Miscellaneous', 'Fishing Pole', 'Bullet', 'Arrow'];

function statsDesdeTooltip(html) {
  const txt = '|' + String(html || '').replace(/<br\s*\/?>/gi, '|').replace(/<[^>]+>/g, '|').replace(/&nbsp;/g, ' ').replace(/\s*\|\s*/g, '|').replace(/\|+/g, '|');
  const tokens = txt.split('|').map(t => t.trim()).filter(Boolean);
  const s = {};
  s.ranura = tokens.find(t => RANURAS_EN.includes(t)) || null;
  s.tipo = tokens.find(t => SUBCLASES_EN.includes(t)) || null;
  const n = re => { const m = re.exec(txt); return m ? Number(m[1]) : 0; };
  let m;
  if ((m = /(\d+)\s*-\s*(\d+)\s*Damage/.exec(txt))) { s.min = +m[1]; s.max = +m[2]; }
  s.vel = n(/Speed\|?\s*([\d.]+)/);
  s.armadura = n(/\|(\d+) Armor\|/);
  s.bloqueo = n(/\|(\d+) Block\|/);
  s.ilvl = n(/Item Level\|?\s*(\d+)/);
  s.nivel = n(/Requires Level\|?\s*(\d+)/);
  const re = /\+(\d+) (Strength|Agility|Stamina|Intellect|Spirit)/g;
  const mapa = { Strength: 'fue', Agility: 'agi', Stamina: 'agu', Intellect: 'int', Spirit: 'esp' };
  while ((m = re.exec(txt))) s[mapa[m[2]]] = (s[mapa[m[2]]] || 0) + Number(m[1]);
  s.def = n(/\+(\d+) Defense/i) || n(/defense (?:rating|skill) by (\d+)/i);
  s.pa = n(/\+(\d+) Attack Power/i);
  s.golpe = n(/chance to hit[^|]*?by (\d+)%/i);
  s.crit = n(/critical strike[^|]*?by (\d+)%/i);
  Object.keys(s).forEach(k => { if (s[k] === 0 || s[k] === null) delete s[k]; });
  return s;
}

if (typeof module !== 'undefined') module.exports = { statsDesdeTooltip };
