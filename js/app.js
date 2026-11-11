// =====================================================================
// LÓGICA DE LA APP: estado del personaje, guardado y render.
// El estado vive en localStorage (este navegador). Haz respaldos JSON.
// =====================================================================

const STORAGE_KEY = 'wowf-guerrero-v1';
const TAB_KEY = 'wowf-guerrero-tab';
const TABS = ['tab-progreso', 'tab-diario', 'tab-keybinds', 'tab-rotacion', 'tab-talentos', 'tab-herreria', 'tab-ruta'];

function estadoInicial() {
  return {
    version: 1,
    personaje: { nombre: 'Mi Guerrero', reino: '', raza: 'Enano', nivel: 22, xp: 0, xpMax: 0, oro: 0 },
    profesiones: { mineria: { actual: 84, max: 150 }, herreria: { actual: 67, max: 150 } },
    equipo: {},      // { idObjeto: true }
    tareas: {},      // { idTarea: true }
    metas: GUIA.metasIniciales.map(m => ({ ...m, hecho: false })),
    diario: [],      // [{ id, fecha:'AAAA-MM-DD', nivel, xp, mineria, herreria, oro, notas, loot }]
    actualizado: null,
    ultimoRespaldo: null
  };
}

// ---------- Persistencia ----------
function fusionar(data) {
  const ini = estadoInicial();
  if (!data || typeof data !== 'object') return ini;
  return {
    ...ini,
    ...data,
    personaje: { ...ini.personaje, ...(data.personaje || {}) },
    profesiones: {
      mineria: { ...ini.profesiones.mineria, ...((data.profesiones || {}).mineria || {}) },
      herreria: { ...ini.profesiones.herreria, ...((data.profesiones || {}).herreria || {}) }
    },
    equipo: data.equipo || {},
    tareas: data.tareas || {},
    metas: Array.isArray(data.metas) ? data.metas : ini.metas,
    diario: Array.isArray(data.diario) ? data.diario : []
  };
}

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? fusionar(JSON.parse(raw)) : estadoInicial();
  } catch (e) {
    console.warn('No se pudo leer el guardado:', e);
    return estadoInicial();
  }
}

let S = cargar();

function guardar(msg) {
  S.actualizado = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
    if (msg) toast(msg);
  } catch (e) {
    toast('⚠️ No se pudo guardar en el navegador. Exporta un respaldo.', true);
  }
  renderTodo();
}

// ---------- Utilidades ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v, def = 0) => { const n = Number(v); return Number.isFinite(n) ? n : def; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pct = (a, b) => b > 0 ? clamp(Math.round(a / b * 100), 0, 100) : 0;
const hoy = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD local
const fmtFecha = iso => iso ? new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : 'nunca';
const fmtOro = g => `${num(g).toLocaleString('es', { maximumFractionDigits: 2 })} 🪙`;

