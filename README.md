# MiDev AI Office · Cotizaciones

Oficina virtual 3D y editor local de cotizaciones. React, TypeScript, Three.js, React Three Fiber, Drei y Zustand.

## Ejecutar

Usa Node.js 22.18 o posterior (las pruebas ejecutan TypeScript directamente).

```sh
npm install
npm run dev
```

Abre la dirección que indique Vite. La escena requiere WebGL y aceleración gráfica.

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Crear una cotización

1. Pulsa **Nueva cotización** en el encabezado o en **Tus cotizaciones**.
2. Captura cliente, contacto, nombre del servicio, alcance, modalidad y agenda.
3. Elige **Capacitación** o **Consultoría, desarrollo u otro servicio**.
4. Para capacitación, selecciona las horas y la tarifa neta; para otros servicios agrega conceptos, cantidades y tarifas.
5. Ajusta descuento, IVA (configurable para servicios), anticipo, vigencia y condiciones. Puedes editar los datos precargados de MiDev.
6. Consulta la vista previa en vivo o abre **Ver propuesta**.
7. Pulsa **Revisar con el equipo**. Se validan datos e importes y se muestran cuatro resultados: coordinación, costos, estructura y revisión. Los gatos acompañan cada etapa con su animación. Si hay errores se muestran antes de iniciar.
8. Las cotizaciones y la selección se guardan automáticamente en este navegador. **Guardar** permite reintentar si falla el almacenamiento. Puedes reabrir, duplicar o eliminar una propuesta; eliminar requiere confirmación.

La revisión es una comprobación local de datos y reglas. No llama a modelos de IA ni a servicios externos. Los gatos no investigan ni inventan contenido; el usuario captura el servicio, temario y condiciones. Esta etapa no exporta PDFs ni envía propuestas.

## Reglas de capacitación

Fuente: `../Cotizadores/Reglas_de_precio_capacitacion_MiDev_2026-09-29.md`.

- Sesiones de dos horas, entre dos y diez horas por curso.
- Tarifa neta mínima de $330 MXN/hora más $500 MXN de comisión por curso.
- IVA del 16% sobre el subtotal después del descuento.
- Un descuento no puede reducir la base por debajo de `horas × 330 + 500`.
- Excel completo: diez horas / cinco sesiones, precio fijo de $7,000 + IVA, sin descuento.
- Las tarifas son por curso; el número de participantes no multiplica el importe.

Para otros servicios se usa cantidad × tarifa por concepto, descuento porcentual o fijo, IVA configurable y anticipo porcentual o fijo. Los importes de líneas, descuento, IVA y anticipo se redondean a centavos.

Se inspeccionó también `../Cotizadores/cotizador-web/app.js` para conservar el flujo de datos, folios y operaciones comerciales del cotizador existente. Las reglas de capacitación posteriores prevalecen sobre los ejemplos antiguos de las notas. Los archivos originales no se modificaron. Los cambios futuros de reglas deben incorporarse explícitamente al módulo de dominio; el navegador no lee carpetas del equipo.

## Guardado

- Clave independiente y versionada: `midevAiOffice.quotes.v1`.
- No modifica la clave del cotizador anterior (`midevQuotes.v1`) ni importa sus documentos automáticamente.
- Los borradores incompletos se conservan y pueden editarse; solo se marcan como revisados al superar la validación.
- Modificar una propuesta revisada la devuelve a borrador.
- Duplicar genera identificador, folio y fecha nuevos.
- Si el almacenamiento falla, aparece un aviso y los cambios permanecen en memoria; no se muestra una confirmación falsa.
- Si los datos guardados están corruptos, se preservan y se bloquea la sobrescritura. Tras reparar el almacenamiento debe recargarse la aplicación.
- El guardado es local al navegador y al origen; no es una base de datos compartida ni un respaldo externo.

## Oficina 3D

Selecciona un gato o su tarjeta para conocer su función. Arrastra para rotar y usa la rueda o un gesto de pinza para acercar. El botón de cámara recupera el encuadre inicial.

