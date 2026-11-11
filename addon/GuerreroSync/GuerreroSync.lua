-- =====================================================================
-- GuerreroSync — exporta tu personaje a SavedVariables para tu página web.
-- WoW guarda el archivo al hacer /reload o al salir del juego:
--   WTF\Account\<CUENTA>\SavedVariables\GuerreroSync.lua
-- Solo LEE información; no automatiza nada del juego.
-- =====================================================================
local ADDON = ...
local f = CreateFrame("Frame")
local pendiente = false

local function P(msg) DEFAULT_CHAT_FRAME:AddMessage("|cff8fd6ff[GuerreroSync]|r " .. tostring(msg)) end
local function seguro(fn, ...)
  if type(fn) ~= "function" then return end
  local ok, a, b, c, d, e, g, h = pcall(fn, ...)
  if ok then return a, b, c, d, e, g, h end
end

-- En Forever los personajes pueden tener apellido: UnitFullName lo devuelve
-- en la segunda posición (donde en otros clientes va el reino).
local function plano(s) return (s or ""):lower():gsub("[%s%-']", "") end
local function claveJugador()
  local nombre, sufijo = UnitFullName("player")
  local reino = GetRealmName() or "?"
  local normal = (GetNormalizedRealmName and GetNormalizedRealmName()) or reino
  if sufijo and sufijo ~= "" and plano(sufijo) ~= plano(reino) and plano(sufijo) ~= plano(normal) then
    nombre = (nombre or "?") .. " " .. sufijo
  end
  return (nombre or "?") .. "-" .. reino, nombre, reino
end

local function nombreDeEnlace(link) return link and link:match("|h%[(.-)%]|h") end
local function idDeEnlace(link) return link and tonumber(link:match("item:(%d+)")) end

-- ---------- Profesiones y habilidades (armas, defensa) ----------
local function leerHabilidades()
  local lineas = {}
  -- API clásica (puede no existir en Forever)
  if GetNumSkillLines and GetSkillLineInfo then
    local grupo = ""
    for i = 1, (seguro(GetNumSkillLines) or 0) do
      local nombre, esCabecera, _, rango, _, mod, max = seguro(GetSkillLineInfo, i)
      if nombre then
        if esCabecera then grupo = nombre
        else table.insert(lineas, { nombre = nombre, actual = (rango or 0) + (mod or 0), max = max or 0, grupo = grupo }) end
      end
    end
  end
  -- API moderna de profesiones
  if #lineas == 0 and GetProfessions and GetProfessionInfo then
    local p = { seguro(GetProfessions) }
    for k = 1, 6 do
      local idx = p[k]
      if idx then
        local nombre, _, rango, max, _, _, linea = seguro(GetProfessionInfo, idx)
        if nombre then table.insert(lineas, { nombre = nombre, actual = rango or 0, max = max or 0, grupo = "Profesiones", linea = linea }) end
      end
    end
  end
  return lineas
end

-- ---------- Equipo ----------
local function leerEquipo()
  local equipo = {}
  for slot = 0, 19 do
    local link = seguro(GetInventoryItemLink, "player", slot)
    if link then
      local dur, durMax = seguro(GetInventoryItemDurability, slot)
      table.insert(equipo, { slot = slot, id = idDeEnlace(link), nombre = nombreDeEnlace(link), dur = dur, durMax = durMax })
    end
  end
  return equipo
end

-- ---------- Bolsas y banco ----------
local function infoRanura(bolsa, ranura)
  if C_Container and C_Container.GetContainerItemInfo then
    local info = seguro(C_Container.GetContainerItemInfo, bolsa, ranura)
    if info then return info.itemID, info.stackCount, info.quality, info.hyperlink end
    return
  end
  if GetContainerItemInfo then
    local _, cantidad, _, calidad, _, _, link, _, _, id = seguro(GetContainerItemInfo, bolsa, ranura)
    return id or idDeEnlace(link), cantidad, calidad, link
  end
end

local function numRanuras(bolsa)
  if C_Container and C_Container.GetContainerNumSlots then return seguro(C_Container.GetContainerNumSlots, bolsa) or 0 end
  return seguro(GetContainerNumSlots, bolsa) or 0
end

local function leerContenedores(lista)
  local items, libres, total = {}, 0, 0
  for _, bolsa in ipairs(lista) do
    local n = numRanuras(bolsa)
    total = total + n
    for ranura = 1, n do
      local id, cantidad, calidad, link = infoRanura(bolsa, ranura)
      if id then
        table.insert(items, { b = bolsa, r = ranura, id = id, n = cantidad or 1, q = calidad, nombre = nombreDeEnlace(link) })
      else
        libres = libres + 1
      end
    end
  end
  return items, libres, total