function toast(msg, error) {
  const t = $('toast');
  t.textContent = msg;
  t.className = `fixed bottom-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-semibold transition ${error ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), 2500);
}

function barra(valor, max, color = 'bg-amber-500') {
  return `<div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
    <div class="${color} h-full rounded-full transition-all" style="width:${pct(valor, max)}%"></div></div>`;
}

// ---------- Pestañas ----------
function switchTab(tabId) {
  if (!TABS.includes(tabId)) tabId = 'tab-progreso';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  TABS.forEach(id => $(id) && $(id).classList.toggle('hidden', id !== tabId));
  try { localStorage.setItem(TAB_KEY, tabId); } catch (e) { /* sin almacenamiento */ }
}

// ---------- Cabecera ----------
function renderCabecera() {
  const p = S.personaje, pr = S.profesiones;
  $('hdr-titulo').textContent = `${(p.nombre || 'GUERRERO').toUpperCase()} — ${p.raza.toUpperCase()} NIVEL ${p.nivel}`;
  $('hdr-mineria').textContent = `${pr.mineria.actual} / ${pr.mineria.max}`;
  $('hdr-herreria').textContent = `${pr.herreria.actual} / ${pr.herreria.max}`;
  $('hdr-actualizado').textContent = `Actualizado: ${fmtFecha(S.actualizado)}`;
}

// ---------- Mi Progreso ----------
function estadoMeta(m) {
  if (m.tipo === 'nivel') return { hecho: S.personaje.nivel >= m.objetivo, actual: S.personaje.nivel, obj: m.objetivo };
  if (m.tipo === 'herreria') return { hecho: S.profesiones.herreria.actual >= m.objetivo, actual: S.profesiones.herreria.actual, obj: m.objetivo };
  if (m.tipo === 'mineria') return { hecho: S.profesiones.mineria.actual >= m.objetivo, actual: S.profesiones.mineria.actual, obj: m.objetivo };
  return { hecho: !!m.hecho };
}

function renderProgreso() {
  const p = S.personaje, pr = S.profesiones;
  const eqTot = GUIA.equipo.length, eqOk = GUIA.equipo.filter(e => S.equipo[e.id]).length;
  const tareas = GUIA.zonas.flatMap(z => z.tasks);
  const tOk = tareas.filter(([id]) => S.tareas[id]).length;

  // Tarjeta de personaje
  $('prog-personaje').innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <div class="text-xs text-slate-400 uppercase tracking-wider">${esc(p.raza)} · Guerrero${p.reino ? ' · ' + esc(p.reino) : ''}</div>
        <div class="text-2xl font-extrabold text-white">${esc(p.nombre)}</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-slate-400">Nivel</div>
        <div class="text-4xl font-extrabold text-amber-400 leading-none">${p.nivel}</div>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex justify-between text-xs text-slate-400 mb-1">
        <span>Experiencia</span>
        <span class="font-mono">${p.xpMax ? `${p.xp.toLocaleString('es')} / ${p.xpMax.toLocaleString('es')} (${pct(p.xp, p.xpMax)}%)` : 'sin datos de XP'}</span>
      </div>
      ${barra(p.xp, p.xpMax, 'bg-purple-500')}
    </div>
    <div class="grid grid-cols-3 gap-2 mt-4 text-center">
      <div class="bg-slate-900 rounded-lg p-2 border border-slate-700"><div class="text-[10px] text-slate-400">Oro</div><div class="text-sm font-bold text-yellow-300">${fmtOro(p.oro)}</div></div>
      <div class="bg-slate-900 rounded-lg p-2 border border-slate-700"><div class="text-[10px] text-slate-400">Equipo BiS</div><div class="text-sm font-bold text-white">${eqOk}/${eqTot}</div></div>
      <div class="bg-slate-900 rounded-lg p-2 border border-slate-700"><div class="text-[10px] text-slate-400">Ruta</div><div class="text-sm font-bold text-white">${tOk}/${tareas.length}</div></div>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="ajustar('nivel', 1)" class="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg">⬆️ ¡Subí de nivel!</button>
      <button onclick="ajustar('nivel', -1)" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-lg" title="Deshacer nivel">−1</button>
    </div>`;

  // Profesiones con botones rápidos
  $('prog-profesiones').innerHTML = [['mineria', '⛏️ Minería'], ['herreria', '🔨 Herrería']].map(([k, label]) => `
    <div class="bg-slate-900 rounded-lg p-3 border border-slate-700">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-sm font-bold text-amber-400">${label}</span>
        <span class="font-mono text-sm text-white">${pr[k].actual} / ${pr[k].max}</span>
      </div>
      ${barra(pr[k].actual, pr[k].max)}
      <div class="flex gap-1.5 mt-2">
        ${[1, 5].map(n => `<button onclick="ajustar('${k}', ${n})" class="flex-1 py-1 bg-slate-700 hover:bg-amber-600 text-xs font-bold rounded">+${n}</button>`).join('')}
        <button onclick="ajustar('${k}', -1)" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 rounded">−1</button>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">${esc(consejoProfesion(k))}</p>
    </div>`).join('');

  // Metas
  $('prog-metas').innerHTML = S.metas.map((m, i) => {
    const st = estadoMeta(m);
    const auto = m.tipo !== 'manual';
    return `<li class="flex items-center gap-3 p-2.5 rounded-lg border ${st.hecho ? 'bg-emerald-950/40 border-emerald-700/50' : 'bg-slate-900 border-slate-700'}">
      <input type="checkbox" ${st.hecho ? 'checked' : ''} ${auto ? 'disabled title="Se marca sola según tu progreso"' : `onchange="toggleMeta(${i})"`} class="w-4 h-4 accent-amber-500">
      <div class="flex-1 min-w-0">
        <div class="text-xs font-semibold ${st.hecho ? 'text-emerald-300 line-through' : 'text-slate-200'}">${esc(m.texto)}</div>
        ${auto ? `<div class="mt-1">${barra(st.actual, st.obj, st.hecho ? 'bg-emerald-500' : 'bg-amber-500')}</div>` : ''}
      </div>
      ${auto ? `<span class="text-[10px] font-mono text-slate-400">${st.actual}/${st.obj}</span>` : ''}
      ${m.id && m.id.startsWith('custom-') ? `<button onclick="borrarMeta(${i})" class="text-slate-500 hover:text-red-400 text-xs" title="Borrar">✕</button>` : ''}
    </li>`;
  }).join('');

  renderMateriales();
  renderFormEditar();
  renderRespaldo();
}

