import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'
import { Box, Sign } from './Primitives'
import { useOfficeStore } from '../../store/officeStore'
const phrases=['Sale hoy.','Hoy no sale…','Quizás algún día salga.','Urgente desde el lunes.','En cuanto el jefe dé el visto bueno.','Aquí se archiva, no se hace magia.','Pendiente de un churu y una firma.','Esta sí sale, palabra de gato.','La burocracia también tiene bigotes.']
export function QuotationCabinet(){
 const filed=useOfficeStore(s=>s.filedIds.length)
 const [phrase,setPhrase]=useState(phrases[0]),[count,setCount]=useState(0)
 useEffect(()=>{const timer=window.setInterval(()=>setPhrase(current=>{const options=phrases.filter(p=>p!==current);return options[Math.floor(Math.random()*options.length)]}),12000);return()=>window.clearInterval(timer)},[])
 useEffect(()=>{let active=true;void fetch('/api/quotes').then(r=>r.json()).then(data=>{if(active&&Array.isArray(data))setCount(data.filter(q=>q.status==='pending'||q.status==='approved').length)}).catch(()=>{});return()=>{active=false}},[filed])
 const open=()=>window.open('/cotizaciones','_blank','noopener,noreferrer')
 return <group position={[0,0,3.25]} onClick={e=>{e.stopPropagation();open()}}>
  <Box size={[1.35,1.15,0.7]} position={[0,0.65,0]} color="#657b60"/>
  <Box size={[1.48,0.1,0.85]} position={[0,1.27,0]} color="#b99265"/>
  {[0.35,0.8].map(y=><group key={y}><Box size={[1.22,0.39,0.025]} position={[0,y,0.36]} color="#78916b"/><Box size={[0.35,0.04,0.05]} position={[0,y+0.04,0.395]} color="#d4c397"/></group>)}
  <Sign text="COTIZACIONES" position={[0,1.07,0.38]} width={1.18} height={0.18}/>
  {Array.from({length:Math.min(5,count)},(_,i)=><Box key={i} size={[0.63,0.035,0.42]} position={[0,1.35+i*0.04,0]} rotation={[0,(i%2)*0.1,0]} color={i%2?'#e3ca91':'#f1e4bb'}/>)}
  <Html position={[0,1.9,0]} center zIndexRange={[22,0]}><button className="cabinet-label" onClick={open}><strong>📁 Cotizaciones · {count}</strong><span>{phrase}</span><small>Abrir archivo y descargas ↗</small></button></Html>
 </group>
}
