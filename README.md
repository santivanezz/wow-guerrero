# ⚔️ Guerrero WoW Forever — Guía y progreso personal

Página personal para seguir el progreso de mi Guerrero Enano en World of Warcraft: Forever.

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página y pestañas |
| `js/guia.js` | Contenido de la guía (talentos, equipo BiS, ruta, rotaciones, recetas de herrería, metas). **Edita aquí para cambiar la guía.** |
| `js/app.js` | Lógica: guardado, progreso, diario, respaldos |

## Cómo se guarda el progreso

- Todo lo que marcas (nivel, profesiones, equipo, ruta, metas, diario) se guarda en **el navegador** (localStorage) del PC donde abres la página.
- Usa **Mi Progreso → Exportar JSON** de vez en cuando. Si cambias de navegador o borras datos, usa **Importar JSON**.
- El repositorio NO guarda tu progreso: solo la página y la guía.

## Probar en local

```bash
python -m http.server 8765
```

Abre http://localhost:8765

## Publicar cambios (GitHub Pages)

```bash
git add -A
git commit -m "Actualizar guía"
git push
```

GitHub Pages se actualiza en 1–2 minutos.

## Fases

1. ✅ Página en línea + progreso manual + diario + respaldos
2. Ajustes de contenido de la guía (verificar recetas/objetos en WoW Forever)
3. Addon propio en Lua que exporte el personaje (SavedVariables) → importar en la página
