# ⚔️ Guerrero de Rasganorte — WoW Forever

Página personal para mi Guerrero en World of Warcraft: Forever (1.60.1), estilo Lich King.

**En línea:** https://santivanezz.github.io/wow-guerrero/

## Qué tiene

- **Panel**: nivel, XP con descanso, oro, profesiones, habilidad con armas, atributos y "qué hacer ahora" (siguiente talento, hitos, montura, reparar, bolsas llenas…).
- **Equipo y bolsas**: tu equipo, bolsas y banco con tooltips de Wowhead Forever; mejoras para tu rango marcando lo que ya tienes.
- **Comparador** (estilo SimC simplificado): DPS estimado de cada arma con tu PA y crítico, penalización por habilidad con armas, escudos por mitigación y piezas que mejoran tu equipo. Acepta cualquier objeto pegando su enlace de Wowhead.
- **Talentos**: orden de leveo nivel a nivel (Icy Veins) y builds de 60 comparando **estadística** (talentsforever.com / wowforevertalent.com) con guías.
- **Rotación, Macros y Teclas** por especialización (Protección, Armas, Furia), con los nombres de tu cliente.
- **Mazmorras** con rango de nivel y botín, **Diario** con evolución automática, **Recursos**.

## Sincronizar con el juego (sin escribir nada a mano)

1. **GuerreroSync** (`addon/GuerreroSync.zip`): descomprímelo en `Interface\AddOns` de WoW Forever. Exporta oro, XP, bolsas, banco, equipo, talentos, profesiones y nombres de hechizos.
2. En el juego: `/gsync guardar` (o `/reload`, o salir del juego).
3. En la página: **⟳ Sincronizar → Conectar GuerreroSync.lua** y elige `WTF\Account\<CUENTA>\SavedVariables\GuerreroSync.lua` (Chrome/Edge). Desde ahí se relee solo.
4. Alternativa: pegar la salida de `/simc` (SimulationCraft) en la misma pestaña.

Todo se procesa en el navegador; tu progreso no se sube al repositorio. Exporta un respaldo JSON de vez en cuando.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html`, `css/lichking.css` | Página y estilo |
| `js/guia.js` | Datos de la guía: habilidades, talentos, builds, macros, equipo, mazmorras. **Edita aquí.** |
| `js/wowhead-data.js` | Nombres/iconos de Wowhead (generado) |
| `js/sync.js` | Lectores de SavedVariables (Lua) y SimC, conexión con el archivo |
| `js/app.js` | Estado y render |
| `addon/GuerreroSync/` | Addon de WoW (Interface 16001) |

## Local

```bash
python -m http.server 8765
```