end

local function bolsasJugador() local t = {} for b = 0, (NUM_BAG_SLOTS or 4) do table.insert(t, b) end return t end
local function bolsasBanco()
  local t = { BANK_CONTAINER or -1 }
  local desde = (NUM_BAG_SLOTS or 4) + 1
  for b = desde, desde + (NUM_BANKBAGSLOTS or 6) - 1 do table.insert(t, b) end
  return t
end

-- ---------- Talentos ----------
local function leerTalentos()
  local arboles = {}
  if not GetNumTalentTabs then return arboles end
  for t = 1, (seguro(GetNumTalentTabs) or 0) do
    local a, b, _, _, e = seguro(GetTalentTabInfo, t)
    local nombre, puntos = a, nil
    if type(a) == "number" then nombre = b; puntos = e end
    local arbol = { nombre = nombre, puntos = 0, lista = {} }
    for i = 1, (seguro(GetNumTalents, t) or 0) do
      local tn, _, fila, col, rango, max = seguro(GetTalentInfo, t, i)
      if tn then
        table.insert(arbol.lista, { nombre = tn, rango = rango or 0, max = max or 0, fila = fila, col = col })
        arbol.puntos = arbol.puntos + (rango or 0)
      end
    end
    if type(puntos) == "number" and puntos > arbol.puntos then arbol.puntos = puntos end
    table.insert(arboles, arbol)
  end
  return arboles
end

-- ---------- Libro de hechizos (nombres EXACTOS de tu cliente para las macros) ----------
local function leerHechizos()
  local h = {}
  if C_SpellBook and C_SpellBook.GetNumSpellBookSkillLines and C_SpellBook.GetSpellBookItemInfo then
    local banco = (Enum and Enum.SpellBookSpellBank and Enum.SpellBookSpellBank.Player) or 0
    for l = 1, (seguro(C_SpellBook.GetNumSpellBookSkillLines) or 0) do
      local linea = seguro(C_SpellBook.GetSpellBookSkillLineInfo, l)
      if linea and linea.itemIndexOffset then
        for i = linea.itemIndexOffset + 1, linea.itemIndexOffset + (linea.numSpellBookItems or 0) do
          local info = seguro(C_SpellBook.GetSpellBookItemInfo, i, banco)
          if info and info.spellID and info.name then h[info.spellID] = info.name end
        end
      end
    end
  end
  if next(h) == nil and GetNumSpellTabs and GetSpellTabInfo then
    for t = 1, (seguro(GetNumSpellTabs) or 0) do
      local _, _, offset, num = seguro(GetSpellTabInfo, t)
      for i = (offset or 0) + 1, (offset or 0) + (num or 0) do
        local nombre = seguro(GetSpellBookItemName, i, BOOKTYPE_SPELL or "spell")
        local _, id = seguro(GetSpellBookItemInfo, i, BOOKTYPE_SPELL or "spell")
        if nombre and id then h[id] = nombre end
      end
    end
  end
  return h
end

-- ---------- Atributos ----------
local function leerStats()
  local s = {}
  local function stat(i) local _, v = seguro(UnitStat, "player", i); return v end
  s.fuerza, s.agilidad, s.aguante, s.intelecto, s.espiritu = stat(1), stat(2), stat(3), stat(4), stat(5)
  local _, arm = seguro(UnitArmor, "player"); s.armadura = arm
  local base, pos, neg = seguro(UnitAttackPower, "player"); if base then s.pa = base + (pos or 0) + (neg or 0) end
  s.critico = seguro(GetCritChance)
  s.esquivar = seguro(GetDodgeChance)
  s.parar = seguro(GetParryChance)
  s.bloquear = seguro(GetBlockChance)
  local db, dm = seguro(UnitDefense, "player"); if db then s.defensa = db + (dm or 0) end
  s.vida = seguro(UnitHealthMax, "player")
  return s
end

