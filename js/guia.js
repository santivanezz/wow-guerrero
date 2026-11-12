// =====================================================================
// CONTENIDO DE LA GUÍA — WoW Forever (patch 1.60.1)
// Fuentes: Icy Veins Forever (4 nov 2026), talentsforever.com y
// wowforevertalent.com (estadísticas de builds), Maxroll, Warcraft Tavern,
// ForeverChanges, Wowhead Forever. Edita aquí para cambiar la guía.
// =====================================================================

// ---------- Habilidades ----------
// n = nombre en tu cliente (español latino, es-MX). Si conectas GuerreroSync,
// los nombres se reemplazan por los EXACTOS de tu libro de hechizos.
// ok = nombre confirmado en tu cliente; sin ok = por confirmar.
const HAB = {
  charge:        { id: 100,   n: 'Cargar',                 i: 'ability_warrior_charge', ok: 1, lvl: 4 },
  rend:          { id: 772,   n: 'Desgarrar',              i: 'ability_gouge', ok: 1, lvl: 4 },
  heroic:        { id: 78,    n: 'Golpe heroico',          i: 'ability_rogue_ambush', ok: 1, lvl: 1 },
  battleShout:   { id: 6673,  n: 'Grito de batalla',       i: 'ability_warrior_battleshout', ok: 1, lvl: 1 },
  battleStance:  { id: 2457,  n: 'Actitud de batalla',     i: 'ability_warrior_offensivestance', ok: 1, lvl: 1 },
  defStance:     { id: 71,    n: 'Actitud defensiva',      i: 'ability_warrior_defensivestance', ok: 1, lvl: 10 },
  berserkerStance:{ id: 2458, n: 'Actitud rabiosa',        i: 'ability_racial_avatar', lvl: 30 },
  bloodrage:     { id: 2687,  n: 'Ira sangrienta',         i: 'ability_racial_bloodrage', ok: 1, lvl: 10 },
  sunder:        { id: 7386,  n: 'Hender armadura',        i: 'ability_warrior_sunder', ok: 1, lvl: 10 },
  taunt:         { id: 355,   n: 'Provocar',               i: 'spell_nature_reincarnation', ok: 1, lvl: 10 },
  overpower:     { id: 7384,  n: 'Abrumar',                i: 'ability_meleedamage', ok: 1, lvl: 12 },
  shieldBash:    { id: 72,    n: 'Azote de escudo',        i: 'ability_warrior_shieldbash', ok: 1, lvl: 12 },
  revenge:       { id: 6572,  n: 'Revancha',               i: 'ability_warrior_revenge', ok: 1, lvl: 14 },
  thunderClap:   { id: 6343,  n: 'Atronar',                i: 'spell_nature_thunderclap', ok: 1, lvl: 6 },
  hamstring:     { id: 1715,  n: 'Seccionar',              i: 'ability_shockwave', ok: 1, lvl: 8 },
  demoShout:     { id: 1160,  n: 'Grito desmoralizador',   i: 'ability_warrior_warcry', ok: 1, lvl: 14 },
  shieldBlock:   { id: 2565,  n: 'Bloqueo con escudo',     i: 'ability_defend', ok: 1, lvl: 16 },
  disarm:        { id: 676,   n: 'Desarmar',               i: 'ability_warrior_disarm', ok: 1, lvl: 18 },
  cleave:        { id: 845,   n: 'Rajar',                  i: 'ability_warrior_cleave', ok: 1, lvl: 20 },
  victory:       { id: 34428, n: 'Ataque de la victoria',  i: 'ability_warrior_devastate', ok: 1, lvl: 20 },
  retaliation:   { id: 20230, n: 'Represalias',            i: 'ability_warrior_challange', ok: 1, lvl: 20 },
  slam:          { id: 1464,  n: 'Embate',                 i: 'ability_warrior_decisivestrike', ok: 1, lvl: 20 },
  mockingBlow:   { id: 694,   n: 'Falsa arremetida',       i: 'ability_warrior_punishingblow', ok: 1, lvl: 16 },
  execute:       { id: 5308,  n: 'Ejecutar',               i: 'inv_sword_48', lvl: 24 },
  shieldWall:    { id: 871,   n: 'Muro de escudo',         i: 'ability_warrior_shieldwall', lvl: 28 },
  intercept:     { id: 20252, n: 'Interceptar',            i: 'ability_rogue_sprint', lvl: 30 },
  pummel:        { id: 6552,  n: 'Zurrar',                 i: 'inv_gauntlets_04', lvl: 30 },
  berserkerRage: { id: 18499, n: 'Ira rabiosa',            i: 'spell_nature_ancestralguardian', lvl: 30 },
  whirlwind:     { id: 1680,  n: 'Torbellino',             i: 'ability_whirlwind', lvl: 36 },
  intimidating:  { id: 5246,  n: 'Grito intimidador',      i: 'ability_golemthunderclap', lvl: 22 },
  challenging:   { id: 1161,  n: 'Grito desafiante',       i: 'ability_bullrush', lvl: 26 },
  recklessness:  { id: 1719,  n: 'Temeridad',              i: 'ability_criticalstrike', lvl: 50 },
  shoot:         { id: 7918,  n: 'Disparar arma de fuego', i: 'ability_marksmanship', ok: 1, lvl: 1 },
  stoneform:     { id: 20594, n: 'Forma de piedra',        i: 'spell_shadow_unholystrength', ok: 1, lvl: 1 },
  // Talentos activos
  sweeping:      { id: 12292, n: 'Golpes de barrido',      i: 'ability_rogue_slicedice', lvl: 30 },
  mortalStrike:  { id: 12294, n: 'Golpe mortal',           i: 'ability_warrior_savageblow', lvl: 40 },
  bloodthirst:   { id: 23881, n: 'Sed de sangre',          i: 'spell_nature_bloodlust', lvl: 40 },
  shieldSlam:    { id: 23922, n: 'Embate con escudo',      i: 'inv_shield_05', lvl: 40 },
  deathWish:     { id: 12328, n: 'Deseo de muerte',        i: 'spell_shadow_deathpact', lvl: 30 },
  lastStand:     { id: 12975, n: 'Última posición',        i: 'spell_holy_ashestoashes', lvl: 23 },
  concussion:    { id: 12809, n: 'Golpe conmocionador',    i: 'ability_thunderbolt', lvl: 33 },
  piercingHowl:  { id: 12323, n: 'Aullido penetrante',     i: 'spell_shadow_deathscream', lvl: 20 }
};