function consejoProfesion(k) {
  const v = S.profesiones[k].actual;
  if (k === 'mineria') {
    const t = GUIA.mineria.find(t => v >= t.desde && v < t.hasta);
    return t ? t.texto : (v >= 150 ? '¡Tope de Artesano! Busca entrenador Experto.' : 'Cobre en zonas iniciales.');
  }
  const t = GUIA.herreria.find(t => v >= t.desde && v < t.hasta);
  return t ? `Ahora: ${t.receta}` : (v >= 150 ? '¡Tope de Artesano! Busca entrenador Experto.' : '');
}

function renderMateriales() {
  const actual = S.profesiones.herreria.actual;
  const tramos = GUIA.herreria
    .filter(t => t.hasta > actual)
    .map(t => ({ ...t, crear: t.hasta - Math.max(t.desde, actual) }));
  const total = {};
  tramos.forEach(t => t.por.forEach(([mat, n]) => { total[mat] = (total[mat] || 0) + n * t.crear; }));

  $('prog-materiales').innerHTML = tramos.length === 0
    ? '<p class="text-sm text-emerald-300">✅ Herrería al tope de esta guía.</p>'
    : `<div class="overflow-x-auto custom-scrollbar"><table class="w-full text-xs">
        <thead><tr class="text-amber-400 text-left border-b border-slate-700"><th class="p-2">Tramo</th><th class="p-2">Receta</th><th class="p-2">Creaciones</th><th class="p-2">Materiales</th></tr></thead>
        <tbody class="divide-y divide-slate-800">${tramos.map((t, i) => `
          <tr class="${i === 0 ? 'bg-amber-950/30' : ''}">
            <td class="p-2 font-mono text-slate-300">${Math.max(t.desde, actual)}→${t.hasta}</td>
            <td class="p-2 text-white font-semibold">${esc(t.receta)}${i === 0 ? ' <span class="text-[10px] text-amber-400">← ahora</span>' : ''}</td>
            <td class="p-2 font-mono">~${t.crear}</td>
            <td class="p-2 text-slate-300">${t.por.map(([m, n]) => `${n * t.crear}× ${esc(m)}`).join(', ')}</td>
          </tr>`).join('')}
        </tbody></table></div>
        <div class="mt-3 p-3 bg-slate-900 border border-amber-600/40 rounded-lg text-xs">
          <div class="font-bold text-amber-400 mb-1">🛒 Total hasta 150 (aprox.):</div>
          <div class="text-slate-200">${Object.entries(total).map(([m, n]) => `<span class="inline-block mr-3"><b class="font-mono">${n}</b>× ${esc(m)}</span>`).join('')}</div>
          ${total['Barra de bronce'] ? `<div class="text-slate-400 mt-1">= ${total['Barra de bronce']} cobre + ${total['Barra de bronce']} estaño para fundir el bronce.</div>` : ''}
        </div>`;
}