**Probar simulación** conserva el recorrido de demostración, separado de la revisión de cotizaciones. Se impiden ejecuciones simultáneas y se bloquean cambios al documento mientras el equipo lo revisa.

Los gatos se construyen con geometrías 3D. Las etiquetas de Drei usan tamaño fijo en pantalla para evitar el escalado excesivo con la cámara ortográfica. No se usan imágenes estáticas para representar personajes.

## Estructura

- `src/domain/quoteTypes.ts`: modelo de cotización y resultados de revisión.
- `src/domain/quotes.ts`: reglas, cálculos en centavos, validación y folios.
- `src/store/quoteStore.ts`: borradores, almacenamiento y revisión.
- `src/store/officeStore.ts`: selección de agentes, cámara y animación de etapas.
- `src/components/quotes`: biblioteca, formulario y propuesta.
- `src/components/scene`: oficina, iluminación, cámara y manejo de errores WebGL.
- `src/components/characters`: modelo felino reutilizable y animación.
- `src/components/furniture`: mobiliario y primitivas.
- `src/components/dashboard`: equipo, estados y acciones.
- `tests`: reglas de precios, redondeos, folios, datos corruptos y ciclo de guardado/revisión.

El proyecto incluye únicamente el departamento de Cotizaciones. Los modelos de personajes y mobiliario pueden reutilizarse al agregar departamentos y pisos.

## Conversar con IA local

Abre Ollama con `qwen2.5-coder:7b` instalado. Detén el Vite anterior y ejecuta de nuevo `npm run dev`: inicia el servidor API en 127.0.0.1:3001 y Vite con proxy `/api`. `npm run dev:api` inicia solo el servidor. Variables opcionales del servidor: `OLLAMA_MODEL`, `OLLAMA_URL`, `API_PORT` (si cambias el puerto API, ajusta también el proxy de Vite). No se necesitan claves ni proveedores externos.

La conversación es la entrada principal. Salem pregunta por necesidades y datos faltantes; Oliver estructura el curso usando la selección del temario en `server/temario-ia.md`; Milo aplica las reglas en código; Luna revisa la coherencia. Las consultas son secuenciales y las animaciones siguen los eventos del servidor. Hay cancelación, límite de 120 segundos y un intento de reparación de JSON inválido. La conversación se guarda con la clave `midevAiOffice.chat.v1`.

Las propuestas de IA se guardan pendientes de aprobación. El botón Aprobar propuesta registra tu decisión. Una modificación retira la aprobación. El editor manual queda como opción secundaria. Los temarios no contenidos en el catálogo deben presentarse como contenido por confirmar. Revisa siempre el resultado del modelo, especialmente duración y alcance. No se generan PDFs ni se envían propuestas.

La salida de Vite es solo el frontend; para desplegar fuera del desarrollo hace falta alojar también el servidor Node y configurar el proxy. No publiques Ollama directamente en Internet.

### Conversación desde Salem y reglas de coordinación v2

Haz clic en Salem, su etiqueta o «Nueva cotización» para abrir su globo dentro de la escena. El chat ya no ocupa un bloque debajo de la oficina; dentro del globo puedes conversar, revisar y aprobar la propuesta. Cerrar el globo conserva la conversación.

La duración predeterminada es diez horas. Una duración menor solicitada expresamente prevalece; valores fuera de 2, 4, 6, 8 y 10 horas se rechazan. Salem pregunta únicamente si no identifica el curso. Nombre del cliente, modalidad y participantes pueden quedar pendientes, y «para él» se interpreta como capacitación individual. La revisión manual sigue exigiendo confirmar datos pendientes. Las respuestas antiguas del asistente no constituyen cambios permanentes de reglas.

Los mensajes de coordinación no contienen precios redactados por la IA: Milo presenta el desglose calculado. La configuración comercial versionada está en `server/assistant.ts` y reutiliza `TRAINING_RULES`. Un curso fuera del temario autorizado se identifica como propuesta de contenido por confirmar. Las observaciones de Luna se adjuntan a la propuesta y no bloquean su presentación por falta de datos opcionales.