// ---------- Árboles de talentos de Forever (orden = orden de las calculadoras) ----------
// [nombre, rangos máximos, fila, descripción corta]
const ARBOLES = {
  arms: { nombre: 'Armas', icono: 'ability_warrior_savageblow', talentos: [
    ['Improved Heroic Strike', 3, 1, 'Golpe heroico cuesta menos ira'],
    ['Deflection', 5, 1, '+parada'],
    ['Improved Rend', 3, 1, '+daño de Desgarrar'],
    ['Improved Charge', 2, 2, '+ira al Cargar'],
    ['Improved Tactical Mastery', 3, 2, 'Conserva más ira al cambiar de actitud'],
    ['Improved Overpower', 2, 2, '+50% crítico de Abrumar'],
    ['Anger Management', 1, 3, 'Genera ira en combate'],
    ['Deep Wounds', 3, 3, 'Los críticos sangran'],
    ['Spearing Strike', 1, 4, 'Ataque extra vs Gigantes/Dragonantes/montados'],
    ['Two-Handed Weapon Specialization', 3, 4, '+6% daño con 2M'],
    ['Impale', 2, 4, '+daño crítico de habilidades'],
    ['Bloodthrill', 2, 5, 'Golpes a objetivos con Desgarrar habilitan Abrumar'],
    ['Sweeping Strikes', 1, 5, '5 golpes también impactan a un 2º enemigo'],
    ['Weaponmaster', 5, 5, 'Bonus según tipo de arma'],
    ['Improved Slam', 2, 6, 'Embate sin retrasar el golpe, 1 s'],
    ['Improved Hamstring', 3, 6, 'Seccionar puede inmovilizar'],
    ['Mortal Strike', 1, 7, 'Golpe mortal']
  ]},
  fury: { nombre: 'Furia', icono: 'ability_warrior_innerrage', talentos: [
    ['Booming Voice', 5, 1, 'Gritos más grandes y baratos'],
    ['Cruelty', 5, 1, '+5% crítico cuerpo a cuerpo'],
    ['Lingering Rage', 5, 2, 'La ira tarda más en decaer fuera de combate'],
    ['Unbridled Wrath', 5, 2, 'Ira extra al golpear'],
    ['Furious Precision', 3, 3, '+golpe de la mano izquierda'],
    ['Piercing Howl', 1, 3, 'Ralentiza en área'],
    ['Blood Craze', 3, 3, 'Regenera vida tras crítico'],
    ['Enrage', 5, 3, '+10% daño físico al recibir golpes'],
    ['Dual Wield Specialization', 5, 4, '+daño e ira de la mano izquierda'],
    ['Reckless Swings', 1, 4, 'Más ira a cambio de vida'],
    ['Improved Execute', 2, 4, 'Ejecutar más barato'],
    ['Improved Berserker Rage', 2, 5, 'Ira rabiosa da 10 de ira'],
    ['Death Wish', 1, 5, '+20% daño, +5% daño recibido'],
    ['Gore Drinker', 2, 5, 'Sanación al golpear'],
    ['Improved Intercept', 2, 5, 'Interceptar con menos CD'],
    ['Improved Whirlwind', 2, 6, 'Torbellino CD 8 s y +30% al más cercano'],
    ['Flurry', 3, 6, '+30% velocidad tras crítico'],
    ['Bloodthirst', 1, 7, 'Sed de sangre']
  ]},
  prot: { nombre: 'Protección', icono: 'inv_shield_06', talentos: [
    ['Improved Bloodrage', 2, 1, '+25% ira de Ira sangrienta'],
    ['Shield Specialization', 5, 1, '+bloqueo y 5 de ira al bloquear'],
    ['Iron Will', 5, 1, 'Aturdimientos/miedos más cortos'],
    ['Anticipation', 5, 2, '+defensa'],
    ['Improved Revenge', 3, 2, '+60% daño de Revancha'],
    ['Improved Thunder Clap', 3, 2, 'Atronar más barato'],
    ['Last Stand', 1, 3, '+vida máxima temporal'],
    ['Master of Defense', 2, 3, 'Ira al esquivar/parar con escudo'],
    ['Improved Disarm', 3, 3, 'Desarmar con menos CD'],
    ['Defiance', 3, 3, '+amenaza en Actitud defensiva'],
    ['Improved Sunder Armor', 3, 4, 'Hender más barato'],
    ['Vanguard', 1, 4, 'Cargar en Actitud defensiva'],
    ['Improved Shield Bash', 2, 4, 'Azote de escudo silencia'],
    ['Improved Shield Wall', 2, 5, 'Muro de escudo con menos CD'],
    ['Concussion Blow', 1, 5, 'Aturde 5 s'],
    ['Focused Rage', 3, 5, 'Habilidades ofensivas más baratas'],
    ['Bastion', 5, 6, '+daño con escudo'],
    ['Shield Slam', 1, 7, 'Embate con escudo']
  ]}
};

