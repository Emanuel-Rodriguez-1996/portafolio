# Portafolio Web — Emanuel Rodriguez

Portafolio personal con una escena 3D interactiva hecha con Three.js (galaxia de partículas, sol, luna y satélite) y una sección de proyectos, skills y contacto.

## Tecnologías
- HTML, CSS, Bootstrap 5
- JavaScript + Three.js (renderizado 3D)
- Formspree (formulario de contacto)

## Cómo correrlo localmente
No requiere build. Al no usar imports de npm empaquetados (Three.js se carga vía import map desde CDN), alcanza con servir la carpeta con cualquier servidor estático, por ejemplo:

## Estructura
- `index.html` — estructura de la página
- `app.js` — escena 3D (Three.js)
- `style/` — hojas de estilo por sección
- `imgs/` — imágenes, iconos y modelos 3D (.glb)

## Notas
- Los modelos `.glb` de `imgs/` están comprimidos con Draco (`gltf-transform optimize --compress draco --texture-compress webp`). `app.js` ya incluye el `DRACOLoader` necesario.
- Las capturas de `imgs/proyectos/` están en WebP; `imgs/og-image.jpg` se usa para la vista previa al compartir el link.
- La escena 3D se pausa cuando el hero no está visible y usa menos partículas en pantallas chicas o equipos con pocos núcleos.
