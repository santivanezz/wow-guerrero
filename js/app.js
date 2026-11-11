// =====================================================================
// APP: estado, sincronización y render de todas las pestañas.
// =====================================================================
const STORAGE_KEY = 'wowf-guerrero-v1';
const TAB_KEY = 'wowf-guerrero-tab';
const ICON_CACHE_KEY = 'wowf-iconos';
const TABS = ['panel', 'equipo', 'comparador', 'talentos', 'rotacion', 'macros', 'teclas', 'mazmorras', 'diario', 'sync', 'recursos'];
const SLOT_NUM = { 0: 'Munición', 1: 'Cabeza', 2: 'Cuello', 3: 'Hombros', 4: 'Camisa', 5: 'Pecho', 6: 'Cintura', 7: 'Piernas', 8: 'Pies', 9: 'Muñecas', 10: 'Manos', 11: 'Anillo 1', 12: 'Anillo 2', 13: 'Abalorio 1', 14: 'Abalorio 2', 15: 'Espalda', 16: 'Mano derecha', 17: 'Mano izquierda', 18: 'A distancia', 19: 'Tabardo' };
const ORDEN_SLOTS = ['Cabeza', 'Cuello', 'Hombros', 'Espalda', 'Pecho', 'Camisa', 'Tabardo', 'Muñecas', 'Manos', 'Cintura', 'Piernas', 'Pies', 'Anillo 1', 'Anillo 2', 'Abalorio 1', 'Abalorio 2', 'Mano derecha', 'Mano izquierda', 'A distancia', 'Munición'];

function estadoInicial() {
  return {
    version: 2,
    personaje: { nombre: 'Mi Guerrero', reino: '', raza: 'Enano', nivel: 22, xp: 0, xpMax: 0, descanso: 0, oro: 0, zona: '' },
    profesiones: { mineria: { actual: 84, max: 150 }, herreria: { actual: 67, max: 150 } },
    spec: 'prot',
    equipo: [], bolsas: [], banco: null, bolsasInfo: null,
    armas: {}, atributos: {}, talentos: null, hechizos: {},
    armasMacro: {},
    mazmorras: {},
    metas: METAS_INICIALES.map(m => ({ ...m, hecho: false })),
    diario: [], historial: [],
    sync: null, actualizado: null, ultimoRespaldo: null
  };
}

function fusionar(d) {
  const ini = estadoInicial();
  if (!d || typeof d !== 'object') return ini;
  return {
    ...ini, ...d, version: 2,
    personaje: { ...ini.personaje, ...(d.personaje || {}) },
    profesiones: { mineria: { ...ini.profesiones.mineria, ...(d.profesiones?.mineria || {}) }, herreria: { ...ini.profesiones.herreria, ...(d.profesiones?.herreria || {}) } },
    metas: Array.isArray(d.metas) && d.metas.length ? d.metas : ini.metas,
    diario: Array.isArray(d.diario) ? d.diario : [],
    historial: Array.isArray(d.historial) ? d.historial : [],
    equipo: Array.isArray(d.equipo) ? d.equipo : [],
    bolsas: Array.isArray(d.bolsas) ? d.bolsas : [],
    mazmorras: d.mazmorras || {}, armas: d.armas || {}, hechizos: d.hechizos || {}, armasMacro: d.armasMacro || {}
  };
}

function cargar() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? fusionar(JSON.parse(raw)) : estadoInicial(); }
  catch (e) { console.warn('No se pudo leer el guardado', e); return estadoInicial(); }
}
let S = cargar();

function guardar(msg, sinRender) {
  S.actualizado = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); if (msg) toast(msg); }
  catch (e) { toast('No se pudo guardar en el navegador. Exporta un respaldo.', true); }
  if (!sinRender) renderTodo();
}

// ---------- Utilidades ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pct = (a, b) => b > 0 ? clamp(Math.round(a / b * 100), 0, 100) : 0;
const hoy = () => new Date().toLocaleDateString('sv-SE');
const fmtFecha = iso => iso ? new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : 'nunca';
function fmtOro(g) {
  const cobre = Math.round(num(g) * 10000);
  const o = Math.floor(cobre / 10000), p = Math.floor(cobre % 10000 / 100), c = cobre % 100;
  return `<span class="gold">${o}<small>o</small></span> <span style="color:#c7d2de">${p}<small>p</small></span> <span style="color:#d08a4e">${c}<small>c</small></span>`;
}
const icono = (nombre, cls = '', titulo = '') => `<span class="icono ${cls}" title="${esc(titulo)}" style="background-image:url('https://wow.zamimg.com/images/wow/icons/large/${esc(nombre || 'inv_misc_questionmark')}.jpg')"></span>`;
const whItem = id => `https://www.wowhead.com/forever/es/item=${id}`;
const whSpell = id => `https://www.wowhead.com/forever/es/spell=${id}`;
function barra(v, max, cls = 'hielo', extra = '') { return `<div class="barra">${extra}<i class="${cls}" style="width:${pct(v, max)}%"></i></div>`; }
function toast(msg, error) {
  const t = $('toast'); t.textContent = msg; t.className = 'toast' + (error ? ' error' : '');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.className = 'hidden', 3200);
}
function refrescarTooltips() { try { window.$WowheadPower && window.$WowheadPower.refreshLinks(); } catch (e) { /* sin tooltips */ } }

// ---------- Datos de objetos (Wowhead) ----------
let ICONOS_EXTRA = {};
try { ICONOS_EXTRA = JSON.parse(localStorage.getItem(ICON_CACHE_KEY) || '{}'); } catch (e) { ICONOS_EXTRA = {}; }
function datosItem(id, nombreLocal) {
  const w = WHD.items[id] || ICONOS_EXTRA[id];
  return { id, n: nombreLocal || w?.n || `Objeto ${id}`, i: w?.i || 'inv_misc_questionmark', q: w?.q ?? 1 };
}
let pidiendo = false;
async function completarIconos(ids) {
  const faltan = [...new Set(ids)].filter(id => id && !(WHD.items[id]?.s) && !(ICONOS_EXTRA[id]?.s)).slice(0, 60);
  if (!faltan.length || pidiendo) return;
  pidiendo = true;
  let nuevos = 0;
  for (const id of faltan) {
    try {
      const base = WHD.items[id] || ICONOS_EXTRA[id];
      let n = base?.n, i = base?.i, q = base?.q;
      if (!base) {
        const r = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}?locale=6`);
        if (!r.ok) continue;
        const d = await r.json(); n = String(d.name || '').replace(/^\[|\]$/g, ''); i = d.icon; q = d.quality;
      }
      const r2 = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`);
      const s = r2.ok ? statsDesdeTooltip((await r2.json()).tooltip) : {};
      ICONOS_EXTRA[id] = { n, i, q, s }; nuevos++;
    } catch (e) { break; } // sin CORS o sin red: se queda el icono genérico
  }
  pidiendo = false;
  if (nuevos) { try { localStorage.setItem(ICON_CACHE_KEY, JSON.stringify(ICONOS_EXTRA)); } catch (e) { /* lleno */ } renderTodo(); }
}
function itemHTML(id, nombreLocal, extra = '') {
  const d = datosItem(id, nombreLocal);
  return `<a href="${whItem(id)}" target="_blank" rel="noopener" data-wh-rename-link="false" class="flex items-center gap-2 no-underline min-w-0">
    ${icono(d.i, 'sm q' + d.q)}<span class="q${d.q} text-sm font-semibold truncate">${esc(d.n)}</span>${extra}</a>`;
}

// Nombre de habilidad en TU cliente (addon) o es-MX por defecto
const hab = k => { const h = HAB[k]; if (!h) return k; return S.hechizos?.[h.id] || h.n; };
const habConfirmada = k => !!(S.hechizos?.[HAB[k]?.id] || HAB[k]?.ok);
function habHTML(k, cls = '') {
  const h = HAB[k];
  return `<a href="${whSpell(h.id)}" target="_blank" rel="noopener" data-wh-rename-link="false" class="no-underline">${icono(h.i, cls, hab(k))}</a>`;
}

// Todo lo que tienes (equipado + bolsas + banco)
function inventario() {
  const m = new Map();
  S.equipo.forEach(e => m.set(e.id, 'Equipado'));
  S.bolsas.forEach(b => { if (!m.has(b.id)) m.set(b.id, 'Bolsas'); });
  (S.banco?.items || []).forEach(b => { if (!m.has(b.id)) m.set(b.id, 'Banco'); });
  return m;
}

// ---------- Pestañas ----------
function switchTab(id) {
  if (!TABS.includes(id)) id = 'panel';
  document.querySelectorAll('.pestana').forEach(b => b.classList.toggle('activa', b.dataset.tab === id));
  TABS.forEach(t => $('tab-' + t)?.classList.toggle('hidden', t !== id));
  try { localStorage.setItem(TAB_KEY, id); } catch (e) { /* nada */ }
  if (id === 'diario') renderGrafico();
  window.scrollTo({ top: 0 });
}
function elegirSpec(spec) { S.spec = spec; guardar(); }