// ---------- Builds de nivel 60 ----------
// rangos: cadenas de dígitos en el orden de ARBOLES (formato de talentsforever.com)
const BUILDS = {
  prot: [
    { titulo: 'Más popular', fuente: 'Estadística · talentsforever.com (4.817 builds tras los hotfixes del 3 nov) + wowforevertalent.com (12.622 builds)',
      split: '7/5/39', arms: '0502', fury: '05', prot: '250533120321021351',
      url: 'https://talentsforever.com/warrior/60/0502-05-250533120321021351-12',
      nota: 'Build nº1 de guerrero en ambos sitios. Máximo en Protección: Thunder Clap y Sunder baratos, Imp. Shield Wall y Focused Rage.' },
    { titulo: 'Icy Veins · Shield Slam', fuente: 'Icy Veins (Abide), 4 nov 2026',
      split: '5/15/31', arms: '05', fury: '05500005', prot: '050530120301021251',
      url: 'https://www.icy-veins.com/wow-forever/protection-warrior-tank-pve-spec-builds-talents',
      nota: 'Toma Cruelty, Lingering Rage y Enrage de Furia. Si te falta ira: mueve Anticipation a Imp. Thunder Clap + Imp. Sunder.' }
  ],
  arms: [
    { titulo: 'Más popular = Icy Veins', fuente: 'Estadística talentsforever (#3) + Icy Veins Mortal Strike 2M',
      split: '32/18/0', arms: '30303213132215201', fury: '05050005012', prot: '',
      url: 'https://talentsforever.com/warrior/60/30303213132215201-05050005012--12',
      nota: 'El árbol de Armas es IDÉNTICO en la estadística y en Icy Veins. Icy cambia Imp. Execute 2 → 1 + Imp. Bloodrage 2 (32/17/2).' }
  ],
  fury: [
    { titulo: 'Más popular', fuente: 'Estadística talentsforever.com (#2 de guerrero)',
      split: '17/33/0', arms: '30303213002', fury: '050530055120100231', prot: '',
      url: 'https://talentsforever.com/warrior/60/30303213002-050530055120100231--12',
      nota: 'Bloodthirst + Improved Whirlwind + Flurry. Toma Improved Execute en vez de Improved Berserker Rage.' },
    { titulo: 'Icy Veins · Bloodthirst DW', fuente: 'Icy Veins (Abide), 4 nov 2026',
      split: '18/33/0', arms: '30303213102', fury: '050530055102100231', prot: '',
      url: 'https://www.icy-veins.com/wow-forever/fury-warrior-melee-dps-pve-spec-builds-talents',
      nota: 'Igual que la popular pero con Spearing Strike e Improved Berserker Rage. Si Enrage rinde poco: 3/5 Enrage + 2/2 Imp. Execute.' }
  ]
};