function renderFormEditar() {
  const p = S.personaje, pr = S.profesiones;
  const f = $('form-editar');
  // Solo rellenar si el usuario no está escribiendo en el formulario
  if (f.contains(document.activeElement)) return;
  f.nombre.value = p.nombre; f.reino.value = p.reino; f.raza.value = p.raza;
  f.nivel.value = p.nivel; f.xp.value = p.xp; f.xpMax.value = p.xpMax; f.oro.value = p.oro;
  f.mineria.value = pr.mineria.actual; f.mineriaMax.value = pr.mineria.max;
  f.herreria.value = pr.herreria.actual; f.herreriaMax.value = pr.herreria.max;
}

function renderRespaldo() {
  const dias = S.ultimoRespaldo ? Math.floor((Date.now() - new Date(S.ultimoRespaldo)) / 864e5) : null;
  const aviso = dias === null ? '⚠️ Nunca has hecho un respaldo.' : dias >= 7 ? `⚠️ Último respaldo hace ${dias} días.` : `✅ Último respaldo: ${fmtFecha(S.ultimoRespaldo)}`;
  $('respaldo-estado').textContent = aviso;
  $('respaldo-estado').className = `text-xs ${dias === null || dias >= 7 ? 'text-amber-300' : 'text-emerald-300'}`;
}

// ---------- Acciones de progreso ----------
function ajustar(campo, delta) {
  if (campo === 'nivel') {
    S.personaje.nivel = clamp(S.personaje.nivel + delta, 1, 60);
    if (delta > 0) S.personaje.xp = 0;
    guardar(delta > 0 ? `🎉 ¡Nivel ${S.personaje.nivel}!` : `Nivel ${S.personaje.nivel}`);
  } else {
    const pr = S.profesiones[campo];
    pr.actual = clamp(pr.actual + delta, 0, 300);
    guardar(`${campo === 'mineria' ? '⛏️ Minería' : '🔨 Herrería'} ${pr.actual}`);
  }
}

function guardarEdicion(ev) {
  ev.preventDefault();
  const f = ev.target;
  S.personaje = {
    ...S.personaje,
    nombre: f.nombre.value.trim() || 'Mi Guerrero',
    reino: f.reino.value.trim(),
    raza: f.raza.value.trim() || 'Enano',
    nivel: clamp(Math.round(num(f.nivel.value, 1)), 1, 60),
    xp: Math.max(0, Math.round(num(f.xp.value))),
    xpMax: Math.max(0, Math.round(num(f.xpMax.value))),
    oro: Math.max(0, num(f.oro.value))
  };
  S.profesiones.mineria = { actual: clamp(Math.round(num(f.mineria.value)), 0, 300), max: clamp(Math.round(num(f.mineriaMax.value, 150)), 1, 300) };
  S.profesiones.herreria = { actual: clamp(Math.round(num(f.herreria.value)), 0, 300), max: clamp(Math.round(num(f.herreriaMax.value, 150)), 1, 300) };
  document.activeElement && document.activeElement.blur();
  guardar('💾 Progreso guardado');
}

function toggleMeta(i) { S.metas[i].hecho = !S.metas[i].hecho; guardar(); }
function borrarMeta(i) { S.metas.splice(i, 1); guardar('Meta borrada'); }
function agregarMeta(ev) {
  ev.preventDefault();
  const input = ev.target.texto;
  const texto = input.value.trim();
  if (!texto) return;
  S.metas.push({ id: 'custom-' + Date.now(), texto, tipo: 'manual', hecho: false });
  input.value = '';
  guardar('🎯 Meta añadida');
}

// ---------- Diario ----------
function prepararFormDiario() {
  const f = $('form-diario');
  if (f.contains(document.activeElement)) return;
  f.fecha.value = hoy();
  f.nivel.value = S.personaje.nivel;
  f.xp.value = S.personaje.xp;
  f.mineria.value = S.profesiones.mineria.actual;
  f.herreria.value = S.profesiones.herreria.actual;
  f.oro.value = S.personaje.oro;
}

