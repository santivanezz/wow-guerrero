// =====================================================================
// SINCRONIZACIÓN con el juego:
//  1) GuerreroSync (addon propio): la página lee directamente el archivo
//     WTF\Account\<CUENTA>\SavedVariables\GuerreroSync.lua de tu disco.
//  2) SimulationCraft: pegas el texto de /simc.
// Todo se procesa en tu navegador; nada se sube a internet.
// =====================================================================

// ---------- Lector de tablas Lua (formato SavedVariables) ----------
function parseLua(src) {
  let i = 0;
  const n = src.length;
  const err = m => { throw new Error(`${m} (posición ${i})`); };
  function ws() {
    while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ',' || c === ';') { i++; continue; }
      if (c === '-' && src[i + 1] === '-') {
        if (src[i + 2] === '[' && src[i + 3] === '[') { const e = src.indexOf(']]', i); i = e < 0 ? n : e + 2; }
        else { while (i < n && src[i] !== '\n') i++; }
        continue;
      }
      break;
    }
  }
  function str() {
    const q = src[i++]; let out = '';
    while (i < n && src[i] !== q) {
      let c = src[i++];
      if (c === '\\') {
        c = src[i++];
        if (c === 'n') out += '\n'; else if (c === 't') out += '\t'; else if (c === 'r') out += '\r';
        else if (c >= '0' && c <= '9') { let d = c; while (d.length < 3 && /[0-9]/.test(src[i])) d += src[i++]; out += String.fromCharCode(+d); }
        else out += c;
      } else out += c;
    }
    i++;
    return out;
  }
  function value() {
    ws();
    const c = src[i];
    if (c === '{') return table();
    if (c === '"' || c === "'") return str();
    if (c === '[' && (src[i + 1] === '[' || src[i + 1] === '=')) { const e = src.indexOf(']]', i); const s = src.slice(i + 2, e); i = e + 2; return s; }
    const m = /^(-?(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+)|true|false|nil)/.exec(src.slice(i, i + 40));
    if (!m) err('Valor inesperado');
    i += m[0].length;
    if (m[0] === 'true') return true; if (m[0] === 'false') return false; if (m[0] === 'nil') return null;
    return Number(m[0]);
  }
  function table() {
    i++; const obj = {}; let arr = 1; let esArray = true;
    for (;;) {
      ws();
      if (i >= n) err('Tabla sin cerrar');
      if (src[i] === '}') { i++; break; }
      let k;
      if (src[i] === '[') { i++; k = value(); ws(); if (src[i] !== ']') err('Falta ]'); i++; ws(); if (src[i] !== '=') err('Falta ='); i++; }
      else {
        const m = /^[A-Za-z_][A-Za-z0-9_]*\s*=/.exec(src.slice(i, i + 80));
        if (m) { k = m[0].replace(/\s*=$/, ''); i += m[0].length; }
        else k = arr++;
      }
      const v = value();
      if (typeof k !== 'number') esArray = false;
      obj[k] = v;
    }
    const claves = Object.keys(obj);
    if (esArray && claves.length && claves.every((k, idx) => +k === idx + 1)) return claves.map(k => obj[k]);
    return obj;
  }
  const res = {};
  while (i < n) {
    ws(); if (i >= n) break;
    const m = /^[A-Za-z_][A-Za-z0-9_]*\s*=/.exec(src.slice(i, i + 80));
    if (!m) err('Se esperaba una variable');
    i += m[0].length;
    res[m[0].replace(/\s*=$/, '')] = value();
  }
  return res;
}

// ---------- Lector de SimulationCraft ----------
const SLOTS_SIMC = { head: 'Cabeza', neck: 'Cuello', shoulder: 'Hombros', back: 'Espalda', chest: 'Pecho', shirt: 'Camisa', tabard: 'Tabardo', wrist: 'Muñecas', hands: 'Manos', waist: 'Cintura', legs: 'Piernas', feet: 'Pies', finger1: 'Anillo 1', finger2: 'Anillo 2', trinket1: 'Abalorio 1', trinket2: 'Abalorio 2', main_hand: 'Mano derecha', off_hand: 'Mano izquierda', ranged: 'A distancia', ammo: 'Munición' };