// ---------- Orden de talentos al subir de nivel (Icy Veins) ----------
// [nivel, árbol, índice del talento]. Del 10 al 40 verificado; luego ver calculadora.
function expandir(pasos) { const out = []; let lvl = 10; pasos.forEach(([arbol, idx, n]) => { for (let k = 0; k < n; k++) out.push([lvl++, arbol, idx]); }); return out; }
const LEVELEO = {
  prot: { titulo: 'Protección (leveo con escudo)', calc: 'https://www.icy-veins.com/wow-forever/warrior-talent-calculator#tc-zzzzzCCCDDFFDEHJIIIHNNNMHOOOOOP222iiiiikkkkkqqqqqQ1~70755-d1899b7d',
    guia: 'https://www.icy-veins.com/wow-forever/protection-warrior-leveling',
    orden: expandir([['prot',1,5],['prot',4,3],['prot',5,2],['prot',7,2],['prot',5,1],['prot',6,1],['prot',9,1],['prot',11,1],['prot',10,3],['prot',9,1],['prot',15,3],['prot',14,1],['prot',9,1],['prot',16,5],['prot',17,1]]),
    nota: 'Usa arma 2M hasta aprender Revancha (nv 14) y luego 1M + escudo. Muy segura, casi sin pausas para comer.' },
  arms: { titulo: 'Armas (leveo 2M)', calc: 'https://www.icy-veins.com/wow-forever/warrior-talent-calculator#tc-22211553344467789997cbbddeedddgiiiiijjjjjqqqqqQyyaa~70755-d1899b7d',
    guia: 'https://www.icy-veins.com/wow-forever/arms-warrior-leveling',
    orden: expandir([['arms',2,3],['arms',1,2],['arms',5,2],['arms',3,2],['arms',4,3],['arms',6,1],['arms',7,2],['arms',8,1],['arms',9,3],['arms',7,1],['arms',12,1],['arms',11,2],['arms',13,2],['arms',14,2],['arms',13,3],['arms',16,1]]),
    nota: 'Brutal contra 2 enemigos con Golpes de barrido (nv 30). Sin autosanación: depende de Ataque de la victoria, comida y vendas.' },
  fury: { titulo: 'Furia (leveo doble arma)', calc: 'https://www.icy-veins.com/wow-forever/warrior-talent-calculator#tc-iiiiikkkkklllqqoooootQssqppvvvx2221133554446yyqq777~70755-d1899b7d',
    guia: 'https://www.icy-veins.com/wow-forever/fury-warrior-leveling',
    orden: expandir([['fury',1,5],['fury',3,5],['fury',4,3],['fury',7,2],['fury',8,5],['fury',12,1],['fury',9,1],['fury',11,2],['fury',7,1],['fury',15,2],['fury',16,3],['fury',17,1]]),
    nota: 'Doble arma desde el nv 20 (débil hasta ~36 según Maxroll). Busca una mano izquierda rápida.' }
};

// ---------- Rotaciones (leveo, Icy Veins + Maxroll) ----------
const ROTACIONES = {
  prot: { titulo: 'Protección — un objetivo', pasos: [
    ['battleShout', 'Siempre activo. Úsalo justo después de Ira sangrienta.'],
    ['charge', 'Entra con Cargar (con Vanguard, nv 25, también en Actitud defensiva).'],
    ['demoShout', 'Al empezar: reduce el daño que recibes de todo el grupo.'],
    ['shieldBlock', 'Bloquea dos golpes → 10 de ira con Shield Specialization y activa Revancha.'],
    ['revenge', 'Tu ataque principal: úsalo SIEMPRE que se ilumine.'],
    ['shieldSlam', 'Desde nv 40: máxima prioridad junto a Revancha.'],
    ['thunderClap', 'Con 2+ enemigos (CD 6 s, usable en Actitud defensiva en Forever).'],
    ['sunder', 'Con ira sobrante en enemigos élite.'],
    ['heroic', 'Solo con mucha ira sobrante (usa el golpe automático, no genera ira).']
  ]},
  arms: { titulo: 'Armas — un objetivo', pasos: [
    ['battleShout', 'Siempre activo. Ira sangrienta entre pulls para no perder ira.'],
    ['charge', 'Entra con Cargar en Actitud de batalla.'],
    ['victory', 'Gratis, cura 10%: úsalo antes de que expire (20 s tras matar).'],
    ['rend', 'Pronto, si el enemigo va a vivir el sangrado. Con Bloodthrill habilita Abrumar.'],
    ['overpower', 'Al esquivar o con Bloodthrill. 5 de ira, +50% crítico: lo mejor que tienes.'],
    ['mortalStrike', 'Desde nv 40 en CD (30 de ira, guárdala).'],
    ['slam', 'Con ira sobrante; con Improved Slam no retrasa tu golpe.'],
    ['execute', 'Por debajo del 20%: solo si no necesitas la ira para el siguiente pull.'],
    ['heroic', 'Solo con ira excesiva.']
  ]},
  fury: { titulo: 'Furia — un objetivo', pasos: [
    ['battleShout', 'Siempre activo.'],
    ['charge', 'Entra con Cargar; luego Actitud rabiosa (nv 30).'],
    ['whirlwind', 'Con Improved Whirlwind es la prioridad nº1 (CD 8 s).'],
    ['bloodthirst', 'Desde nv 40 entre Torbellinos.'],
    ['execute', 'Por debajo del 20%.'],
    ['overpower', 'Cambia a Batalla al esquivar (Improved Tactical Mastery conserva ira).'],
    ['heroic', 'Con la ira que sobre; Rajar con 2+ enemigos.']
  ]}
};