// ---------- Cabecera ----------
function renderCabecera() {
  const p = S.personaje, pr = S.profesiones;
  $('hdr-nombre').textContent = p.nombre;
  $('hdr-sub').textContent = `${p.raza} · Guerrero · Nivel ${p.nivel}${p.reino ? ' · ' + p.reino.replace(/_/g, ' ') : ''}`;
  $('hdr-pastillas').innerHTML = `
    <span class="pastilla">⛏️ Minería <b>${pr.mineria.actual}/${pr.mineria.max}</b></span>
    <span class="pastilla">🔨 Herrería <b>${pr.herreria.actual}/${pr.herreria.max}</b></span>
    <span class="pastilla">${fmtOro(p.oro)}</span>
    <span class="pastilla">${S.sync ? `⟳ ${esc(S.sync.fuente === 'addon' ? 'GuerreroSync' : 'SimC')} · ${fmtFecha(S.sync.fecha)}` : '⟳ Sin sincronizar'}</span>`;
  document.querySelectorAll('[data-spec-btn]').forEach(b => b.classList.toggle('activo', b.dataset.specBtn === S.spec));
}

// ---------- PANEL ----------
function estadoMeta(m) {
  const v = { nivel: S.personaje.nivel, herreria: S.profesiones.herreria.actual, mineria: S.profesiones.mineria.actual, oro: Math.floor(S.personaje.oro) }[m.tipo];
  if (v === undefined) return { hecho: !!m.hecho };
  return { hecho: v >= m.objetivo, actual: v, obj: m.objetivo };
}

function consejos() {
  const p = S.personaje, out = [];
  const lev = LEVELEO[S.spec];
  const pasoAhora = lev.orden.filter(o => o[0] <= p.nivel);
  const siguiente = lev.orden.find(o => o[0] === p.nivel + 1);
  if (siguiente) {
    const t = ARBOLES[siguiente[1]].talentos[siguiente[2]];
    out.push(['info', `Nivel ${p.nivel + 1}: toma <b>${esc(t[0])}</b> (${esc(t[3])}).`]);
  }
  const hito = HITOS.find(h => h[0] > p.nivel);
  if (hito) out.push(['info', `Próximo hito nivel ${hito[0]}: ${esc(hito[1])}`]);
  if (p.nivel < 40) {
    const falta = 100 - Math.floor(p.oro);
    out.push([falta > 0 ? 'warn' : 'ok', falta > 0 ? `Montura al 40: te faltan <b>${falta} oro</b> (vende minerales y barras que no uses).` : '¡Ya tienes el oro de la montura!']);
  }
  if (p.descanso > 0) out.push(['ok', `Tienes <b>${p.descanso.toLocaleString('es')}</b> de XP de descanso: aprovéchala.`]);
  if (S.bolsasInfo && S.bolsasInfo.libres <= 4) out.push(['bad', `Solo te quedan <b>${S.bolsasInfo.libres}</b> huecos en las bolsas.`]);
  const rotos = S.equipo.filter(e => e.durMax && e.dur / e.durMax < 0.25);
  if (rotos.length) out.push(['bad', `Repara: ${rotos.map(e => esc(datosItem(e.id, e.nombre).n)).join(', ')} por debajo del 25%.`]);
  // Habilidad con armas: Mazas 1M baja si vas a tanquear con maza
  Object.entries(S.armas).forEach(([nombre, s]) => {
    if (s.max && s.actual < s.max * 0.5 && s.actual > 0 && !/defensa|sin armas|fuego|arco|ballesta|arrojadiza/i.test(nombre))
      out.push(['warn', `<b>${esc(nombre)}</b> ${s.actual}/${s.max}: entrénala contra mobs fáciles antes de usar esa arma en mazmorra.`]);
  });
  const inv = inventario();
  const mejoras = [...(MEJORAS[S.spec === 'prot' ? 'Arma 1M (tanque)' : 'Arma 2M'] || [])].filter(([id, , f]) => f !== 'H' && !inv.has(id));
  const maz = MAZMORRAS.filter(m => m.f !== 'H' && p.nivel >= m.r[0] - 1 && p.nivel <= m.r[1] && !S.mazmorras[m.n]);
  if (maz.length) out.push(['info', `Mazmorras para tu nivel: ${maz.map(m => `<b>${esc(m.n)}</b> (${m.r[0]}-${m.r[1]})`).join(', ')}.`]);
  if (mejoras.length && pasoAhora.length) {
    const top = mejoras.slice(0, 2).map(([id]) => esc(datosItem(id).n)).join(' o ');
    out.push(['info', `Mejora de arma a buscar: ${top}.`]);
  }
  return out;
}

function renderPanel() {
  const p = S.personaje, pr = S.profesiones;
  const xpPct = pct(p.xp, p.xpMax);
  const descPct = p.xpMax ? clamp((p.xp + p.descanso) / p.xpMax * 100, 0, 100) : 0;
  $('panel-heroe').innerHTML = `
    <div class="flex flex-wrap items-center gap-4">
      <div class="retrato" style="width:84px;height:84px;background-image:url('https://wow.zamimg.com/images/wow/icons/large/classicon_warrior.jpg')"></div>
      <div class="flex-1 min-w-[200px]">
        <div class="text-xs muted uppercase tracking-widest">${esc(p.raza)} · Guerrero${p.zona ? ' · ' + esc(p.zona) : ''}</div>
        <div class="nombre-pj" style="font-size:2rem">${esc(p.nombre)}</div>
        <div class="text-sm muted">${p.reino ? esc(p.reino.replace(/_/g, ' ')) : 'Reino sin sincronizar'}</div>
      </div>
      <div class="text-center">
        <div class="text-xs muted uppercase tracking-widest">Nivel</div>
        <div class="titulo" style="font-size:3.4rem;line-height:1;color:var(--ice);text-shadow:0 0 22px rgba(143,214,255,.6)">${p.nivel}</div>
      </div>
    </div>
    <div class="mt-5">
      <div class="flex justify-between text-xs mb-1"><span class="muted">Experiencia ${p.descanso ? '<span class="chip info ml-1">Descansado</span>' : ''}</span>
        <span class="font-mono ice">${p.xpMax ? `${p.xp.toLocaleString('es')} / ${p.xpMax.toLocaleString('es')} (${xpPct}%)` : 'Conecta GuerreroSync para ver la XP'}</span></div>
      ${barra(p.xp, p.xpMax, 'xp', p.descanso ? `<span class="descanso" style="left:0;width:${descPct}%"></span>` : '')}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
      <div class="panel" style="padding:.7rem"><div class="lbl">Oro</div><div class="text-lg font-bold">${fmtOro(p.oro)}</div></div>
      <div class="panel" style="padding:.7rem"><div class="lbl">Especialización</div><div class="text-lg font-bold ice titulo">${ARBOLES[S.spec].nombre}</div></div>
      <div class="panel" style="padding:.7rem"><div class="lbl">Bolsas</div><div class="text-lg font-bold ice">${S.bolsasInfo ? `${S.bolsasInfo.libres} libres / ${S.bolsasInfo.total}` : `${S.bolsas.length} objetos`}</div></div>
      <div class="panel" style="padding:.7rem"><div class="lbl">Tiempo jugado</div><div class="text-lg font-bold ice">${S.jugado ? Math.floor(S.jugado / 3600) + ' h' : '—'}</div></div>
    </div>`;

  $('panel-consejos').innerHTML = consejos().map(([t, h]) => `<li class="flex gap-2 items-start text-sm"><span class="chip ${t}">${{ info: 'TIP', ok: 'OK', warn: 'OJO', bad: '¡!' }[t]}</span><span>${h}</span></li>`).join('') || '<li class="muted text-sm">Todo en orden.</li>';

  $('panel-profesiones').innerHTML = [['mineria', '⛏️ Minería'], ['herreria', '🔨 Herrería']].map(([k, l]) => `
    <div class="mb-3">
      <div class="flex justify-between text-sm mb-1"><span class="ice font-semibold">${l}</span><span class="font-mono">${pr[k].actual}/${pr[k].max}</span></div>
      ${barra(pr[k].actual, pr[k].max, 'oro')}
      <div class="text-xs muted mt-1">${esc(consejoProf(k))}</div>
    </div>`).join('');

  const armas = Object.entries(S.armas);
  $('panel-armas').innerHTML = armas.length ? armas.map(([n, s]) => `
    <div class="flex items-center gap-2 text-xs mb-1.5"><span class="w-28 truncate">${esc(n)}</span><div class="flex-1">${barra(s.actual, s.max, s.actual >= s.max ? 'verde' : s.actual < s.max * 0.5 ? 'rojo' : 'hielo')}</div><span class="font-mono w-14 text-right">${s.actual}/${s.max}</span></div>`).join('')
    : '<p class="text-xs muted">Sincroniza (SimC o GuerreroSync) para ver tus habilidades con armas y defensa.</p>';

  const a = S.atributos || {};
  const st = [['Fuerza', a.fuerza], ['Agilidad', a.agilidad], ['Aguante', a.aguante], ['Vida', a.vida], ['Poder de ataque', a.pa], ['Crítico', a.critico != null ? a.critico.toFixed(2) + '%' : null], ['Armadura', a.armadura], ['Defensa', a.defensa], ['Esquivar', a.esquivar != null ? (+a.esquivar).toFixed(2) + '%' : null], ['Parar', a.parar != null ? (+a.parar).toFixed(2) + '%' : null], ['Bloquear', a.bloquear != null ? (+a.bloquear).toFixed(2) + '%' : null]];
  $('panel-stats').innerHTML = st.some(([, v]) => v != null) ? st.map(([k, v]) => `<div class="flex justify-between text-xs py-1 border-b" style="border-color:rgba(143,214,255,.07)"><span class="muted">${k}</span><span class="ice font-mono">${v ?? '—'}</span></div>`).join('') : '<p class="text-xs muted">Sin datos todavía.</p>';

  $('panel-metas').innerHTML = S.metas.map((m, i) => {
    const s = estadoMeta(m), auto = m.tipo !== 'manual';
    return `<li class="flex items-center gap-3 py-1.5">
      <input type="checkbox" ${s.hecho ? 'checked' : ''} ${auto ? 'disabled' : `onchange="toggleMeta(${i})"`} class="w-4 h-4 accent-sky-400">
      <div class="flex-1 min-w-0"><div class="text-sm ${s.hecho ? 'line-through muted' : 'ice'}">${esc(m.texto)}</div>${auto ? `<div class="mt-1">${barra(s.actual, s.obj, s.hecho ? 'verde' : 'hielo')}</div>` : ''}</div>
      ${auto ? `<span class="text-xs font-mono muted">${s.actual}/${s.obj}</span>` : `<button onclick="borrarMeta(${i})" class="muted hover:text-red-400 text-xs">✕</button>`}
    </li>`;
  }).join('');
  renderMateriales();
}