function parseSimc(txt) {
  const lines = txt.split(/\r?\n/);
  const out = { fuente: 'simc', equipo: [], bolsasExtra: [], bolsas: [], skills: {}, stats: {} };
  let enBolsas = false, comentario = '';
  const pj = /^(warrior|paladin|hunter|rogue|priest|shaman|mage|warlock|druid)="(.+)"$/;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l || l === '#') continue;
    if (l.startsWith('### Gear from Bags')) { enBolsas = true; continue; }
    if (l.startsWith('### Additional')) { enBolsas = false; continue; }
    let m;
    if ((m = /^#\s*(.+?)\s+-\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+-\s+(\w+)\/(.+)$/.exec(l))) { out.fecha = m[2]; out.region = m[3]; out.reino = m[4].trim(); continue; }
    if ((m = pj.exec(l))) { out.clase = m[1]; out.nombre = m[2]; continue; }
    if ((m = /^#\s*(character_stats|attack_power|crit|defense|skills|weapon_damage)=(.+)$/.exec(l))) { out.stats[m[1]] = m[2]; continue; }
    const linea = l.replace(/^#\s*/, '');
    if ((m = /^(\w+)=,id=(\d+)(.*)$/.exec(linea))) {
      const slot = m[1];
      const obj = { slot, slotNombre: SLOTS_SIMC[slot] || slot, id: +m[2], nombre: comentario };
      comentario = '';
      if (/^bag\d$/.test(slot)) out.bolsas.push(obj);
      else if (enBolsas && l.startsWith('#')) out.bolsasExtra.push(obj);
      else if (!l.startsWith('#')) out.equipo.push(obj);
      continue;
    }
    // Comentario con el nombre del objeto ("# Nombre (24)" o "# Proyectil explosivo")
    if (l.startsWith('#') && !l.includes('=') && !l.startsWith('# SimC') && !l.startsWith('# WoW') && !l.startsWith('# Requires') && !l.startsWith('# Checksum') && !l.startsWith('# Primary')) {
      comentario = l.replace(/^#\s*/, '').replace(/\s+\(\d+\)$/, '');
      continue;
    }
    if (l.startsWith('#')) continue;
    if ((m = /^(\w+)=(.*)$/.exec(l))) {
      const [, k, v] = m;
      if (k === 'level') out.nivel = +v;
      else if (k === 'race') out.raza = v;
      else if (k === 'server') out.servidor = v;
      else if (k === 'spec') out.spec = v;
      else if (k === 'talents') out.talentos = v;
      else if (k === 'professions') {
        out.profesiones = {};
        v.split('/').forEach(p => { const [nom, val] = p.split('='); if (nom) out.profesiones[nom] = +val; });
      }
    }
  }
  if (out.stats.skills) {
    out.stats.skills.split('/').forEach(s => { const [id, cur, , max] = s.split(':').map(Number); out.skills[id] = { actual: cur, max }; });
  }
  const cs = {};
  (out.stats.character_stats || '').split('/').forEach(p => { const [k, v] = p.split(':'); if (k) cs[k] = parseFloat(v); });
  const ap = (out.stats.attack_power || '').match(/melee:(\d+)/);
  const crit = (out.stats.crit || '').match(/melee:([\d.]+)/);
  const def = {}; (out.stats.defense || '').split('/').forEach(p => { const [k, v] = p.split(':'); if (k) def[k] = parseFloat(v); });
  out.atributos = { fuerza: cs.strength, agilidad: cs.agility, aguante: cs.stamina, intelecto: cs.intellect, espiritu: cs.spirit, vida: cs.health,
    pa: ap ? +ap[1] : null, critico: crit ? +crit[1] : null, armadura: def.armor, esquivar: def.dodge, parar: def.parry, bloquear: def.block, defensa: def.defense_skill };
  if (!out.nombre || !out.nivel) throw new Error('No parece una exportación de SimulationCraft (falta el personaje o el nivel).');
  return out;
}

// ---------- Archivo de GuerreroSync (File System Access + IndexedDB) ----------
const IDB = {
  abrir() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('guerrero-sync', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  },
  async get(k) { const db = await this.abrir(); return new Promise((res, rej) => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); }); },
  async set(k, v) { const db = await this.abrir(); return new Promise((res, rej) => { const t = db.transaction('kv', 'readwrite').objectStore('kv').put(v, k); t.onsuccess = () => res(); t.onerror = () => rej(t.error); }); },
  async del(k) { const db = await this.abrir(); return new Promise((res, rej) => { const t = db.transaction('kv', 'readwrite').objectStore('kv').delete(k); t.onsuccess = () => res(); t.onerror = () => rej(t.error); }); }
};

const Archivo = {
  soportado: () => 'showOpenFilePicker' in window,
  handle: null,
  async conectar() {
    const [h] = await window.showOpenFilePicker({
      id: 'guerrerosync',
      types: [{ description: 'SavedVariables de GuerreroSync', accept: { 'text/plain': ['.lua'] } }]
    });
    this.handle = h;
    try { await IDB.set('handle', h); } catch (e) { /* sin IndexedDB: solo esta sesión */ }
    return this.leer();
  },
  async recuperar() {
    if (this.handle) return this.handle;
    try { this.handle = await IDB.get('handle'); } catch (e) { this.handle = null; }
    return this.handle || null;
  },
  async permiso(pedir) {
    const h = await this.recuperar(); if (!h) return 'sin-archivo';
    const opts = { mode: 'read' };
    let p = await h.queryPermission(opts);
    if (p !== 'granted' && pedir) p = await h.requestPermission(opts);
    return p;
  },
  async leer() {
    const h = await this.recuperar(); if (!h) throw new Error('No hay archivo conectado.');
    const f = await h.getFile();
    return { texto: await f.text(), modificado: f.lastModified, nombre: f.name };
  },
  async olvidar() { this.handle = null; try { await IDB.del('handle'); } catch (e) { /* nada */ } }
};

// Convierte los datos del addon al formato interno (el personaje más reciente).
function datosDesdeAddon(lua) {
  const db = lua.GuerreroSyncDB;
  if (!db || !db.personajes) throw new Error('El archivo no contiene GuerreroSyncDB. ¿Es GuerreroSync.lua?');
  const lista = Object.values(db.personajes);
  if (!lista.length) throw new Error('El addon aún no guardó ningún personaje. Entra al juego y escribe /reload.');
  lista.sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0));
  return { fuente: 'addon', ...lista[0] };
}