// ---------- Teclas: 3 filas de 12 botones (tecla sola, Shift+tecla, Alt+tecla) ----------
// bat / def / ber = habilidad en Actitud de batalla / defensiva / rabiosa.
// any = misma habilidad en cualquier actitud. sino = qué lanzar si no estás en la actitud correcta.
// mo = habilidades que apuntan al enemigo bajo el ratón. atk = añade /startattack.
// txt = macro escrita a mano. libre = sugerencia sin macro (arrastra el objeto).
// La macro de cada botón se genera sola con las habilidades que YA tienes.
const TXT_MODO = '#showtooltip\n/cast [stance:1] {defStance}; {battleStance}\n/equipslot [stance:1] 16 {arma1M}\n/equipslot [stance:1] 17 {escudo}\n/equipslot [stance:2] 16 {arma2M}';
const T_MODO = { t: 'R', txt: TXT_MODO, armas: true, filas: [['⚔️ Batalla', 'Pasa a Defensiva y equipa 1M + escudo'], ['🛡️ Defensiva', 'Pasa a Batalla y equipa tu arma 2M']] };
const T_GRITO = { t: 'Z', txt: '#showtooltip {battleShout}\n/cast {bloodrage}\n/cast {battleShout}', filas: [['Siempre', 'Ira sangrienta + Grito de batalla (un clic: ira y grito)']] };
const T_PIEDRA = { t: 'C', any: 'stoneform', nota: 'Racial de enano: quita veneno, enfermedad y sangrado.' };
const FILA_SHIFT = [
  { t: 'M4', any: 'shoot', nota: 'Pull a distancia con la escopeta (mínimo 8 m). El "!" evita que un segundo clic apague el disparo.' },
  { t: 'M5', bat: 'mockingBlow', sino: 'battleStance', atk: 1, nota: 'Segundo "provocar" (6 s). Solo en Batalla: si no, el primer clic cambia de actitud.' },
  { t: '4', any: 'demoShout', nota: 'Al empezar cada pull: todos los enemigos pegan menos.' },
  { t: 'Z', any: 'battleShout', nota: 'Solo el grito, para renovarlo en combate.' },
  { t: 'X', any: 'bloodrage', nota: 'Solo la ira (cuesta un poco de vida).' },
  { t: 'C', bat: 'retaliation', sino: 'battleStance', nota: 'Devuelve cada golpe durante 15 s (30 min de espera). Para cuando te pegan muchos a la vez.' }
];
const FILA_ALT = [
  { t: 'M4', txt: '#showtooltip {shoot}\n/tm 8\n/cast !{shoot}', filas: [['Siempre', 'Marca calavera y dispara: el grupo sabe a quién pegar']] },
  { t: 'M5', txt: '#showtooltip {shoot}\n/cast [nostance:2] {defStance}; !{shoot}', filas: [['Pull de tanque', '1er clic: Actitud defensiva · 2º clic: dispara']] },
  { t: '1', libre: 'Vendas (arrastra el objeto)' },
  { t: '2', libre: 'Poción de sanación' },
  { t: '3', libre: 'Comida' },
  { t: '4', libre: 'Piedra de afilar / de peso (herrería)' },
  { t: 'Q', libre: 'Pico de minero o montura (nv 40)' },
  { t: 'C', libre: 'Piedra de hogar' }
];
const TECLADO = {
  prot: {
    base: [
      { t: 'M4', bat: 'charge', def: 'taunt', mo: ['taunt'], atk: 1, nota: 'Batalla: entra cargando. Defensiva: recupera al mob que se escapa (vale sobre el enemigo bajo el ratón).' },
      { t: 'M5', bat: 'shieldBash', def: 'shieldBash', mo: ['shieldBash'], nota: 'Corta hechizos (necesita escudo). Vale sobre el enemigo bajo el ratón.' },
      { t: '1', bat: 'rend', def: 'sunder', atk: 1 },
      { t: '2', bat: 'overpower', def: 'revenge', atk: 1, nota: 'Revancha se ilumina al bloquear, esquivar o parar: úsala siempre.' },
      { t: '3', bat: 'heroic', def: 'shieldBlock', nota: 'Bloqueo con escudo activa Revancha y te da ira.' },
      { t: '4', bat: 'thunderClap', def: 'thunderClap', nota: 'Amenaza en área y los enemigos atacan más lento.' },
      { t: 'Q', bat: 'hamstring', def: 'disarm', nota: 'Seccionar frena al que huye. Desarmar contra jefes con arma.' },
      { t: 'E', bat: 'cleave', def: 'cleave', atk: 1, nota: 'Con 2 o más enemigos y ira de sobra.' },
      T_MODO, T_GRITO,
      { t: 'X', bat: 'victory', def: 'victory', atk: 1, nota: 'Gratis y cura 10% tras matar algo.' },
      T_PIEDRA
    ],
    shift: [...FILA_SHIFT,
      { t: '1', any: 'rend', atk: 1, nota: 'Desgarrar sin salir de Defensiva (jefes y élites).' },
      { t: '3', any: 'heroic', atk: 1, nota: 'Golpe heroico en Defensiva cuando te sobra ira.' },
      { t: 'E', bat: 'slam', def: 'slam', atk: 1 }
    ],
    alt: FILA_ALT
  },
  arms: {
    base: [
      { t: 'M4', bat: 'charge', def: 'taunt', ber: 'intercept', mo: ['taunt'], atk: 1 },
      { t: 'M5', bat: 'victory', def: 'shieldBash', ber: 'pummel', mo: ['shieldBash', 'pummel'], atk: 1, nota: 'Batalla: cura gratis tras matar. Defensiva: corta hechizos (con escudo).' },
      { t: '1', bat: 'rend', def: 'sunder', ber: 'whirlwind', atk: 1 },
      { t: '2', bat: 'overpower', def: 'revenge', atk: 1, nota: 'Abrumar: 5 de ira, lo mejor que tienes cuando el enemigo esquiva.' },
      { t: '3', bat: 'heroic', def: 'shieldBlock', ber: 'heroic', nota: 'Golpe heroico solo con ira sobrante.' },
      { t: '4', bat: 'thunderClap', def: 'thunderClap' },
      { t: 'Q', bat: 'hamstring', def: 'disarm', ber: 'hamstring' },
      { t: 'E', bat: 'slam', def: 'cleave', ber: 'slam', atk: 1, nota: 'Embate justo después de un golpe automático.' },
      T_MODO, T_GRITO,
      { t: 'X', bat: 'execute', ber: 'execute', atk: 1, nota: 'Por debajo del 20% de vida.' },
      T_PIEDRA
    ],
    shift: [...FILA_SHIFT,
      { t: '1', any: 'sunder', atk: 1, nota: 'Hender armadura en élites y jefes.' },
      { t: '3', any: 'cleave', atk: 1, nota: 'Rajar con 2 enemigos.' }
    ],
    alt: FILA_ALT
  },
  fury: {
    base: [
      { t: 'M4', bat: 'charge', def: 'taunt', ber: 'intercept', mo: ['taunt'], atk: 1 },
      { t: 'M5', bat: 'victory', def: 'shieldBash', ber: 'pummel', mo: ['shieldBash', 'pummel'], atk: 1 },
      { t: '1', bat: 'rend', def: 'sunder', ber: 'whirlwind', atk: 1 },
      { t: '2', bat: 'overpower', def: 'revenge', ber: 'bloodthirst', atk: 1 },
      { t: '3', bat: 'heroic', def: 'shieldBlock', ber: 'heroic' },
      { t: '4', bat: 'thunderClap', def: 'thunderClap' },
      { t: 'Q', bat: 'hamstring', def: 'disarm', ber: 'hamstring' },
      { t: 'E', bat: 'cleave', def: 'cleave', ber: 'cleave', atk: 1 },
      T_MODO, T_GRITO,
      { t: 'X', bat: 'execute', ber: 'execute', atk: 1, nota: 'Por debajo del 20% de vida.' },
      T_PIEDRA
    ],
    shift: [...FILA_SHIFT,
      { t: '1', any: 'sunder', atk: 1 },
      { t: 'E', bat: 'slam', def: 'slam', ber: 'slam', atk: 1 }
    ],
    alt: FILA_ALT
  }
};

