import type { Message } from './assistant.ts'
export function requestedCourse(messages:Message[]):'Python'|'Codex'|'Claude'|null {
 let course:'Python'|'Codex'|'Claude'|null=null
 for(const message of messages.filter(m=>m.role==='user')){
  const explicit=message.content.match(/(?:curso|capacitaci[oó]n|cotizaci[oó]n)\s+(?:de\s+|en\s+|para\s+)?(python|codex|claude)\b/i)
  const match=explicit||message.content.match(/\b(python|codex|claude)\b/i)
  if(match)course={python:'Python',codex:'Codex',claude:'Claude'}[match[1].toLowerCase()] as 'Python'|'Codex'|'Claude'
 }
 return course
}
export function courseContent(course:string,hours:number){
 const sessions:Record<string,string[]>={
  Python:['Fundamentos de Python: instalación, variables, tipos y operaciones.','Control de flujo: condicionales, ciclos y ejercicios.','Funciones, listas, diccionarios y organización de código.','Archivos, manejo de errores y procesamiento de datos.','Proyecto integrador: automatización sencilla, pruebas y siguientes pasos.'],
  Codex:['Primeros pasos con Codex, terminal y Visual Studio Code.','Git y revisión de cambios propuestos por Codex.','Prompts, contexto del proyecto y tareas de programación con Codex.','Automatización y conexión de herramientas mediante MCP.','Proyecto con Codex: implementación, pruebas y validación de resultados.'],
  Claude:['Primeros pasos con Claude Code, terminal y Visual Studio Code.','Git y revisión de cambios propuestos por Claude Code.','Prompts, contexto del proyecto y tareas de programación con Claude Code.','Automatización y conexión de herramientas mediante MCP.','Proyecto con Claude Code: implementación, pruebas y validación de resultados.'],
 }
 const items=sessions[course];if(!items)return null
 return {description:`Capacitación práctica en ${course}, ajustada a ${hours} horas. El recorrido construye fundamentos y práctica; no promete dominio avanzado en diez horas.`,scope:'TEMARIO BASE · CONTENIDO POR CONFIRMAR\n\n'+items.slice(0,hours/2).map((text,i)=>`Sesión ${i+1} · 2 horas\n${text}`).join('\n\n')}
}
