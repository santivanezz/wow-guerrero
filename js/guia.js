// =====================================================================
// CONTENIDO DE LA GUÍA (estático). Edita aquí para cambiar la guía.
// Lo que marques en la página (progreso, checks, diario) NO va aquí:
// se guarda en el navegador (localStorage) y en tus respaldos JSON.
// =====================================================================

const GUIA = {
  talentos: {
    22: [
      { name: "Desvío (Deflection)", rank: "5/5", tree: "Armas", desc: "+5% probabilidad de parada cuerpo a cuerpo.", icon: "⚔️" },
      { name: "Maestría táctica (Tactical Mastery)", rank: "5/5", tree: "Armas", desc: "Conserva hasta 25 de Ira al cambiar de actitud. VITAL PARA TANQUEAR Y CAMBIAR DE ACTITUD.", icon: "🌀" },
      { name: "Ira desbocada (Unbridled Wrath)", rank: "3/5", tree: "Armas/Furia", desc: "Otorga Ira extra con ataques blancos rápidos o de 2 Manos.", icon: "⚡" }
    ],
    30: [
      { name: "Desvío (Deflection)", rank: "5/5", tree: "Armas", desc: "+5% Parada.", icon: "⚔️" },
      { name: "Maestría táctica", rank: "5/5", tree: "Armas", desc: "Retención total de Ira entre cambios de actitud.", icon: "🌀" },
      { name: "Spearing Strike (WoW Forever)", rank: "1/1", tree: "Armas", desc: "Daño extra masivo contra Gigantes y Dragonantes. (por verificar)", icon: "🎯" },
      { name: "Especialización arma 2 manos", rank: "3/5", tree: "Armas", desc: "+6% de daño físico con 2 Manos.", icon: "🪓" },
      { name: "Empalar (Impale)", rank: "2/2", tree: "Armas", desc: "+20% daño crítico de habilidades.", icon: "💥" },
      { name: "Golpes de barrido (Sweeping Strikes)", rank: "1/1", tree: "Armas", desc: "¡HITO NIVEL 30! Daño en área destructivo.", icon: "🌪️" }
    ]
  },

  // id: clave fija para guardar si lo conseguiste. No la cambies una vez usada.
  equipo: [
    { id: "cabeza-minero", slot: "Cabeza", name: "Casco de minero reforzado", type: "Malla", source: "Deadmines", stats: "+6 Fuerza, +5 Agilidad", priority: "Alta" },
    { id: "hombros-bronce", slot: "Hombros", name: "Hombreras de bronce plateado", type: "Malla", source: "Herrería", stats: "+5 Fuerza, +5 Aguante", priority: "Media (Herrería 135)" },
    { id: "pecho-mercenario", slot: "Pecho", name: "Cota de mallas de mercenario", type: "Malla", source: "Misión (Crestagrana)", stats: "+8 Fuerza, +6 Aguante", priority: "Alta" },
    { id: "manos-ogro", slot: "Manos", name: "Guantes de garra de ogro", type: "Malla", source: "Stockades", stats: "+7 Fuerza, +4 Aguante", priority: "Muy Alta" },
    { id: "arma-martillo-bronce", slot: "Arma 2M (BiS)", name: "Martillo de guerra de bronce", type: "Maza 2M", source: "Herrería", stats: "Daño 45-68 (2.9s), +7 Fuerza", priority: "¡MÁXIMA!" }
  ],

  // Ruta de leveo. Cada tarea tiene id para poder marcarla.
  zonas: [
    { range: "18 – 21", title: "Fase 1: Crestagrana + Deadmines", mainZone: "Crestagrana / Páramos",
      tasks: [["z1-misiones", "Completa misiones nivel 18-20 en Crestagrana"], ["z1-deadmines", "Barre Deadmines (Las Minas de la Muerte)"]],
      warning: "Evita los orcos élite Roca Negra." },
    { range: "21 – 23", title: "Fase 2: Loch Modan (Catch-up)", mainZone: "Loch Modan (Thelsamar)",
      tasks: [["z2-verdes", "Misiones verdes de nivel 17-20"], ["z2-mineria", "Mina estaño y cobre de paso (Minería)"]],
      warning: "Subida rápida sin riesgo." },
    { range: "23 – 26", title: "Fase 3: Bosque del Ocaso", mainZone: "Bosque del Ocaso (Villa Oscura)",
      tasks: [["z3-misiones", "Misiones iniciales de Villa Oscura"], ["z3-stockades", "Stockades (Las Mazmorras) como tanque"]],
      warning: "De noche hay muchos no-muertos agrupados: tira de Atronar." },
    { range: "26 – 30", title: "Fase 4: Humedales + Ocaso", mainZone: "Los Humedales (Menethil)",
      tasks: [["z4-humedales", "Misiones de Menethil"], ["z4-ocaso", "Cadenas de misiones restantes del Ocaso"], ["z4-sweeping", "Nivel 30: aprende Golpes de barrido"]],
      warning: "Cocodrilos y raptores pegan fuerte: lleva vendas." },
    { range: "30 – 35", title: "Fase 5: Laderas de Trabalomas + Arathi", mainZone: "Trabalomas / Arathi",
      tasks: [["z5-trabalomas", "Misiones de Costasur"], ["z5-arathi", "Arathi: mina hierro (Minería 125+)"]],
      warning: "Zona en disputa: cuidado con la Horda." }
  ],

  rotaciones: {
    solo: {
      title: "Rotación Solo DPS / Misiones (Actitud de Batalla — Arma 2M)",
      steps: [
        { num: "1", skill: "Grito de batalla Rango 2 (Tecla X)", stance: "Previo", desc: "Mantenlo SIEMPRE activo antes de atacar (+40 PA extra)." },
        { num: "2", skill: "Cargar Rango 1 (Tecla MOUSE 4)", stance: "Actitud de batalla", desc: "Carga desde lejos para generar Ira instantánea." },
        { num: "3", skill: "Ataque de la victoria (Tecla MOUSE 5)", stance: "Actitud de batalla", desc: "¡GRATIS Y SANA 10%! Lánzalo si mataste a alguien hace <20s." },
        { num: "4", skill: "Desgarrar Rango 3 (Tecla 1)", stance: "Actitud de batalla", desc: "Aplica Sangrado en el objetivo principal." },
        { num: "5", skill: "Abrumar Rango 1 (Tecla 2)", stance: "Actitud de batalla", desc: "REACCIÓN: Lánzalo apenas la pantalla indique 'ESQUIVADO'." }
      ],
      taboo: "🛑 No uses Golpe Heroico (Tecla 3) a no ser que tengas más de 50 de Ira."
    },
    tank: {
      title: "Rotación de Tanqueo en Mazmorras (Actitud Defensiva — 1H + Escudo)",
      steps: [
        { num: "1", skill: "Cargar / Cambiar a Defensiva (Mouse 4 ➔ Tecla R)", stance: "Batalla ➔ Defensiva", desc: "Carga e intercambia a Actitud Defensiva con la tecla R manteniendo tu Ira." },
        { num: "2", skill: "Grito desmoralizador (Tecla 4)", stance: "Actitud defensiva", desc: "Genera amenaza en área instantánea a todos los enemigos." },
        { num: "3", skill: "Hender armadura (Tecla 1)", stance: "Actitud defensiva", desc: "Aplica 1 Hender en el objetivo actual y rota con Tabulador." },
        { num: "4", skill: "Revancha Rango 1 (Tecla 2)", stance: "Actitud defensiva", desc: "Súper amenaza por solo 5 de Ira al Parar/Esquivar/Bloquear." },
        { num: "5", skill: "Provocar / Taunt (Tecla MOUSE 4)", stance: "Actitud defensiva", desc: "Obliga a un enemigo descarriado a atacarte a ti." },
        { num: "6", skill: "Azote de escudo (Tecla MOUSE 5)", stance: "Actitud defensiva", desc: "Silencia a taumaturgos enemigos inmediatamente." }
      ],
      taboo: "💡 Usa Bloqueo con Escudo (Tecla 3) para garantizar un bloqueo y activar Revancha al instante."
    }
  },

  // Tramos de herrería. "por" = materiales por creación. ~1 punto por creación (naranja/amarillo).
  // Recetas basadas en Classic: verifícalas en WoW Forever.
  herreria: [
    { desde: 67, hasta: 75, receta: "Cinturón de cadenas de cobre", por: [["Barra de cobre", 6]] },
    { desde: 75, hasta: 80, receta: "Piedra de moler gruesa", por: [["Piedra gruesa", 2]] },
    { desde: 80, hasta: 100, receta: "Cinturón de cobre rúnico", por: [["Barra de cobre", 10]] },
    { desde: 100, hasta: 105, receta: "Vara de plata", por: [["Barra de plata", 1], ["Piedra de moler basta", 2]] },
    { desde: 105, hasta: 125, receta: "Leotardos de bronce bastos", por: [["Barra de bronce", 6]] },
    { desde: 125, hasta: 150, receta: "Brazales de bronce con dibujos", por: [["Barra de bronce", 5]] }
  ],

  mineria: [
    { desde: 65, hasta: 125, texto: "Estaño y plata: Loch Modan, Páramos, Bosque del Ocaso. Funde Bronce (1 cobre + 1 estaño)." },
    { desde: 125, hasta: 150, texto: "Hierro (125) en Arathi, Desolace y Trabalomas. Aprende Minería Experto en 125." }
  ],

  metasIniciales: [
    { id: "m-lvl30", texto: "Nivel 30: Golpes de barrido", tipo: "nivel", objetivo: 30 },
    { id: "m-lvl40", texto: "Nivel 40: Malla + montura", tipo: "nivel", objetivo: 40 },
    { id: "m-herr150", texto: "Herrería 150", tipo: "herreria", objetivo: 150 },
    { id: "m-min150", texto: "Minería 150", tipo: "mineria", objetivo: 150 },
    { id: "m-martillo", texto: "Conseguir Martillo de guerra de bronce", tipo: "manual" }
  ]
};