// ---------- Macros para más adelante (sustituyen a las de una tecla al subir de nivel) ----------
const MACROS = [
  { id: 'modo', titulo: 'Modo Tanque ⇄ DPS (cambia arma y actitud)', tecla: 'R', spec: ['prot','arms','fury'], lvl: 10, personal: true,
    desc: 'En Batalla → pasa a Defensiva y equipa 1M + escudo; en Defensiva → Batalla y arma 2M. Usa los nombres de TUS armas.',
    txt: TXT_MODO },
  { id: 'vanguard', titulo: 'Cargar en Defensiva (talento Vanguard)', tecla: 'M4', spec: ['prot'], lvl: 25,
    desc: 'Cuando tomes Vanguard (nv 25) podrás cargar sin salir de Actitud defensiva. Sustituye la macro de M4.',
    txt: '#showtooltip\n/startattack\n/cast [nocombat] {charge}; [@mouseover,harm,nodead][] {taunt}' },
  { id: 'emergencia', titulo: 'Botón de pánico', tecla: 'C', spec: ['prot','arms','fury'], lvl: 28,
    desc: 'Forma de piedra + Muro de escudo (nv 28). Sustituye la macro de C.',
    txt: '#showtooltip\n/cast {stoneform}\n/cast [stance:2] {shieldWall}; {defStance}' },
  { id: 'rabia', titulo: 'Romper miedo (Ira rabiosa)', tecla: 'AX', spec: ['arms','fury','prot'], lvl: 30,
    desc: 'Inmune a miedo y genera ira. Requiere Actitud rabiosa.',
    txt: '#showtooltip {berserkerRage}\n/cast [stance:3] {berserkerRage}; {berserkerStance}' }
];