function consejoProf(k) {
  const v = S.profesiones[k].actual;
  if (k === 'mineria') { const t = MINERIA.find(t => v >= t.desde && v < t.hasta); return t ? t.texto : v >= 150 ? 'Tope de Artesano: entrena Experto.' : 'Cobre en zonas iniciales.'; }
  const t = HERRERIA.find(t => v >= t.desde && v < t.hasta); return t ? `Ahora: ${t.receta}` : v >= 150 ? 'Tope de Artesano: entrena Experto.' : '';
}

function renderMateriales() {
  const actual = S.profesiones.herreria.actual;
  const tramos = HERRERIA.filter(t => t.hasta > actual).map(t => ({ ...t, crear: t.hasta - Math.max(t.desde, actual) }));
  const total = {}; tramos.forEach(t => t.por.forEach(([m, n]) => total[m] = (total[m] || 0) + n * t.crear));
  $('panel-materiales').innerHTML = !tramos.length ? '<p class="text-sm" style="color:var(--ok)">Herrería al tope de esta guía.</p>' : `
    <div class="scroll-x"><table class="tabla"><thead><tr><th>Tramo</th><th>Receta</th><th>Veces</th><th>Materiales</th></tr></thead><tbody>
    ${tramos.map((t, i) => `<tr><td class="font-mono">${Math.max(t.desde, actual)}→${t.hasta}</td><td class="ice">${esc(t.receta)} ${i === 0 ? '<span class="chip info">ahora</span>' : ''}</td><td class="font-mono">~${t.crear}</td><td class="muted">${t.por.map(([m, n]) => `${n * t.crear}× ${esc(m)}`).join(', ')}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="text-xs mt-2"><b class="gold">Total:</b> ${Object.entries(total).map(([m, n]) => `${n}× ${esc(m)}`).join(' · ')}${total['Barra de bronce'] ? ` <span class="muted">(= ${total['Barra de bronce']} cobre + ${total['Barra de bronce']} estaño)</span>` : ''}</p>`;
}

function toggleMeta(i) { S.metas[i].hecho = !S.metas[i].hecho; guardar(); }
function borrarMeta(i) { S.metas.splice(i, 1); guardar('Meta borrada'); }
function agregarMeta(ev) {
  ev.preventDefault(); const t = ev.target.texto.value.trim(); if (!t) return;
  S.metas.push({ id: 'custom-' + Date.now(), texto: t, tipo: 'manual', hecho: false }); ev.target.reset(); guardar('Meta añadida');
}

// ---------- EQUIPO ----------
function renderEquipo() {
  const eq = [...S.equipo].sort((a, b) => ORDEN_SLOTS.indexOf(a.slotNombre) - ORDEN_SLOTS.indexOf(b.slotNombre));
  $('equipo-actual').innerHTML = eq.length ? eq.map(e => {
    const dur = e.durMax ? pct(e.dur, e.durMax) : null;
    return `<div class="flex items-center gap-3 py-1.5" style="border-bottom:1px solid rgba(143,214,255,.06)">
      <span class="text-xs muted w-24 shrink-0">${esc(e.slotNombre)}</span>
      <div class="flex-1 min-w-0">${itemHTML(e.id, e.nombre)}</div>
      ${dur != null ? `<span class="chip ${dur < 25 ? 'bad' : dur < 60 ? 'warn' : 'ok'}">${dur}%</span>` : ''}
    </div>`;
  }).join('') : '<p class="text-sm muted">Sincroniza para ver tu equipo (pestaña ⟳ Sincronizar).</p>';

  const inv = inventario();
  const cats = Object.entries(MEJORAS).filter(([cat]) => S.spec === 'prot' ? cat !== 'Arma 2M' || true : cat !== 'Escudo');
  $('equipo-mejoras').innerHTML = cats.map(([cat, lista]) => `
    <div class="mb-5">
      <h4 class="titulo ice text-sm mb-2">${esc(cat)}</h4>
      <div class="scroll-x"><table class="tabla"><tbody>
      ${lista.filter(([, , f]) => f !== 'H').map(([id, fuente]) => {
        const donde = inv.get(id);
        return `<tr><td style="min-width:220px">${itemHTML(id)}</td><td class="text-xs muted">${esc(fuente)}</td>
          <td class="text-right">${donde ? `<span class="chip ok">✓ ${donde}</span>` : ''}</td></tr>`;
      }).join('')}
      </tbody></table></div>
    </div>`).join('');

  // Bolsas
  const bolsas = S.bolsas;
  $('equipo-bolsas').innerHTML = bolsas.length ? `<div class="ranuras">${bolsas.map(b => {
    const d = datosItem(b.id, b.nombre);
    return `<div class="ranura" style="background-image:url('https://wow.zamimg.com/images/wow/icons/large/${esc(d.i)}.jpg');outline:1px solid var(--q${d.q})" title="${esc(d.n)}">
      <a href="${whItem(b.id)}" target="_blank" rel="noopener" data-wh-rename-link="false" aria-label="${esc(d.n)}"></a>${b.n > 1 ? `<span class="n">${b.n}</span>` : ''}</div>`;
  }).join('')}</div>
    <p class="text-xs muted mt-2">${S.bolsasInfo ? `${S.bolsasInfo.libres} huecos libres de ${S.bolsasInfo.total}.` : 'SimC solo exporta el equipo guardado en bolsas; GuerreroSync exporta TODO (materiales, consumibles, cantidades).'}</p>`
    : '<p class="text-sm muted">Sin datos de bolsas.</p>';
  $('equipo-banco').innerHTML = S.banco?.items?.length ? `<div class="ranuras">${S.banco.items.map(b => { const d = datosItem(b.id, b.nombre); return `<div class="ranura" style="background-image:url('https://wow.zamimg.com/images/wow/icons/large/${esc(d.i)}.jpg')" title="${esc(d.n)}"><a href="${whItem(b.id)}" target="_blank" rel="noopener" data-wh-rename-link="false"></a>${b.n > 1 ? `<span class="n">${b.n}</span>` : ''}</div>`; }).join('')}</div><p class="text-xs muted mt-2">Visto el ${fmtFecha(new Date(S.banco.fecha * 1000).toISOString())}.</p>`
    : '<p class="text-sm muted">Abre el banco en el juego con GuerreroSync activo para verlo aquí.</p>';
  completarIconos([...S.equipo.map(e => e.id), ...S.bolsas.map(b => b.id), ...(S.banco?.items || []).map(b => b.id)]);
}

// ---------- TALENTOS ----------
function arbolHTML(clave, rangos, titulo) {
  const A = ARBOLES[clave];
  const r = (rangos || '').split('').map(Number);
  const pts = r.reduce((a, b) => a + (b || 0), 0);
  const filas = {};
  A.talentos.forEach((t, idx) => (filas[t[2]] = filas[t[2]] || []).push([t, r[idx] || 0]));
  return `<div class="arbol"><h4><span class="flex items-center gap-2">${icono(A.icono, 'sm')} ${titulo || A.nombre}</span><span class="frost font-mono">${pts}</span></h4>
    ${Object.keys(filas).sort((a, b) => a - b).map(f => `<div class="arbol-fila"><span class="nf">${f}</span>${filas[f].map(([t, v]) =>
      `<span class="talento ${v ? (v >= t[1] ? 'max' : 'on') : ''}" title="${esc(t[3])}">${esc(t[0])} <b>${v}/${t[1]}</b></span>`).join('')}</div>`).join('')}
  </div>`;
}
function renderTalentos() {
  const spec = S.spec;
  $('talentos-builds').innerHTML = BUILDS[spec].map(b => `
    <div class="panel mb-5">
      <div class="panel-titulo">${esc(b.titulo)} <span class="chip info">${b.split}</span><span class="sub">${esc(b.fuente)}</span></div>
      <p class="text-sm mb-3">${esc(b.nota)}</p>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">${arbolHTML('arms', b.arms)}${arbolHTML('fury', b.fury)}${arbolHTML('prot', b.prot)}</div>
      <a class="btn peq mt-3" href="${b.url}" target="_blank" rel="noopener">Abrir en la calculadora ↗</a>
    </div>`).join('');

  const lev = LEVELEO[spec], nv = S.personaje.nivel;
  // Talentos que deberías tener a tu nivel
  const tuyos = { arms: Array(17).fill(0), fury: Array(18).fill(0), prot: Array(18).fill(0) };
  lev.orden.filter(o => o[0] <= nv).forEach(([, a, i]) => tuyos[a][i]++);
  $('talentos-leveo').innerHTML = `
    <div class="panel-titulo">Leveo: ${esc(lev.titulo)} <span class="sub">Icy Veins · niveles 10-40</span></div>
    <p class="text-sm mb-3">${esc(lev.nota)}</p>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">${['arms', 'fury', 'prot'].map(a => arbolHTML(a, tuyos[a].join(''), `${ARBOLES[a].nombre} · tu nivel ${nv}`)).join('')}</div>
    <div class="scroll-x" style="max-height:360px;overflow-y:auto"><table class="tabla"><thead><tr><th>Nivel</th><th>Talento</th><th>Efecto</th></tr></thead><tbody>
    ${lev.orden.map(([l, a, i]) => { const t = ARBOLES[a].talentos[i]; return `<tr style="${l === nv + 1 ? 'background:rgba(79,179,255,.12)' : l <= nv ? 'opacity:.5' : ''}"><td class="font-mono">${l}${l === nv + 1 ? ' <span class="chip info">siguiente</span>' : ''}</td><td class="ice">${esc(t[0])}</td><td class="muted text-xs">${esc(t[3])}</td></tr>`; }).join('')}
    <tr><td class="font-mono">41-60</td><td colspan="2" class="muted text-xs">Sigue en la calculadora (enlace abajo).</td></tr>
    </tbody></table></div>
    <div class="flex flex-wrap gap-2 mt-3"><a class="btn peq" href="${lev.calc}" target="_blank" rel="noopener">Calculadora Icy Veins ↗</a><a class="btn peq" href="${lev.guia}" target="_blank" rel="noopener">Guía de leveo ↗</a></div>`;

  // Tus talentos reales (addon)
  const t = S.talentos;
  $('talentos-tuyos').innerHTML = Array.isArray(t) && t.length ? `<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">${t.map(a => `<div class="arbol"><h4><span>${esc(a.nombre)}</span><span class="frost font-mono">${a.puntos}</span></h4>${(a.lista || []).filter(x => x.rango > 0).map(x => `<span class="talento ${x.rango >= x.max ? 'max' : 'on'}">${esc(x.nombre)} <b>${x.rango}/${x.max}</b></span>`).join(' ') || '<span class="muted text-xs">Sin puntos</span>'}</div>`).join('')}</div>`
    : typeof t === 'string' && t ? `<p class="text-sm">Cadena de talentos de SimC: <code class="frost">${esc(t)}</code></p><p class="text-xs muted mt-1">SimC la exporta codificada. Con GuerreroSync verás aquí tus talentos punto por punto.</p>`
    : '<p class="text-sm muted">Sincroniza con GuerreroSync para comparar tus talentos reales.</p>';
}

