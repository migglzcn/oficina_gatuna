import type { AgentId } from '../data/agents.ts'
export interface RequestContext { client: string; course: string; hours: number; discountRequested?: boolean }
export function agentComment(id: AgentId, context: RequestContext | null, variant = 0): string {
  const client = context?.client.trim() || 'Este cliente'
  const course = context?.course.trim() || 'su capacitación'
  const hours = context?.hours
  if (context?.discountRequested) {
    const discountComments = [
      `${client}: ¿descuento sobre descuento? ¡No miauches, mis croquetas no se pagan solas!`,
      `${client}: ¿otra rebajita? Mis croquetas ya están haciendo cuentas.`,
      `${client}: revisando el descuento… ¡el churu no se paga con buenas intenciones!`,
      `${client}: una cosa es ser buen gato y otra regalar las croquetas.`,
      `${client}: ¿descuento? Primero revisemos que siga saliendo para el atún.`,
      `${client}: no miauches, ¡hasta la calculadora se erizó con esa rebaja!`,
      `${client}: descuento en revisión. Mis bigotes no autorizan precios bajo el mínimo.`,
      `${client}: pidió rebaja y la alcancía de croquetas empezó a temblar.`,
    ]
    const offset = {coordinador:0,costos:2,cotizador:4,revisor:6}[id]
    return discountComments[(Math.abs(variant)+offset) % discountComments.length]
  }
  const choices: Record<AgentId, string[]> = {
    coordinador: [`${client}: vamos a organizar ${course}. ¡Esta coti sale con ronroneo!`, `${client}: revisando la solicitud. ¡Equipo, a ganarse las croquetas!`,
      `${client}: una buena propuesta empieza con las orejas bien atentas.`,
      `${client}: vamos a poner orden antes de que alguien se acueste en el teclado.`,
      `${client}: ${course} está en la bandeja. ¡Que ruede la chamba!`,
      `${client}: coordinando al equipo. Aquí se delega, no se dormita.`,
      `${client}: esta solicitud merece más atención que una lata abriéndose.`,
      `${client}: repartiendo tareas… ¡el churu se gana en equipo!`,
      `${client}: enfoquemos el curso. Nada de perseguir tres láseres a la vez.`,
      `${client}: otra coti en marcha. Las croquetas no se pagan solas.`,
      `${client}: primero entender la necesidad, luego conquistar la caja.`,
      `${client}: bigotes atentos, patitas a la obra.`,
    ],
    costos: [`¡Señor, sí señor! ${client}: revisando costos y comisión.`, `${client}: sumando el IVA… ¡que no se nos vaya un centavo en croquetas!`,
      `${client}: separando capacitación y comisión. No revolvamos el atún.`,
      `${client}: los números deben cuadrar, aunque yo duerma en círculos.`,
      `${client}: calculadora lista. Hoy no aceptamos cuentas hechas con la cola.`,
      `${client}: revisando la inversión. El churu todavía no es moneda oficial.`,
      `${client}: contando centavos, no ovejas.`,
      `${client}: nada de descuentos que dejen al instructor sin croquetas.`,
      `${client}: sumando con cuidado. Una patita de más cambia la cuenta.`,
      `${client}: aquí el IVA no se esconde debajo del sillón.`,
      `${client}: comisión por un lado, capacitación por otro. ¡Orden en el plato!`,
      `${client}: revisando los importes. Mis bigotes detectan redondeos sospechosos.`,
    ],
    cotizador: [`${client}: armando el temario de ${course}${hours ? ` en ${hours} horas` : ''}. ¡A afilar las ideas!`, `${client}: organizando las sesiones. ¡Mucho aprendizaje, nada de relleno felino!`,
      `${client}: acomodando ${course} por sesiones. Todo cabe con buenas patitas.`,
      `${client}: primero fundamentos, después ejercicios. No saltemos directo al tejado.`,
      `${client}: este temario necesita estructura, no una bola de estambre.`,
      `${client}: afinando el alcance. Un curso no es una lista de deseos infinita.`,
      `${client}: buscando ejercicios útiles. El teclado no es solo para echarse encima.`,
      `${client}: organizando contenidos sin meterlos a presión en la caja.`,
      `${client}: poniendo las ideas en fila. Más difícil que formar gatos.`,
      `${client}: preparando una propuesta clara. Hasta mi humano debe entenderla.`,
      `${client}: menos promesas de superpoderes, más práctica con sentido.`,
      `${client}: hilando el temario sin enredarme con la cola.`,
    ],
    revisor: [`${client}: revisando alcance y duración. ¡Ojo de gato para los detalles!`, `${client}: comprobando la propuesta. ¡Ni una errata se escapa de estas patitas!`,
      `${client}: revisando que el temario quepa en las horas. No hacemos magia gatuna.`,
      `${client}: pasando el peine fino. Y no precisamente por mi pelaje.`,
      `${client}: si hay un detalle suelto, lo atrapo antes que al láser.`,
      `${client}: cotejando alcance y condiciones. Nada de sorpresas en la caja.`,
      `${client}: leyendo hasta la letra chiquita. Para eso tengo ojos de gato.`,
      `${client}: una última mirada antes de presentar. El ronroneo no sustituye la revisión.`,
      `${client}: buscando contradicciones. Soy curiosa por contrato.`,
      `${client}: comprobando que las promesas tengan las patitas en la tierra.`,
      `${client}: revisando los detalles con más atención que una ventana con pájaros.`,
      `${client}: esta propuesta pasa por mis bigotes antes de llegar a tus manos.`,
    ],
  }
  return choices[id][Math.abs(variant) % choices[id].length]
}

export function mentionsDiscount(text: string): boolean {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/\bsin (?:descuento|rebaja)|\bno (?:quiero|necesito|pido) (?:un |una )?(?:descuento|rebaja)/.test(normalized)) return false
  return /\b(?:descuento|rebaja|rebajita|descuentito)\b|mas barato/.test(normalized)
}