// ---------- Equipo para tu rango (Icy Veins leveo, IDs de Wowhead Forever) ----------
// f: 'A' solo Alianza, 'H' solo Horda. Se ocultan los de Horda (eres enano).
const MEJORAS = {
  'Arma 2M': [
    [7230, 'Mr. Smite · Las Minas de la Muerte'], [279895, 'Misión "Old Ironforge Incursion" · Hall of Thanes', 'A'],
    [271217, 'Bjork · Ruins of Lordaeron'], [5187, "Rhahk'Zor · Las Minas de la Muerte"], [6214, 'Herrería'],
    [1264, 'Misión "The Fury Runs Deep" · Las Mazmorras', 'A'], [279841, 'Misión "Heart of Disruption" · City of Dalaran', 'A'],
    [273046, 'Unstable Sentinel · City of Dalaran'], [6687, 'Overlord Ramtusk · Horado Rajacieno'],
    [6909, "Aku'mai · Cavernas de Brazanegra"], [6905, 'Gelihast · Cavernas de Brazanegra'], [271766, 'Misión "Prehistoric Prism" · Excavation Site: Wetlands']
  ],
  'Arma 1M (tanque)': [
    [5197, 'Cookie · Las Minas de la Muerte'], [273809, 'Hamhock · Las Mazmorras', 'A'], [1937, 'Sneed · Las Minas de la Muerte'],
    [1951, 'Piratas Defias · Las Minas de la Muerte'], [271204, 'The Baron · Ruins of Lordaeron'], [270256, 'Durgen Dirgehammer · Hall of Thanes', 'A'],
    [6220, 'Archimago Arugal · Castillo de Colmillo Oscuro'], [6323, 'Barón Silverlaine · Castillo de Colmillo Oscuro'],
    [6633, 'Razorclaw · Castillo de Colmillo Oscuro'], [11121, 'Lady Sarevess · Cavernas de Brazanegra'],
    [6692, 'Charlga Razorflank · Horado Rajacieno'], [6681, 'Aggem Thorncurse · Horado Rajacieno'], [6979, 'Misión "Dead-tooth Jack" · Elwynn', 'A'], [2847, 'Herrería']
  ],
  'Escudo': [
    [273811, 'Hamhock · Las Mazmorras', 'A'], [271213, "Rath'mael · Ruins of Lordaeron"], [6223, 'Misión "Bride of the Embalmer" · Bosque del Ocaso', 'A'],
    [7002, 'Misión "Blackfathom Villainy" · Brazanegra'], [1276, "Misión \"Tharil'zun\" · Montañas Crestagrana", 'A'],
    [6725, 'Misión "The Crone of the Kraul" · Horado Rajacieno'], [13245, 'Kresh · Cuevas de los Lamentos']
  ],
  'Armadura (Herrería)': [
    [250518, 'Herrería · se liga al recogerlo'], [250488, 'Herrería · se liga al recogerlo'], [250528, 'Herrería · se liga al recogerlo'],
    [250523, 'Herrería · se liga al recogerlo'], [250508, 'Herrería · se liga al recogerlo'], [250513, 'Herrería · se liga al recogerlo'],
    [250556, 'Herrería · se liga al recogerlo'], [250503, 'Herrería · se liga al recogerlo'], [7915, 'Herrería'], [7913, 'Herrería'], [3480, 'Herrería']
  ],
  'Armadura (mazmorra)': [[6460, 'Lord Cobrahn · Cuevas de los Lamentos']],
  'Anillos': [[270053, 'Misión "The Legend of Stalvan" · Bosque del Ocaso', 'A'], [2933, 'Misión "An Audience with the King" · Ventormenta', 'A']]
};

// ---------- Mazmorras (rangos de Maxroll) ----------
const MAZMORRAS = [
  { n: 'Hall of Thanes', r: [13, 18], f: 'A', nuevo: 1, loot: [279895, 270256] },
  { n: 'Ruins of Lordaeron', r: [15, 20], nuevo: 1, loot: [271217, 271204, 271213] },
  { n: 'Castillo de Colmillo Oscuro', r: [17, 22], loot: [6220, 6323, 6633] },
  { n: 'Las Minas de la Muerte', r: [18, 23], loot: [7230, 5187, 5197, 1937] },
  { n: 'Cuevas de los Lamentos', r: [18, 23], loot: [6460, 13245] },
  { n: 'Las Mazmorras (Stockade)', r: [25, 30], loot: [1264, 273809, 273811] },
  { n: 'City of Dalaran', r: [25, 30], nuevo: 1, loot: [279841, 273046] },
  { n: 'Horado Rajacieno', r: [25, 30], aprox: 1, loot: [6687, 6692, 6681, 6725] },
  { n: 'Cavernas de Brazanegra', r: [27, 32], loot: [6909, 6905, 11121, 7002] },
  { n: 'Monasterio Escarlata: Cementerio', r: [27, 32], loot: [] },
  { n: 'Gnomeregan', r: [29, 34], loot: [] },
  { n: 'Excavation Site: Wetlands', r: [31, 36], nuevo: 1, loot: [271766] }
];

// ---------- Hitos por nivel (Maxroll + Icy Veins) ----------
const HITOS = [
  [10, 'Misión de Actitud defensiva (Kharanos). Provocar y Hender armadura.'],
  [12, 'Abrumar y Azote de escudo.'],
  [20, 'Rajar, Ataque de la victoria, Embate y Represalias. Doble arma (Furia).'],
  [24, 'Ejecutar, nuevos rangos de Golpe heroico, Grito de batalla y Hender.'],
  [30, 'Misión "The Islander": Actitud rabiosa, Interceptar, Ira rabiosa. Golpes de barrido (Armas).'],
  [32, 'Nuevos rangos de Golpe heroico, Ejecutar y Grito de batalla.'],
  [36, 'Torbellino.'],
  [40, 'Golpe mortal / Sed de sangre / Embate con escudo. Armadura de placas. Montura (100 oro en total).'],
  [44, 'Interceptar y Abrumar mejorados.'],
  [50, 'Temeridad.']
];

