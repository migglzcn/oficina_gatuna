import { Canvas } from '@react-three/fiber'

export function SalemPortrait() {
  return <div className="salem-portrait" role="img" aria-label="Retrato de Salem, gato negro con traje y corbata roja"><Canvas orthographic camera={{position:[0,0.1,4],zoom:60}} dpr={[1,1.5]} gl={{alpha:true}}>
    <ambientLight intensity={2}/><directionalLight position={[2,3,4]} intensity={3}/>
    <mesh position={[0,-0.6,0]} scale={[0.55,0.6,0.28]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#20272a"/></mesh>
    <mesh position={[0,-0.5,0.28]}><boxGeometry args={[0.24,0.4,0.03]}/><meshStandardMaterial color="#f3efdf"/></mesh>
    <mesh position={[0,-0.55,0.32]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.08,0.35,4]}/><meshStandardMaterial color="#c94d49"/></mesh>
    <mesh scale={[0.48,0.42,0.32]}><sphereGeometry args={[1,24,20]}/><meshStandardMaterial color="#272c30"/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*0.31,0.38,0]} rotation={[0,0,-side*0.2]}><coneGeometry args={[0.19,0.4,3]}/><meshStandardMaterial color="#272c30"/></mesh>
      <mesh position={[side*0.31,0.39,0.09]}><coneGeometry args={[0.1,0.22,3]}/><meshStandardMaterial color="#c59389"/></mesh>
      <mesh position={[side*0.18,0.04,0.3]} scale={[0.11,0.13,0.04]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#d3d9ab"/></mesh>
      <mesh position={[side*0.18,0.04,0.34]} scale={[0.03,0.09,0.02]}><sphereGeometry args={[1,12,12]}/><meshStandardMaterial color="#202f28"/></mesh>
      <mesh position={[side*0.1,-0.15,0.31]} scale={[0.14,0.1,0.07]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#7a817c"/></mesh>
      {[-1,0,1].map(i=><mesh key={i} position={[side*0.34,-0.13+i*0.06,0.33]} rotation={[0,0,side*i*0.15]}><boxGeometry args={[0.26,0.012,0.012]}/><meshStandardMaterial color="#d4d3c7"/></mesh>)}
    </group>)}
    <mesh position={[0,-0.1,0.39]} scale={[0.06,0.04,0.03]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#b8797b"/></mesh>
  </Canvas></div>
}