function guardarSesion(ev) {
  ev.preventDefault();
  const f = ev.target;
  const e = {
    id: Date.now(),
    fecha: f.fecha.value || hoy(),
    nivel: clamp(Math.round(num(f.nivel.value, S.personaje.nivel)), 1, 60),
    xp: Math.max(0, Math.round(num(f.xp.value))),
    mineria: clamp(Math.round(num(f.mineria.value)), 0, 300),
    herreria: clamp(Math.round(num(f.herreria.value)), 0, 300),
    oro: Math.max(0, num(f.oro.value)),
    notas: f.notas.value.trim(),
    loot: f.loot.value.trim()
  };
  S.diario.push(e);
  S.diario.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);
  // Registrar una sesión también actualiza el estado actual
  S.personaje.nivel = e.nivel; S.personaje.xp = e.xp; S.personaje.oro = e.oro;
  S.profesiones.mineria.actual = e.mineria; S.profesiones.herreria.actual = e.herreria;
  f.notas.value = ''; f.loot.value = '';
  document.activeElement && document.activeElement.blur();
  guardar('📓 Sesión registrada');
}

function borrarSesion(id) {
  if (!confirm('¿Borrar esta entrada del diario?')) return;
  S.diario = S.diario.filter(e => e.id !== id);
  guardar('Entrada borrada');
}

