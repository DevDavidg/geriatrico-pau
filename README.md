# Geriátrico Lumina

Aplicación demo construida con Astro + React para gestionar módulos operativos de un geriátrico:

- Enfermeras: perfil, calendario de francos y pase de guardia.
- Geriátrico: pacientes, farmacia, documentación e insumos.
- Mucamas: turnos, tareas y registro de accidentes.

## Scripts

- `npm run dev`: inicia el entorno local en `localhost:4321`.
- `npm run build`: genera el build de producción en `dist/`.
- `npm run preview`: previsualiza el build generado.

## Estructura Principal

```text
src/
  components/
    geriatrico/    # módulos funcionales + tipos + datos mock
    ui/            # componentes base y barrel imports
  layouts/
  pages/
  styles/
```