-- ---------- Instantánea ----------
local function snapshot(motivo)
  if InCombatLockdown() or UnitAffectingCombat("player") then pendiente = true; return end
  GuerreroSyncDB = GuerreroSyncDB or {}
  GuerreroSyncDB.personajes = GuerreroSyncDB.personajes or {}
  local clave, nombre, reino = claveJugador()
  local pj = GuerreroSyncDB.personajes[clave] or {}
  local _, claseEN = UnitClass("player")
  local raza, razaEN = UnitRace("player")

  pj.version = 1
  pj.nombre, pj.reino = nombre, reino
  pj.raza, pj.razaEN, pj.clase = raza, razaEN, claseEN
  pj.nivel = UnitLevel("player")
  pj.xp, pj.xpMax = UnitXP("player"), UnitXPMax("player")
  pj.descanso = seguro(GetXPExhaustion) or 0
  pj.dinero = GetMoney()
  pj.zona, pj.subzona = GetZoneText(), GetSubZoneText()
  pj.hermandad = seguro(GetGuildInfo, "player")
  pj.habilidades = leerHabilidades()
  pj.equipo = leerEquipo()
  local items, libres, total = leerContenedores(bolsasJugador())
  pj.bolsas, pj.bolsasLibres, pj.bolsasTotal = items, libres, total
  pj.talentos = leerTalentos()
  pj.hechizos = leerHechizos()
  pj.stats = leerStats()
  pj.actualizado = time()
  pj.motivo = motivo
  GuerreroSyncDB.personajes[clave] = pj
  pendiente = false
end

local function snapshotBanco()
  GuerreroSyncDB = GuerreroSyncDB or {}
  GuerreroSyncDB.personajes = GuerreroSyncDB.personajes or {}
  local clave = claveJugador()
  local pj = GuerreroSyncDB.personajes[clave] or {}
  local items, libres, total = leerContenedores(bolsasBanco())
  pj.banco = { items = items, libres = libres, total = total, fecha = time() }
  GuerreroSyncDB.personajes[clave] = pj
end

local temporizador
local function programar(motivo)
  if temporizador then return end
  temporizador = C_Timer.NewTimer(2, function() temporizador = nil; snapshot(motivo) end)
end

f:SetScript("OnEvent", function(_, ev, arg1, arg2)
  if ev == "ADDON_LOADED" then
    if arg1 == ADDON then GuerreroSyncDB = GuerreroSyncDB or {} end
  elseif ev == "PLAYER_ENTERING_WORLD" then
    C_Timer.After(5, function() snapshot("entrada") end)
  elseif ev == "TIME_PLAYED_MSG" then
    local clave = claveJugador()
    if GuerreroSyncDB and GuerreroSyncDB.personajes and GuerreroSyncDB.personajes[clave] then
      GuerreroSyncDB.personajes[clave].jugadoTotal = arg1
      GuerreroSyncDB.personajes[clave].jugadoNivel = arg2
    end
  elseif ev == "BANKFRAME_OPENED" then
    C_Timer.After(1, snapshotBanco)
  elseif ev == "PLAYER_REGEN_ENABLED" then
    if pendiente then programar("fin-combate") end
  elseif ev == "PLAYER_LOGOUT" or ev == "PLAYER_LEAVING_WORLD" then
    pcall(snapshot, "salida")
  else
    programar(ev)
  end
end)

for _, ev in ipairs({ "ADDON_LOADED", "PLAYER_ENTERING_WORLD", "PLAYER_LEVEL_UP", "PLAYER_XP_UPDATE", "PLAYER_MONEY",
  "BAG_UPDATE_DELAYED", "PLAYER_EQUIPMENT_CHANGED", "CHARACTER_POINTS_CHANGED", "SKILL_LINES_CHANGED", "SPELLS_CHANGED",
  "ZONE_CHANGED_NEW_AREA", "BANKFRAME_OPENED", "PLAYER_REGEN_ENABLED", "TIME_PLAYED_MSG", "PLAYER_LOGOUT", "PLAYER_LEAVING_WORLD" }) do
  pcall(f.RegisterEvent, f, ev)
end

SLASH_GUERREROSYNC1 = "/gsync"
SlashCmdList.GUERREROSYNC = function(msg)
  msg = (msg or ""):lower()
  if msg == "guardar" or msg == "save" then
    snapshot("manual"); ReloadUI(); return
  end
  if msg == "tiempo" then RequestTimePlayed(); return end
  snapshot("manual")
  local pj = GuerreroSyncDB and GuerreroSyncDB.personajes and GuerreroSyncDB.personajes[claveJugador()]
  if not pj then P("No se pudo leer el personaje (¿en combate?). Inténtalo fuera de combate."); return end
  local n = 0 for _ in pairs(pj.hechizos or {}) do n = n + 1 end
  P(("%s nivel %d · %d oro · %d objetos en bolsas (%d libres) · %d hechizos · %d profesiones/habilidades"):format(
    claveJugador(), pj.nivel or 0, math.floor((pj.dinero or 0) / 10000), #(pj.bolsas or {}), pj.bolsasLibres or 0, n, #(pj.habilidades or {})))
  P("Escribe |cffffd100/gsync guardar|r (o /reload) para escribirlo en disco y pulsa Sincronizar en tu página.")
end