let chartDiario = null;
function renderDiario() {
  prepararFormDiario();
  const lista = [...S.diario].reverse();
  $('diario-lista').innerHTML = lista.length === 0
    ? '<p class="text-sm text-slate-400">Aún no hay sesiones. Registra la primera al terminar de jugar.</p>'
    : lista.map((e, idx) => {
        const prev = lista[idx + 1];
        const dNivel = prev ? e.nivel - prev.nivel : 0;
        const dHerr = prev ? e.herreria - prev.herreria : 0;
        const dMin = prev ? e.mineria - prev.mineria : 0;
        const delta = (v, label) => v ? `<span class="text-emerald-400">${v > 0 ? '+' : ''}${v} ${label}</span>` : '';
        return `<div class="p-3 bg-slate-900 border border-slate-700 rounded-lg">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-mono font-bold text-amber-400">${esc(e.fecha)}</span>
            <span class="text-slate-300">Nv ${e.nivel} · ⛏️ ${e.mineria} · 🔨 ${e.herreria} · ${fmtOro(e.oro)}</span>
            <span class="space-x-2">${delta(dNivel, 'nv')} ${delta(dMin, 'min')} ${delta(dHerr, 'herr')}</span>
            <button onclick="borrarSesion(${e.id})" class="text-slate-500 hover:text-red-400" title="Borrar">✕</button>
          </div>
          ${e.notas ? `<p class="text-xs text-slate-300 mt-2 whitespace-pre-line">${esc(e.notas)}</p>` : ''}
          ${e.loot ? `<p class="text-xs text-purple-300 mt-1">🎁 ${esc(e.loot)}</p>` : ''}
        </div>`;
      }).join('');

  const ctx = $('chartDiario');
  if (chartDiario) { chartDiario.destroy(); chartDiario = null; }
  $('diario-chart-vacio').classList.toggle('hidden', S.diario.length >= 2);
  ctx.classList.toggle('hidden', S.diario.length < 2);
  if (S.diario.length < 2 || typeof Chart === 'undefined') return;
  chartDiario = new Chart(ctx, {
    type: 'line',
    data: {
      labels: S.diario.map(e => e.fecha),
      datasets: [
        { label: 'Nivel', data: S.diario.map(e => e.nivel), borderColor: '#f59e0b', backgroundColor: '#f59e0b', yAxisID: 'y', tension: .3 },
        { label: 'Herrería', data: S.diario.map(e => e.herreria), borderColor: '#94a3b8', backgroundColor: '#94a3b8', yAxisID: 'y1', tension: .3 },
        { label: 'Minería', data: S.diario.map(e => e.mineria), borderColor: '#a78bfa', backgroundColor: '#a78bfa', yAxisID: 'y1', tension: .3 }
      ]
    },
    options: {
      maintainAspectRatio: false, responsive: true, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: {
        x: { ticks: { color: '#cbd5e1' }, grid: { color: '#1e293b' } },
        y: { position: 'left', title: { display: true, text: 'Nivel', color: '#f59e0b' }, ticks: { color: '#cbd5e1' }, grid: { color: '#1e293b' } },
        y1: { position: 'right', title: { display: true, text: 'Profesión', color: '#94a3b8' }, ticks: { color: '#cbd5e1' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ---------- Guía: talentos, equipo, ruta, rotación ----------
const ui = { talentLevel: 22, activeZoneIndex: 0, rotationMode: 'solo' };

function updateTalentView(level) {
  ui.talentLevel = level;
  [22, 30].forEach(l => {
    $(`btn-lvl-${l}`).className = `px-3 py-1.5 font-bold text-xs rounded-lg transition ${l === level ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`;
  });
  renderTalentTree();
}

function renderTalentTree() {
  $('talent-tree-grid').innerHTML = GUIA.talentos[ui.talentLevel].map(item => `
    <div class="bg-slate-900 border border-slate-700 p-3.5 rounded-lg">
      <div class="flex items-center justify-between gap-2 text-xs font-bold mb-1">
        <span class="text-amber-400">${item.icon} ${esc(item.name)}</span>
        <span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">${item.rank}</span>
      </div>
      <p class="text-[11px] text-slate-300 mt-2 leading-relaxed">${esc(item.desc)}</p>
    </div>`).join('');
}

function toggleEquipo(id) { S.equipo[id] = !S.equipo[id]; if (!S.equipo[id]) delete S.equipo[id]; guardar(S.equipo[id] ? '🛡️ ¡Objeto conseguido!' : null); }

function renderGearTable() {
  const ok = GUIA.equipo.filter(e => S.equipo[e.id]).length;
  $('gear-progreso').innerHTML = `<div class="flex justify-between text-xs mb-1"><span class="text-slate-300">Equipo BiS conseguido</span><span class="font-mono text-amber-400">${ok}/${GUIA.equipo.length} (${pct(ok, GUIA.equipo.length)}%)</span></div>${barra(ok, GUIA.equipo.length, 'bg-emerald-500')}`;
  $('gear-table-body').innerHTML = GUIA.equipo.map(item => {
    const tiene = !!S.equipo[item.id];
    return `<tr class="hover:bg-slate-800/80 transition-colors ${tiene ? 'opacity-60' : ''}">
      <td class="p-3"><input type="checkbox" ${tiene ? 'checked' : ''} onchange="toggleEquipo('${item.id}')" class="w-4 h-4 accent-emerald-500" aria-label="Conseguido"></td>
      <td class="p-3 text-amber-400 font-bold">${esc(item.slot)}</td>
      <td class="p-3 font-semibold ${tiene ? 'text-emerald-300 line-through' : 'text-white'}">${esc(item.name)}</td>
      <td class="p-3 text-slate-400">${esc(item.type)}</td>
      <td class="p-3 text-amber-300">${esc(item.source)}</td>
      <td class="p-3 text-slate-300 font-mono">${esc(item.stats)}</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 whitespace-nowrap">${esc(item.priority)}</span></td>
    </tr>`;
  }).join('');
}

function toggleTarea(id) { S.tareas[id] = !S.tareas[id]; if (!S.tareas[id]) delete S.tareas[id]; guardar(); }
function verZona(idx) { ui.activeZoneIndex = idx; renderZoneTimeline(); }

function renderZoneTimeline() {
  $('zone-timeline-buttons').innerHTML = GUIA.zonas.map((z, idx) => {
    const hechas = z.tasks.filter(([id]) => S.tareas[id]).length;
    const activa = idx === ui.activeZoneIndex;
    return `<button onclick="verZona(${idx})" class="p-3 rounded-lg border text-left transition ${activa ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}">
      <div class="text-[10px] uppercase font-bold text-slate-400 flex justify-between"><span>Niveles ${z.range}</span><span>${hechas}/${z.tasks.length}</span></div>
      <div class="text-xs font-bold truncate mt-0.5">${esc(z.mainZone)}</div>
    </button>`;
  }).join('');
  const z = GUIA.zonas[ui.activeZoneIndex];
  $('zone-detail-card').innerHTML = `
    <h3 class="text-lg font-bold text-white mb-3">${esc(z.title)}</h3>
    <ul class="space-y-2 text-sm text-slate-300 mb-4">${z.tasks.map(([id, t]) => `
      <li><label class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-900">
        <input type="checkbox" ${S.tareas[id] ? 'checked' : ''} onchange="toggleTarea('${id}')" class="w-4 h-4 accent-amber-500">
        <span class="${S.tareas[id] ? 'line-through text-slate-500' : ''}">${esc(t)}</span>
      </label></li>`).join('')}</ul>
    <div class="p-2 bg-amber-950/40 border border-amber-600/40 rounded text-xs text-amber-200">⚠️ ${esc(z.warning)}</div>`;
}

// Abre la ruta en la fase que corresponde a tu nivel actual
function zonaSegunNivel() {
  const n = S.personaje.nivel;
  const idx = GUIA.zonas.findIndex(z => { const [a, b] = z.range.split('–').map(s => parseInt(s)); return n >= a && n < b; });
  return idx >= 0 ? idx : (n >= 30 ? GUIA.zonas.length - 1 : 0);
}

function switchRotationMode(mode) {
  ui.rotationMode = mode;
  $('btn-rot-solo').className = `px-4 py-2 font-bold text-xs rounded-lg transition ${mode === 'solo' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`;
  $('btn-rot-tank').className = `px-4 py-2 font-bold text-xs rounded-lg transition ${mode === 'tank' ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`;
  renderRotationDisplay();
}

function renderRotationDisplay() {
  const cur = GUIA.rotaciones[ui.rotationMode];
  $('rotation-display-container').innerHTML = `
    <h4 class="text-sm font-bold text-amber-400 mb-4">${esc(cur.title)}</h4>
    <div class="space-y-3 mb-4">${cur.steps.map(s => `
      <div class="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <span class="w-6 h-6 flex items-center justify-center bg-amber-500 text-slate-950 font-bold text-xs rounded-full flex-shrink-0 mt-0.5">${s.num}</span>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap justify-between gap-1 text-xs font-bold text-white"><span>${esc(s.skill)}</span><span class="text-[10px] font-mono text-amber-400">${esc(s.stance)}</span></div>
          <p class="text-xs text-slate-400 mt-1">${esc(s.desc)}</p>
        </div>
      </div>`).join('')}</div>
    <div class="p-3 bg-slate-900 border border-amber-600/40 rounded-lg text-xs text-amber-200">${esc(cur.taboo)}</div>`;
}

function initChartTalentos() {
  if (typeof Chart === 'undefined') return;
  new Chart($('chartSpecEfficiency'), {
    type: 'bar',
    data: {
      labels: ['Armas', 'Furia', 'Protección'],
      datasets: [
        { label: 'Solo DPS', data: [90, 75, 40], backgroundColor: '#d97706' },
        { label: 'Tanqueo', data: [85, 55, 90], backgroundColor: '#475569' }
      ]
    },
    options: {
      maintainAspectRatio: false, responsive: true,
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: { x: { ticks: { color: '#cbd5e1' } }, y: { ticks: { color: '#cbd5e1' }, max: 100 } }
    }
  });
}

// ---------- Respaldo: exportar / importar / reiniciar ----------
function exportar() {
  S.ultimoRespaldo = new Date().toISOString();
  guardar();
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `guerrero-respaldo-${hoy()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('📦 Respaldo descargado');
}

function importar(ev) {
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !data.personaje || !data.profesiones) throw new Error('Formato no válido');
      if (!confirm(`¿Reemplazar tu progreso actual con el respaldo de "${data.personaje.nombre || '?'}" (nivel ${data.personaje.nivel})?`)) return;
      S = fusionar(data);
      guardar('✅ Respaldo importado');
    } catch (e) {
      toast('❌ Archivo no válido: ' + e.message, true);
    }
  };
  reader.readAsText(file);
}

function reiniciar() {
  if (!confirm('¿Borrar TODO tu progreso guardado en este navegador? Exporta un respaldo antes. No se puede deshacer.')) return;
  S = estadoInicial();
  guardar('Progreso reiniciado');
}

// ---------- Init ----------
function renderTodo() {
  renderCabecera();
  renderProgreso();
  renderDiario();
  renderGearTable();
  renderZoneTimeline();
}

window.addEventListener('DOMContentLoaded', () => {
  ui.activeZoneIndex = zonaSegunNivel();
  renderTodo();
  renderTalentTree();
  renderRotationDisplay();
  initChartTalentos();
  let tab = 'tab-progreso';
  try { tab = localStorage.getItem(TAB_KEY) || tab; } catch (e) { /* sin almacenamiento */ }
  switchTab(tab);
});