Después de actualizar archivos del servidor, reinicia `npm run dev` para cargar la versión nueva (el proceso API actual no usa recarga automática).

### Pendientes de Salem y SQLite

El globo de Salem incluye «Pendientes y cotizaciones», actualizado cada 2.5 segundos. Muestra la solicitud, cliente, agente actual y si está en proceso, necesita aclaración, está interrumpida, falló o tiene cotización lista. Puedes retomar solicitudes y abrir los documentos terminados. Las consultas de estado no generan nuevas cotizaciones.

Las solicitudes, avances y propuestas se conservan en `data/office.sqlite`, excluida de Git. Respalda ese archivo para conservar el historial. Si el servidor reinicia, las solicitudes activas quedan interrumpidas y pueden retomarse; no se presentan como completadas ni se reinician automáticamente. Las conversaciones antiguas sin registro de servidor no se importan como tareas retroactivamente. La generación sigue vinculada a la conexión de la petición: recargar o cancelar puede interrumpirla, pero el registro permanece.

Durante el desarrollo `npm run dev` ahora inicia Vite con la API local integrada; no necesita un segundo proceso en el puerto 3001. Elimina la dependencia de servidores API antiguos y Vite recarga los cambios del flujo. `npm run dev:api` se conserva como servidor independiente para configuraciones de despliegue. Una conexión en curso se puede interrumpir al cambiar el código del servidor.

Abrir el globo mientras hay trabajo en curso ya no limpia la conversación ni cancela esa solicitud. El inicio de cliente nuevo sigue disponible al finalizar.

### Documentos guardados y descarga

Abre `/cotizaciones` o «Ver cotizaciones guardadas» en el encabezado. Esta pestaña consulta la tabla `quotes` de SQLite y permite seleccionar, ver y descargar documentos HTML autónomos y datos JSON. Los borradores y propuestas generados se guardan al emitirse; los registros anteriores que contenían documentos se incorporan al crear la tabla. Los folios se asignan en el servidor y se conservan al actualizar el documento. El botón de importación permite guardar cotizaciones existentes del navegador sin sobrescribir versiones de servidor más recientes.

La aprobación del chat también se envía a SQLite; si falla, se indica que solo está guardada en el navegador. «¡La mando, jefe!» se anuncia después de guardar una propuesta final en la base, y no representa envío por correo. Las descargas no generan PDFs.

Los cursos Python, Codex y Claude tienen temarios base independientes por sesiones. La solicitud explícita del usuario prevalece sobre menciones de asistentes anteriores. Para esos cursos el contenido base y su revisión comercial no necesitan esperar nuevas consultas del modelo; la IA identifica los datos del cliente. Los documentos históricos no se reescriben automáticamente, y la vista advierte si detecta mezclas de herramientas entre el título y el contenido.

La tarifa vigente se actualizó por instrucción del usuario a $330 por hora. Esta actualización prevalece sobre el importe histórico de $290 del documento fuente. Diez horas: $3,300 + $500 de comisión = $3,800 + IVA ($4,408 total). Las cotizaciones guardadas conservan su tarifa original; las nuevas usan $330. El paquete fijo de Excel mantiene $7,000 + IVA.

### Asesorías sueltas

Cursos y asesorías utilizan $330 por hora. Las asesorías se identifican como un tipo independiente (`advisory`), se cobran por las horas solicitadas más IVA del 16% y no incluyen comisión ni el paquete de Excel. No tienen la restricción de sesiones de dos horas propia de los cursos. Si no se indican horas de asesoría, Salem pregunta la duración antes de cotizar. Ejemplo: una hora, $330 + $52.80 de IVA = $382.80. Un curso normal de diez horas sigue en $3,800 + IVA = $4,408, incluyendo comisión de $500. Los documentos anteriores no se recalculan automáticamente.
# oficina_gatuna
# oficina_nueva