// ---------- ROTACIÓN ----------
function renderRotacion() {
  const r = ROTACIONES[S.spec], nv = S.personaje.nivel;
  $('rotacion-lista').innerHTML = `<div class="panel-titulo">${esc(r.titulo)} <span class="sub">Icy Veins + Maxroll</span></div>` + r.pasos.map(([k, d], i) => {
    const h = HAB[k], bloq = h.lvl > nv;
    return `<div class="flex items-start gap-3 py-2.5" style="border-bottom:1px solid rgba(143,214,255,.07);${bloq ? 'opacity:.45' : ''}">
      <span class="titulo frost w-6 text-center">${i + 1}</span>${habHTML(k, 'lg')}
      <div class="flex-1"><div class="ice font-semibold">${esc(hab(k))} ${bloq ? `<span class="chip warn">nivel ${h.lvl}</span>` : ''}</div><div class="text-sm muted">${esc(d)}</div></div></div>`;
  }).join('');
}

// ---------- MACROS ----------
function candidatosArmas() {
  const lista = [];
  const esArma = /hammer|sword|axe|mace|shield|weapon|halberd|halbard|spear|staff|dagger|torch|blade|club/i;
  const add = (o, de) => {
    const ranuraArma = ['main_hand', 'off_hand'].includes(o.slot) || [16, 17].includes(o.slot);
    if (ranuraArma || (o.slot === 'bolsa' && esArma.test(datosItem(o.id).i))) lista.push({ ...o, de, slotNombre: o.slot === 17 || o.slot === 'off_hand' || /shield|torch/i.test(datosItem(o.id).i) ? 'Mano izquierda' : 'Mano derecha' });
  };
  S.equipo.forEach(o => add(o, 'equipado'));
  (S.bolsasExtra || []).forEach(o => add(o, 'bolsas'));
  return lista;
}
function armasMacro() {
  const c = candidatosArmas(), am = { ...S.armasMacro };
  const nom = o => datosItem(o.id, o.nombre).n;
  const unoM = new Set((MEJORAS['Arma 1M (tanque)'] || []).map(x => x[0]));
  if (!am.arma2M) { const e = c.find(o => o.de === 'equipado' && o.slotNombre === 'Mano derecha' && !unoM.has(o.id)); if (e) am.arma2M = nom(e); }
  if (!am.escudo) { const e = c.find(o => o.slotNombre === 'Mano izquierda' && /shield/i.test(datosItem(o.id).i)); if (e) am.escudo = nom(e); }
  if (!am.arma1M) { const e = c.find(o => unoM.has(o.id)); if (e) am.arma1M = nom(e); }
  return { am, opciones: [...new Set(c.map(nom))] };
}
function setArmaMacro(k, v) { S.armasMacro[k] = v; guardar(); }
function textoMacro(m) {
  const { am } = armasMacro();
  return m.txt.replace(/\{(\w+)\}/g, (_, k) => k === 'arma1M' ? (am.arma1M || '[tu arma 1M]') : k === 'arma2M' ? (am.arma2M || '[tu arma 2M]') : k === 'escudo' ? (am.escudo || '[tu escudo]') : hab(k));
}
function copiarMacro(id) {
  const m = MACROS.find(x => x.id === id);
  navigator.clipboard.writeText(textoMacro(m)).then(() => toast('Macro copiada: pégala en /macro')).catch(() => toast('No se pudo copiar', true));
}
function renderMacros() {
  const nv = S.personaje.nivel;
  const lista = MACROS.filter(m => m.spec.includes(S.spec));
  const { am, opciones } = armasMacro();
  const sel = (k, label) => `<label class="block"><span class="lbl">${label}</span><select class="inp" onchange="setArmaMacro('${k}', this.value)"><option value="">—</option>${opciones.map(o => `<option ${o === am[k] ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  const sinConfirmar = Object.keys(HAB).filter(k => !habConfirmada(k) && HAB[k].lvl <= nv + 10);
  $('macros-aviso').innerHTML = Object.keys(S.hechizos || {}).length
    ? `<span class="chip ok">✓ Nombres exactos de tu cliente (GuerreroSync)</span>`
    : `<span class="chip warn">Nombres en español latino de tu guía</span> <span class="text-xs muted">Por confirmar en tu cliente: ${sinConfirmar.map(k => esc(HAB[k].n)).join(', ')}. Con GuerreroSync se corrigen solos.</span>`;
  $('macros-lista').innerHTML = lista.map(m => {
    const bloq = m.lvl > nv;
    return `<div class="panel macro" style="${bloq ? 'opacity:.55' : ''}">
      <div class="flex items-start gap-3 mb-2"><span class="tecla">${m.tecla}</span>
        <div class="flex-1"><div class="ice font-semibold titulo">${esc(m.titulo)} ${bloq ? `<span class="chip warn">nivel ${m.lvl}</span>` : ''}</div><div class="text-xs muted">${esc(m.desc)}</div></div>
        <button class="btn peq" onclick="copiarMacro('${m.id}')">Copiar</button></div>
      ${m.personal ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">${sel('arma1M', 'Arma 1M (tanque)')}${sel('escudo', 'Escudo')}${sel('arma2M', 'Arma 2M (DPS)')}</div>` : ''}
      <pre>${esc(textoMacro(m))}</pre></div>`;
  }).join('');
}

// ---------- TECLAS ----------
function renderTeclas() {
  const nv = S.personaje.nivel;
  const teclas = ['M4', 'M5', '1', '2', '3', '4', 'Q', 'E', 'R', 'Z', 'X', 'C'];
  const grupos = [['🖱️ Ratón', ['M4', 'M5']], ['🔢 Números', ['1', '2', '3', '4']], ['🖐️ Q · E · R', ['Q', 'E', 'R']], ['🔻 Z · X · C', ['Z', 'X', 'C']]];
  const asign = {};
  teclas.forEach(t => asign[t] = MACROS.filter(m => m.tecla === t && m.spec.includes(S.spec)).sort((a, b) => (a.lvl <= nv) - (b.lvl <= nv) || b.lvl - a.lvl).reverse());
  $('teclas-grid').innerHTML = grupos.map(([g, ts]) => `<div class="panel"><div class="panel-titulo">${g}</div>${ts.map(t => {
    const ms = asign[t].filter(m => m.lvl <= nv), fut = asign[t].filter(m => m.lvl > nv);
    return `<div class="flex gap-3 items-start mb-3"><span class="tecla">${t}</span><div class="text-sm">${ms.length ? ms.map(m => `<div class="ice">${esc(m.titulo)}</div>`).join('') : '<div class="muted">Libre</div>'}${fut.map(m => `<div class="text-xs muted">nv ${m.lvl}: ${esc(m.titulo)}</div>`).join('')}</div></div>`;
  }).join('')}</div>`).join('');
}

// ---------- MAZMORRAS ----------
function colorNivel(r) { const nv = S.personaje.nivel; if (nv > r[1]) return 'q0'; if (nv >= r[0] + 2) return 'q2'; if (nv >= r[0] - 2) return 'gold'; return 'chip bad'; }
function toggleMazmorra(n) { S.mazmorras[n] = !S.mazmorras[n]; if (!S.mazmorras[n]) delete S.mazmorras[n]; guardar(); }
function renderMazmorras() {
  const inv = inventario();
  $('mazmorras-lista').innerHTML = `<div class="scroll-x"><table class="tabla"><thead><tr><th>✔</th><th>Mazmorra</th><th>Niveles</th><th>Botín para guerrero</th></tr></thead><tbody>
  ${MAZMORRAS.filter(m => m.f !== 'H').map(m => `<tr style="${S.mazmorras[m.n] ? 'opacity:.55' : ''}">
    <td><input type="checkbox" class="w-4 h-4 accent-sky-400" ${S.mazmorras[m.n] ? 'checked' : ''} onchange="toggleMazmorra('${esc(m.n).replace(/'/g, "\\'")}')"></td>
    <td class="ice font-semibold">${esc(m.n)} ${m.nuevo ? '<span class="chip info">Forever</span>' : ''}</td>
    <td class="font-mono ${colorNivel(m.r)}">${m.r[0]}-${m.r[1]}${m.aprox ? '*' : ''}</td>
    <td><div class="flex flex-wrap gap-x-4 gap-y-1">${m.loot.map(id => itemHTML(id, null, inv.has(id) ? '<span class="chip ok">✓</span>' : '')).join('') || '<span class="muted text-xs">—</span>'}</div></td></tr>`).join('')}
  </tbody></table></div><p class="text-xs muted mt-2">Colores como en el juego según tu nivel. Rangos de Maxroll (*aproximado). Botín de Icy Veins.</p>`;
  $('mazmorras-hitos').innerHTML = HITOS.map(([l, t]) => `<li class="flex gap-3 py-1.5 text-sm ${l <= S.personaje.nivel ? 'muted' : ''}"><span class="tecla" style="min-width:2.4rem">${l}</span><span>${esc(t)}</span></li>`).join('');
}

// ---------- DIARIO / HISTORIAL ----------
function registrarHistorial() {
  const p = S.personaje, ult = S.historial[S.historial.length - 1];
  const punto = { t: Date.now(), nivel: p.nivel, xp: p.xp, oro: +(+p.oro).toFixed(4), herreria: S.profesiones.herreria.actual, mineria: S.profesiones.mineria.actual };
  if (ult && ult.nivel === punto.nivel && ult.xp === punto.xp && ult.oro === punto.oro && ult.herreria === punto.herreria && ult.mineria === punto.mineria) return;
  S.historial.push(punto);
  if (S.historial.length > 2000) S.historial.splice(0, S.historial.length - 2000);
}
function guardarNota(ev) {
  ev.preventDefault(); const f = ev.target;
  const nota = f.notas.value.trim(); if (!nota && !f.loot.value.trim()) return;
  S.diario.push({ id: Date.now(), fecha: f.fecha.value || hoy(), nivel: S.personaje.nivel, notas: nota, loot: f.loot.value.trim() });
  f.notas.value = ''; f.loot.value = ''; guardar('Nota guardada');
}
function borrarNota(id) { if (!confirm('¿Borrar esta nota?')) return; S.diario = S.diario.filter(e => e.id !== id); guardar(); }
function renderDiario() {
  if (!$('form-diario').contains(document.activeElement)) $('form-diario').fecha.value = hoy();
  $('diario-lista').innerHTML = [...S.diario].reverse().map(e => `<div class="py-2.5" style="border-bottom:1px solid rgba(143,214,255,.07)">
    <div class="flex justify-between text-xs"><span class="frost font-mono">${esc(e.fecha)} · nv ${e.nivel}</span><button onclick="borrarNota(${e.id})" class="muted hover:text-red-400">✕</button></div>
    ${e.notas ? `<p class="text-sm mt-1 whitespace-pre-line">${esc(e.notas)}</p>` : ''}${e.loot ? `<p class="text-sm mt-1" style="color:var(--q4)">🎁 ${esc(e.loot)}</p>` : ''}</div>`).join('') || '<p class="text-sm muted">Sin notas todavía.</p>';
  const h = S.historial;
  const ses = h.length > 1 ? h[h.length - 1] : null, pri = h[0];
  $('diario-resumen').innerHTML = ses ? `Desde el primer registro: <b class="ice">+${ses.nivel - pri.nivel}</b> niveles · <b class="gold">${(ses.oro - pri.oro >= 0 ? '+' : '') + (ses.oro - pri.oro).toFixed(2)} oro</b> · <b class="ice">+${ses.herreria - pri.herreria}</b> herrería · <b class="ice">+${ses.mineria - pri.mineria}</b> minería (${h.length} registros automáticos).` : 'Cada sincronización guarda un punto automáticamente.';
}
let grafico = null;
function renderGrafico() {
  const ctx = $('grafico'); if (!ctx || typeof Chart === 'undefined') return;
  if (grafico) { grafico.destroy(); grafico = null; }
  const h = S.historial;
  $('grafico-vacio').classList.toggle('hidden', h.length >= 2);
  if (h.length < 2) return;
  const etq = h.map(p => new Date(p.t).toLocaleDateString('es', { day: '2-digit', month: 'short' }));
  grafico = new Chart(ctx, { type: 'line', data: { labels: etq, datasets: [
    { label: 'Nivel', data: h.map(p => p.nivel + (p.xp && S.personaje.xpMax ? 0 : 0)), borderColor: '#8fd6ff', backgroundColor: '#8fd6ff', yAxisID: 'y', tension: .3 },
    { label: 'Oro', data: h.map(p => p.oro), borderColor: '#f4c95d', backgroundColor: '#f4c95d', yAxisID: 'y1', tension: .3 },
    { label: 'Herrería', data: h.map(p => p.herreria), borderColor: '#94a3b8', backgroundColor: '#94a3b8', yAxisID: 'y2', tension: .3 },
    { label: 'Minería', data: h.map(p => p.mineria), borderColor: '#c27bff', backgroundColor: '#c27bff', yAxisID: 'y2', tension: .3 }
  ]}, options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#d6e6f5' } } },
    scales: { x: { ticks: { color: '#8199b3' }, grid: { color: 'rgba(143,214,255,.06)' } },
      y: { position: 'left', ticks: { color: '#8fd6ff' }, grid: { color: 'rgba(143,214,255,.06)' } },
      y1: { position: 'right', ticks: { color: '#f4c95d' }, grid: { drawOnChartArea: false } },
      y2: { display: false } } } });
}

// ---------- SINCRONIZACIÓN ----------
function aplicarDatos(d) {
  const p = S.personaje;
  if (d.nombre) p.nombre = d.nombre;
  if (d.reino) p.reino = d.reino;
  if (d.nivel) p.nivel = d.nivel;
  if (d.raza) p.raza = { dwarf: 'Enano', Dwarf: 'Enano', human: 'Humano', nightelf: 'Elfo de la noche', gnome: 'Gnomo' }[d.raza] || d.raza;

  if (d.fuente === 'simc') {
    if (d.profesiones) {
      if (d.profesiones.blacksmithing != null) S.profesiones.herreria.actual = d.profesiones.blacksmithing;
      if (d.profesiones.mining != null) S.profesiones.mineria.actual = d.profesiones.mining;
    }
    if (d.skills[164]) S.profesiones.herreria.max = d.skills[164].max;
    if (d.skills[186]) S.profesiones.mineria.max = d.skills[186].max;
    S.armas = {};
    Object.entries(d.skills).forEach(([id, s]) => { if (SKILLS_ARMAS[id] && s.max) S.armas[SKILLS_ARMAS[id]] = s; });
    S.equipo = d.equipo.map(e => ({ id: e.id, nombre: e.nombre, slot: e.slot, slotNombre: e.slotNombre }));
    S.bolsasExtra = d.bolsasExtra;
    // SimC no exporta bolsas completas: si no hay datos del addon, mostramos el equipo guardado en bolsas
    if (S.sync?.fuente !== 'addon') { S.bolsas = d.bolsasExtra.map(b => ({ id: b.id, n: 1, nombre: b.nombre })); S.bolsasInfo = null; }
    S.atributos = d.atributos;
    if (d.talentos) S.talentos = S.talentos && Array.isArray(S.talentos) && S.sync?.fuente === 'addon' ? S.talentos : d.talentos;
    S.sync = { fuente: 'simc', fecha: new Date().toISOString() };
  } else {
    p.xp = d.xp ?? p.xp; p.xpMax = d.xpMax ?? p.xpMax; p.descanso = d.descanso || 0;
    if (d.dinero != null) p.oro = d.dinero / 10000;
    p.zona = d.zona || p.zona;
    const lineas = Array.isArray(d.habilidades) ? d.habilidades : Object.values(d.habilidades || {});
    S.armas = {};
    lineas.forEach(l => {
      if (/herrer/i.test(l.nombre)) S.profesiones.herreria = { actual: l.actual, max: l.max };
      else if (/miner/i.test(l.nombre)) S.profesiones.mineria = { actual: l.actual, max: l.max };
      else if (/arma|defensa|weapon|defense/i.test((l.grupo || '') + ' ' + l.nombre) && !/profes/i.test(l.grupo || '')) S.armas[l.nombre] = { actual: l.actual, max: l.max };
    });
    const eq = Array.isArray(d.equipo) ? d.equipo : Object.values(d.equipo || {});
    S.equipo = eq.filter(e => e && e.id).map(e => ({ id: e.id, nombre: e.nombre, slot: e.slot, slotNombre: SLOT_NUM[e.slot] || String(e.slot), dur: e.dur, durMax: e.durMax }));
    const bol = Array.isArray(d.bolsas) ? d.bolsas : Object.values(d.bolsas || {});
    S.bolsas = bol.filter(b => b && b.id).map(b => ({ id: b.id, n: b.n || 1, q: b.q, nombre: b.nombre, b: b.b }));
    S.bolsasInfo = { libres: d.bolsasLibres ?? 0, total: d.bolsasTotal ?? 0 };
    // Armas en bolsas para la macro Tanque ⇄ DPS
    S.bolsasExtra = S.bolsas.map(b => ({ ...b, slot: 'bolsa' }));
    if (d.banco) { const it = Array.isArray(d.banco.items) ? d.banco.items : Object.values(d.banco.items || {}); S.banco = { items: it.filter(Boolean), fecha: d.banco.fecha }; }
    if (d.talentos) S.talentos = (Array.isArray(d.talentos) ? d.talentos : Object.values(d.talentos)).map(a => ({ ...a, lista: Array.isArray(a.lista) ? a.lista : Object.values(a.lista || {}) }));
    if (d.hechizos) { const h = {}; Object.entries(d.hechizos).forEach(([k, v]) => h[+k] = v); S.hechizos = h; }
    if (d.stats) S.atributos = d.stats;
    if (d.jugadoTotal) S.jugado = d.jugadoTotal;
    S.sync = { fuente: 'addon', fecha: new Date((d.actualizado || Date.now() / 1000) * 1000).toISOString() };
  }
  // Especialización según talentos del addon
  if (Array.isArray(S.talentos) && S.talentos.length === 3) {
    const pts = S.talentos.map(a => a.puntos || 0); const max = Math.max(...pts);
    if (max > 0) S.spec = ['arms', 'fury', 'prot'][pts.indexOf(max)];
  }
  registrarHistorial();
}

function importarSimc() {
  const txt = $('simc-texto').value;
  try { const d = parseSimc(txt); aplicarDatos(d); $('simc-texto').value = ''; guardar(`✓ SimC importado: ${d.nombre} nivel ${d.nivel}`); }
  catch (e) { toast('❌ ' + e.message, true); }
}

let ultimoArchivo = 0;
async function sincronizarArchivo(pedirPermiso, silencioso) {
  try {
    const perm = await Archivo.permiso(pedirPermiso);
    if (perm === 'sin-archivo') { if (!silencioso) toast('Primero conecta el archivo GuerreroSync.lua', true); return renderSyncEstado(); }
    if (perm !== 'granted') { renderSyncEstado('permiso'); return; }
    const { texto, modificado } = await Archivo.leer();
    if (silencioso && modificado === ultimoArchivo) return;
    ultimoArchivo = modificado;
    const d = datosDesdeAddon(parseLua(texto));
    aplicarDatos(d);
    guardar(silencioso ? null : `✓ Sincronizado: ${d.nombre} nivel ${d.nivel}`);
    if (silencioso) toast(`⟳ Datos nuevos del juego: nivel ${d.nivel}`);
  } catch (e) {
    if (!silencioso) toast('❌ ' + e.message, true);
  }
  renderSyncEstado();
}
async function conectarArchivo() {
  if (!Archivo.soportado()) { toast('Tu navegador no permite conectar archivos: usa Chrome o Edge, o arrastra el archivo.', true); return; }
  try { await Archivo.conectar(); await sincronizarArchivo(true); }
  catch (e) { if (e.name !== 'AbortError') toast('❌ ' + e.message, true); }
}
async function olvidarArchivo() { await Archivo.olvidar(); renderSyncEstado(); toast('Archivo desconectado'); }
function leerArchivoSuelto(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const txt = String(r.result);
      if (/GuerreroSyncDB/.test(txt)) { aplicarDatos(datosDesdeAddon(parseLua(txt))); guardar('✓ Datos de GuerreroSync importados'); }
      else if (/^\s*warrior=|SimC Addon/m.test(txt)) { aplicarDatos(parseSimc(txt)); guardar('✓ SimC importado'); }
      else if (txt.trim().startsWith('{')) { const d = JSON.parse(txt); if (!d.personaje) throw new Error('JSON no válido'); if (!confirm('¿Reemplazar tu progreso con este respaldo?')) return; S = fusionar(d); guardar('✓ Respaldo importado'); }
      else throw new Error('Archivo no reconocido');
    } catch (e) { toast('❌ ' + e.message, true); }
  };
  r.readAsText(file);
}
async function renderSyncEstado(estado) {
  const el = $('sync-estado'); if (!el) return;
  const h = await Archivo.recuperar().catch(() => null);
  let perm = null; try { perm = h ? await h.queryPermission({ mode: 'read' }) : null; } catch (e) { perm = null; }
  el.innerHTML = !Archivo.soportado() ? '<span class="chip warn">Este navegador no conecta archivos: usa Chrome/Edge o arrastra el archivo.</span>'
    : !h ? '<span class="chip warn">Sin archivo conectado</span>'
    : perm === 'granted' ? `<span class="chip ok">✓ Conectado a ${esc(h.name)} · se revisa solo cada 20 s</span>`
    : `<span class="chip warn">Conectado a ${esc(h.name)} · pulsa Sincronizar para dar permiso</span>`;
  $('btn-sync-hdr')?.classList.toggle('primario', !!h);
}

// ---------- COMPARADOR (modelo simplificado, inspirado en SimC) ----------
const statsDe = id => WHD.items[id]?.s || ICONOS_EXTRA[id]?.s || null;
const RANURA_ES = { Head: 'Cabeza', Neck: 'Cuello', Shoulder: 'Hombros', Back: 'Espalda', Chest: 'Pecho', Wrist: 'Muñecas', Hands: 'Manos', Waist: 'Cintura', Legs: 'Piernas', Feet: 'Pies', Finger: 'Anillo', Trinket: 'Abalorio' };
const PESOS = {
  dps:  { fue: 1, agi: 0.6, agu: 0.2, armadura: 0.01, pa: 0.5, crit: 12, golpe: 12, def: 0, bloqueo: 0 },
  tank: { agu: 1, armadura: 0.07, def: 1.3, agi: 0.6, fue: 0.45, bloqueo: 0.3, golpe: 4, crit: 2, pa: 0.2 }
};
const agiPorCrit = nv => Math.max(4, 20 * nv / 60);
const mitigacion = (armadura, nv) => armadura / (armadura + 400 + 85 * nv) * 100;

function habilidadArma(s) {
  if (!s || !s.tipo) return null;
  const dosM = s.ranura === 'Two-Hand';
  const base = { Axe: 'Hacha', Mace: 'Maza', Sword: 'Espada', Polearm: 'asta', Staff: 'Bast', Dagger: 'Daga', 'Fist Weapon': 'puño' }[s.tipo];
  if (!base) return null;
  const nombre = Object.keys(S.armas).find(k => k.toLowerCase().includes(base.toLowerCase()) && (/2M|dos manos/i.test(k) === dosM || ['asta', 'Bast'].includes(base)));
  return nombre ? { nombre, ...S.armas[nombre] } : null;
}
function fallosExtra(s) {
  const h = habilidadArma(s);
  if (!h) {
    const conocido = ['Axe', 'Mace', 'Sword', 'Polearm', 'Staff', 'Dagger', 'Fist Weapon'].includes(s?.tipo);
    return { extra: 0, h: null, sinEntrenar: conocido && Object.keys(S.armas).length > 0 };
  }
  const deficit = S.personaje.nivel * 5 - h.actual;
  const extra = deficit <= 0 ? 0 : deficit <= 10 ? deficit * 0.1 : Math.min(60, 1 + (deficit - 10) * 0.4);
  return { extra, h };
}
function lineaBase() {
  const nv = S.personaje.nivel, a = S.atributos || {};
  const main = S.equipo.find(e => e.slotNombre === 'Mano derecha'), off = S.equipo.find(e => e.slotNombre === 'Mano izquierda');
  const sm = main ? statsDe(main.id) || {} : {}, so = off ? statsDe(off.id) || {} : {};
  const pa = a.pa ?? (60 + nv * 6), crit = a.critico ?? 5, armadura = a.armadura ?? nv * 35, k = agiPorCrit(nv);
  return {
    nv, main, off, sm, so, k, pa, crit, armadura,
    pa0: pa - 2 * ((sm.fue || 0) + (so.fue || 0)) - (sm.pa || 0) - (so.pa || 0),
    crit0: crit - ((sm.agi || 0) + (so.agi || 0)) / k - (sm.crit || 0) - (so.crit || 0),
    arm0: armadura - (sm.armadura || 0) - (so.armadura || 0)
  };
}
function evaluarArma(id, offId, b, modo) {
  const s = statsDe(id); if (!s || !s.min) return null;
  const so = offId ? statsDe(offId) || {} : {};
  const off2 = s.ranura === 'Two-Hand' ? {} : so;
  const pa = b.pa0 + 2 * ((s.fue || 0) + (off2.fue || 0)) + (s.pa || 0) + (off2.pa || 0);
  const crit = b.crit0 + ((s.agi || 0) + (off2.agi || 0)) / b.k + (s.crit || 0) + (off2.crit || 0);
  const media = (s.min + s.max) / 2;
  const blanco = media / s.vel + pa / 14;
  const golpe = media + pa / 14 * s.vel;
  const { extra, h, sinEntrenar } = fallosExtra(s);
  const acierto = 1 - extra / 100;
  const dps = modo === 'tank' ? blanco * (1 + crit / 100) * acierto : (blanco * (1 + crit / 100) + golpe * (1 + crit / 100) / 6) * acierto;
  return { id, s, pa, crit, blanco, golpe, dps, extra, h, sinEntrenar, armaDps: media / s.vel };
}
function puntuacion(s, modo) { const w = PESOS[modo]; return Object.keys(w).reduce((t, k) => t + (s?.[k] || 0) * w[k], 0); }

function candidatos() {
  const ids = new Set();
  S.equipo.forEach(e => ids.add(e.id));
  (S.bolsasExtra || []).forEach(e => ids.add(e.id));
  S.bolsas.forEach(e => ids.add(e.id));
  (S.banco?.items || []).forEach(e => ids.add(e.id));
  Object.values(MEJORAS).forEach(l => l.forEach(([id, , f]) => { if (f !== 'H') ids.add(id); }));
  (S.comparadorExtra || []).forEach(id => ids.add(id));
  return [...ids];
}
function agregarComparar(ev) {
  ev.preventDefault();
  const v = ev.target.item.value.trim(); const m = /(?:item=)?(\d{2,7})/.exec(v);
  if (!m) { toast('Pega un enlace de Wowhead o un ID de objeto', true); return; }
  S.comparadorExtra = [...new Set([...(S.comparadorExtra || []), +m[1]])];
  ev.target.reset(); guardar('Objeto añadido: cargando datos de Wowhead…');
  completarIconos([+m[1]]);
}
function quitarComparar(id) { S.comparadorExtra = (S.comparadorExtra || []).filter(x => x !== id); guardar(); }
const delta = (v, dec = 1, suf = '') => `<span style="color:${v > 0.05 ? 'var(--ok)' : v < -0.05 ? '#fca5a5' : 'var(--muted)'}">${v > 0 ? '+' : ''}${v.toFixed(dec)}${suf}</span>`;

function renderComparador() {
  const el = $('comparador-contenido'); if (!el) return;
  const b = lineaBase(), modo = S.spec === 'prot' ? 'tank' : 'dps', nv = b.nv;
  const ids = candidatos();
  completarIconos(ids);
  const inv = inventario();
  const etiqueta = id => { const d = inv.get(id); const extra = (S.comparadorExtra || []).includes(id); return (d ? `<span class="chip ok">${d}</span>` : '') + (extra ? ` <button class="muted text-xs" onclick="quitarComparar(${id})" title="Quitar">✕</button>` : ''); };
  const nivelChip = s => s?.nivel > nv ? ` <span class="chip warn">nv ${s.nivel}</span>` : '';

  // Armas
  const quiere2M = S.spec === 'arms';
  const armas = ids.map(id => ({ id, s: statsDe(id) })).filter(x => x.s?.min && (quiere2M ? x.s.ranura === 'Two-Hand' : ['One-Hand', 'Main Hand'].includes(x.s.ranura)));
  const offActual = b.off?.id;
  const actual = b.main ? evaluarArma(b.main.id, offActual, b, modo) : null;
  const filas = armas.map(x => evaluarArma(x.id, quiere2M ? null : offActual, b, modo)).filter(Boolean).sort((x, y) => y.dps - x.dps);
  const tablaArmas = `<div class="scroll-x"><table class="tabla"><thead><tr><th>Arma</th><th>Daño · Vel.</th><th>DPS arma</th><th>Golpe medio</th><th>DPS estimado</th><th>vs actual</th><th>Habilidad</th></tr></thead><tbody>
    ${filas.map(f => `<tr style="${actual && f.id === actual.id ? 'background:rgba(79,179,255,.10)' : ''}">
      <td style="min-width:210px">${itemHTML(f.id)} ${etiqueta(f.id)}${nivelChip(f.s)}</td>
      <td class="font-mono text-xs">${f.s.min}-${f.s.max} · ${f.s.vel.toFixed(2)}</td>
      <td class="font-mono">${f.armaDps.toFixed(1)}</td>
      <td class="font-mono">${f.golpe.toFixed(0)}</td>
      <td class="font-mono ice font-bold">${f.dps.toFixed(1)}</td>
      <td class="font-mono">${actual ? delta((f.dps / actual.dps - 1) * 100, 0, '%') : '—'}</td>
      <td class="text-xs">${f.h ? `<span class="${f.extra > 5 ? 'chip bad' : f.extra > 0 ? 'chip warn' : 'chip ok'}">${esc(f.h.nombre)} ${f.h.actual}/${nv * 5}${f.extra > 0 ? ` · −${f.extra.toFixed(0)}% acierto` : ''}</span>` : f.sinEntrenar ? `<span class="chip bad">${esc({ Dagger: 'Dagas', Polearm: 'Armas de asta', Staff: 'Bastones', 'Fist Weapon': 'Armas de puño', Sword: 'Espadas', Axe: 'Hachas', Mace: 'Mazas' }[f.s.tipo] || f.s.tipo)}: sin entrenar</span>` : '<span class="muted">—</span>'}</td>
    </tr>`).join('') || `<tr><td colspan="7" class="muted">Sin armas ${quiere2M ? 'de dos manos' : 'de una mano'} con datos todavía.</td></tr>`}
    </tbody></table></div>`;

  // Escudos (Protección)
  let tablaEscudos = '';
  if (modo === 'tank') {
    const so = b.so || {};
    const escudos = ids.map(id => ({ id, s: statsDe(id) })).filter(x => x.s?.tipo === 'Shield').map(x => {
      const arm = b.arm0 + (b.sm.armadura || 0) + (x.s.armadura || 0);
      return { ...x, arm, mit: mitigacion(arm, nv), vida: ((x.s.agu || 0) - (so.agu || 0)) * 10, p: puntuacion(x.s, 'tank') };
    }).sort((x, y) => y.p - x.p);
    const mitActual = mitigacion(b.armadura, nv);
    tablaEscudos = `<h3 class="titulo ice text-base mt-6 mb-2">Escudos</h3><div class="scroll-x"><table class="tabla"><thead><tr><th>Escudo</th><th>Armadura</th><th>Bloqueo</th><th>Stats</th><th>Mitigación física</th><th>vs actual</th></tr></thead><tbody>
      ${escudos.map(e => `<tr style="${e.id === b.off?.id ? 'background:rgba(79,179,255,.10)' : ''}"><td style="min-width:210px">${itemHTML(e.id)} ${etiqueta(e.id)}${nivelChip(e.s)}</td>
        <td class="font-mono">${e.s.armadura || 0}</td><td class="font-mono">${e.s.bloqueo || 0}</td>
        <td class="text-xs muted">${['fue', 'agi', 'agu', 'def'].filter(k => e.s[k]).map(k => `+${e.s[k]} ${{ fue: 'Fue', agi: 'Agi', agu: 'Agu', def: 'Def' }[k]}`).join(' ') || '—'}</td>
        <td class="font-mono">${e.mit.toFixed(1)}%</td><td class="font-mono">${delta(e.mit - mitActual, 1, ' pts')}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Sin escudos con datos.</td></tr>'}
      </tbody></table></div><p class="text-xs muted mt-1">Mitigación contra enemigos de tu nivel: armadura / (armadura + 400 + 85 × nivel). ${b.off ? '' : 'Ahora no llevas escudo: equipa uno para tanquear.'}</p>`;
  }

  // Piezas de armadura
  const equipadoPorRanura = {};
  S.equipo.forEach(e => { const s = statsDe(e.id); const r = s?.ranura && RANURA_ES[s.ranura]; if (r) (equipadoPorRanura[r] = equipadoPorRanura[r] || []).push({ id: e.id, s, p: puntuacion(s, modo) }); });
  const piezas = ids.map(id => ({ id, s: statsDe(id) })).filter(x => x.s && RANURA_ES[x.s.ranura] && !S.equipo.some(e => e.id === x.id)).map(x => {
    const r = RANURA_ES[x.s.ranura], eq = (equipadoPorRanura[r] || []).sort((a, c) => a.p - c.p)[0];
    const p = puntuacion(x.s, modo);
    return { ...x, r, eq, p, d: p - (eq?.p || 0) };
  }).filter(x => x.d > 0.5).sort((x, y) => y.d - x.d);
  const tablaPiezas = `<div class="scroll-x"><table class="tabla"><thead><tr><th>Mejora</th><th>Ranura</th><th>Stats</th><th>Reemplaza a</th><th>Mejora (puntos)</th></tr></thead><tbody>
    ${piezas.map(x => `<tr><td style="min-width:210px">${itemHTML(x.id)} ${etiqueta(x.id)}${nivelChip(x.s)}</td><td class="text-xs">${x.r}</td>
      <td class="text-xs muted">${[['armadura', 'Arm'], ['fue', 'Fue'], ['agi', 'Agi'], ['agu', 'Agu'], ['def', 'Def']].filter(([k]) => x.s[k]).map(([k, l]) => `${x.s[k]} ${l}`).join(' · ')}</td>
      <td class="text-xs">${x.eq ? esc(datosItem(x.eq.id).n) : '<span class="muted">(vacío)</span>'}</td><td class="font-mono">${delta(x.d, 1)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No hay piezas mejores entre las que conocemos.</td></tr>'}
    </tbody></table></div>`;

  el.innerHTML = `
    <div class="panel">
      <div class="panel-titulo">Tu línea base <span class="sub">${S.sync ? 'datos de ' + (S.sync.fuente === 'addon' ? 'GuerreroSync' : 'SimC') : 'valores estimados: sincroniza para afinar'}</span></div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
        <div><div class="lbl">Arma actual</div>${b.main ? itemHTML(b.main.id, b.main.nombre) : '<span class="muted">—</span>'}</div>
        <div><div class="lbl">Poder de ataque</div><b class="ice font-mono">${Math.round(b.pa)}</b></div>
        <div><div class="lbl">Crítico</div><b class="ice font-mono">${b.crit.toFixed(2)}%</b></div>
        <div><div class="lbl">Armadura</div><b class="ice font-mono">${b.armadura}</b> <span class="muted text-xs">(${mitigacion(b.armadura, nv).toFixed(1)}%)</span></div>
        <div><div class="lbl">Modo</div><b class="ice">${modo === 'tank' ? '🛡️ Tanque (1M + escudo)' : S.spec === 'arms' ? '⚔️ Armas (2M)' : '🩸 Furia (1M)'}</b></div>
      </div>
    </div>
    <div class="panel"><div class="panel-titulo">Armas <span class="sub">${modo === 'tank' ? 'el arma del tanque aporta amenaza blanca; lo clave es el escudo' : 'ordenadas por DPS estimado'}</span></div>${tablaArmas}${tablaEscudos}</div>
    <div class="panel"><div class="panel-titulo">Piezas que mejoran tu equipo <span class="sub">pesos de ${modo === 'tank' ? 'tanque: Aguante > Defensa > Armadura' : 'DPS: Fuerza > Agilidad'}</span></div>${tablaPiezas}</div>
    <div class="panel">
      <div class="panel-titulo">Comparar otro objeto</div>
      <form onsubmit="agregarComparar(event)" class="flex gap-2 flex-wrap"><input name="item" class="inp" style="max-width:420px" placeholder="Enlace de Wowhead (…/item=7230) o ID"><button class="btn primario">Añadir</button></form>
      <p class="text-xs muted mt-3"><b>Cómo calcula:</b> DPS blanco = daño medio / velocidad + PA / 14. Golpe medio = daño medio + PA / 14 × velocidad (Abrumar, Golpe mortal, Embate escalan con él: por eso las armas lentas rinden más en Armas). DPS estimado = blanco + un ataque de arma cada 6 s, con tu crítico. Fuerza = 2 PA. Agilidad ≈ 1% de crítico cada ${b.k.toFixed(1)} a tu nivel. Habilidad con armas baja = fallos extra. Es una aproximación: SimulationCraft todavía no modela WoW Forever.</p>
    </div>`;
}

// ---------- Respaldo ----------
function exportar() {
  S.ultimoRespaldo = new Date().toISOString(); guardar(null, true);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
  a.download = `guerrero-respaldo-${hoy()}.json`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Respaldo descargado'); renderTodo();
}
function reiniciar() { if (!confirm('¿Borrar TODO tu progreso de este navegador? No se puede deshacer.')) return; S = estadoInicial(); guardar('Progreso reiniciado'); }

// ---------- Recursos ----------
function renderRecursos() {
  $('recursos-lista').innerHTML = RECURSOS.map(g => `<div class="panel"><div class="panel-titulo">${esc(g.grupo)}</div>${g.items.map(([n, u, d]) =>
    `<a href="${u}" target="_blank" rel="noopener" class="block py-2 no-underline" style="border-bottom:1px solid rgba(143,214,255,.07)"><div class="ice font-semibold">${esc(n)} ↗</div><div class="text-xs muted">${esc(d)}</div></a>`).join('')}</div>`).join('');
}

// ---------- Init ----------
function renderTodo() {
  renderCabecera(); renderPanel(); renderEquipo(); renderComparador(); renderTalentos(); renderRotacion(); renderMacros(); renderTeclas(); renderMazmorras(); renderDiario();
  if (!$('tab-diario').classList.contains('hidden')) renderGrafico();
  refrescarTooltips();
}

function iniciarNieve() {
  const c = $('nieve'); if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d'); let w, h; const copos = [];
  const tam = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  tam(); addEventListener('resize', tam);
  for (let i = 0; i < 70; i++) copos.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, v: Math.random() * .5 + .2, d: Math.random() * 2 * Math.PI });
  (function frame() {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(223,244,255,.8)';
    copos.forEach(p => { p.y += p.v; p.d += .01; p.x += Math.sin(p.d) * .3; if (p.y > h) { p.y = -5; p.x = Math.random() * w; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
    requestAnimationFrame(frame);
  })();
}

window.addEventListener('DOMContentLoaded', () => {
  renderTodo(); renderRecursos(); renderSyncEstado(); iniciarNieve();
  let tab = 'panel'; try { tab = localStorage.getItem(TAB_KEY) || tab; } catch (e) { /* nada */ }
  switchTab(tab);
  // Arrastrar y soltar archivos (SimC .txt, GuerreroSync.lua o respaldo .json)
  const zona = $('zona-arrastre');
  ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.add('sobre'); }));
  ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.remove('sobre'); }));
  zona.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) leerArchivoSuelto(f); });
  // Sincronización automática: al abrir y cada 20 s mientras la página esté visible
  sincronizarArchivo(false, true);
  setInterval(() => { if (document.visibilityState === 'visible') sincronizarArchivo(false, true); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizarArchivo(false, true); });
});