// ---------- Herrería (recetas de Classic, verifícalas en Forever) ----------
const HERRERIA = [
  { desde: 67, hasta: 75, receta: 'Cinturón de cadenas de cobre', por: [['Barra de cobre', 6]] },
  { desde: 75, hasta: 80, receta: 'Piedra de moler gruesa', por: [['Piedra gruesa', 2]] },
  { desde: 80, hasta: 100, receta: 'Cinturón de cobre rúnico', por: [['Barra de cobre', 10]] },
  { desde: 100, hasta: 105, receta: 'Vara de plata', por: [['Barra de plata', 1], ['Piedra de moler basta', 2]] },
  { desde: 105, hasta: 125, receta: 'Leotardos de bronce bastos', por: [['Barra de bronce', 6]] },
  { desde: 125, hasta: 150, receta: 'Brazales de bronce con dibujos', por: [['Barra de bronce', 5]] }
];
const MINERIA = [
  { desde: 65, hasta: 125, texto: 'Estaño y plata: Loch Modan, Páramos de Poniente, Bosque del Ocaso. Funde bronce (1 cobre + 1 estaño).' },
  { desde: 125, hasta: 150, texto: 'Hierro desde 125: Arathi, Desolace, Trabalomas. Entrena Minería Experto en 125.' }
];

// ---------- Habilidades con armas (IDs de skill de SimC) ----------
const SKILLS_ARMAS = { 43: 'Espadas', 44: 'Hachas', 54: 'Mazas', 55: 'Espadas 2M', 160: 'Mazas 2M', 172: 'Hachas 2M', 229: 'Armas de asta', 136: 'Bastones', 173: 'Dagas', 162: 'Sin armas', 46: 'Armas de fuego', 45: 'Arcos', 226: 'Ballestas', 176: 'Arrojadizas', 95: 'Defensa' };
const SKILLS_PROF = { 164: 'Herrería', 186: 'Minería', 185: 'Cocina', 129: 'Primeros auxilios', 356: 'Pesca', 393: 'Desuello', 182: 'Herboristería', 165: 'Peletería', 333: 'Encantamiento', 202: 'Ingeniería', 197: 'Sastrería', 171: 'Alquimia' };

const METAS_INICIALES = [
  { id: 'm-lvl30', texto: 'Nivel 30: Actitud rabiosa', tipo: 'nivel', objetivo: 30 },
  { id: 'm-lvl40', texto: 'Nivel 40: placas + montura', tipo: 'nivel', objetivo: 40 },
  { id: 'm-oro', texto: '100 oro para la montura', tipo: 'oro', objetivo: 100 },
  { id: 'm-herr150', texto: 'Herrería 150', tipo: 'herreria', objetivo: 150 },
  { id: 'm-min150', texto: 'Minería 150', tipo: 'mineria', objetivo: 150 }
];

const RECURSOS = [
  { grupo: 'Guías de WoW Forever', items: [
    ['Wowhead · WoW Forever', 'https://www.wowhead.com/forever/es/guides/classes/warrior', 'Base de datos, guías y tooltips (la usa esta página).'],
    ['Icy Veins · Guerrero Forever', 'https://www.icy-veins.com/wow-forever/warrior-class-overview', 'Builds, leveo por nivel, rotaciones y equipo. Fuente principal de esta guía.'],
    ['Maxroll · Leveo de guerrero', 'https://maxroll.gg/wow-forever/class-guides/warrior-leveling-guide', 'Habilidades por nivel, mazmorras y profesiones.'],
    ['Warcraft Tavern · Guerrero', 'https://www.warcrafttavern.com/forever/guides/warrior/', 'Builds, cambios de ira y actitudes, razas.'],
    ['Mobalytics · Protección', 'https://mobalytics.gg/wow-forever/classes/protection-warrior-guide-kalltorak', 'Guía de tanque de leveo a 60.']
  ]},
  { grupo: 'Estadísticas de builds (Forever)', items: [
    ['talentsforever.com', 'https://talentsforever.com/warrior', 'Calculadora con estadísticas: 108k builds planeadas, populares tras hotfixes.'],
    ['wowforevertalent.com', 'https://wowforevertalent.com/warrior/', '12.622 builds completas analizadas, % por especialización y talento.'],
    ['ForeverChanges', 'https://foreverchanges.pro/class/warrior', 'Qué cambió del guerrero respecto a Classic.']
  ]},
  { grupo: 'Herramientas', items: [
    ['SimulationCraft (addon)', 'https://www.curseforge.com/wow/addons/simulationcraft', 'Exporta tu personaje con /simc. Compatible con 1.60.1.'],
    ['Warcraft Logs', 'https://www.warcraftlogs.com/', 'Registros de combate (cuando haya bandas de Forever).']
  ]},
  { grupo: 'Retail (aún sin datos de Forever)', items: [
    ['Archon.gg', 'https://archon.gg/', 'Builds más usadas en bandas y M+ de retail.'],
    ['Murlok.io', 'https://murlok.io/', 'Top 50 de M+ y PvP de retail.'],
    ['Raider.io', 'https://raider.io/', 'Rankings de M+ de retail.'],
    ['Raidbots', 'https://www.raidbots.com/', 'Simulación de retail.']
  ]}
];
