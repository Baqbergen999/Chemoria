import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Beaker, FlaskConical, Play, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Recipe {
  r1: string;
  r2: string;
  product: string;
  mechanism: string;
  type: string;
}

const REACTIONS: Recipe[] = [
  { r1: 'Этен', r2: 'Br2', product: '1,2-Дибромэтан', mechanism: 'Галогендеу (Электрофильді қосылу)', type: 'success' },
  { r1: 'Этен', r2: 'H2O / H2SO4', product: 'Этанол', mechanism: 'Қышқыл катализдейтін гидратация', type: 'success' },
  { r1: 'Бензол', r2: 'Br2 / FeBr3', product: 'Бромбензол', mechanism: 'Электрофильді ароматты орын басу', type: 'success' },
  { r1: 'Бензол', r2: 'Br2', product: 'Реакция жүрмейді', mechanism: 'Бензолға Льюис қышқылы катализаторы қажет', type: 'error' },
  { r1: 'Циклогексен', r2: 'H2O / H2SO4', product: 'Циклогексанол', mechanism: 'Қышқыл катализдейтін гидратация', type: 'success' },
  { r1: 'Метан', r2: 'Br2', product: 'Бромметан', mechanism: 'Еркін радикалды галогендеу (Жарық/Жылу қажет)', type: 'success' }
];

const AVAILABLE_REACTANTS = ['Этен', 'Бензол', 'Циклогексен', 'Метан', 'Br2', 'Br2 / FeBr3', 'H2O / H2SO4'];

function MoleculeNode({ label, position, color, isProduct }: any) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={isProduct ? 2 : 0.5} floatIntensity={1}>
      <group ref={meshRef} position={position}>
        <mesh>
          <sphereGeometry args={[isProduct ? 1.5 : 1, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.8}
            emissive={new THREE.Color(color).multiplyScalar(0.2)}
          />
        </mesh>
        <Text
          position={[0, isProduct ? 2 : 1.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export default function MolecularReality() {
  const [flask, setFlask] = useState<string[]>([]);
  const [reactionResult, setReactionResult] = useState<{result: string, type: 'success'|'error', msg: string} | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  const addReactant = (r: string) => {
    if (flask.length < 2 && !reactionResult && !isReacting) {
      setFlask([...flask, r]);
    }
  };

  const clearFlask = () => {
    setFlask([]);
    setReactionResult(null);
    setIsReacting(false);
  };

  const runReaction = () => {
    if (flask.length !== 2) return;
    
    setIsReacting(true);
    
    // Simulate reaction time and animation block
    setTimeout(() => {
      let matched = false;
      for(let r of REACTIONS) {
        if ((r.r1 === flask[0] && r.r2 === flask[1]) || (r.r1 === flask[1] && r.r2 === flask[0])) {
          setReactionResult({ result: r.product, type: r.type as 'success'|'error', msg: r.mechanism });
          if (r.type === 'success') {
            confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
         setReactionResult({ result: 'Реакция жоқ', type: 'error', msg: 'Бұл қосылыстар стандартты жағдайда әрекеттеспейді.' });
      }
      setIsReacting(false);
    }, 2000); // 2 second animation
  };

  return (
    <div className="absolute inset-0 z-50 bg-black overflow-hidden flex flex-col touch-none">
      {/* HUD Layer */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex-1 mr-4">
           <h1 className="text-xl sm:text-3xl font-bold neon-text text-[var(--color-brand-500)] flex items-center gap-2 sm:gap-3">
             <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
             <span className="truncate">Реакция Симуляторы</span>
           </h1>
           <p className="hidden sm:block text-neutral-400 mt-2 font-mono text-sm max-w-md">
             Екі затты араластырыңыз. Органикалық химия ережелеріне сүйеніп нәтижені болжаңыз. Реакция жағдайларына назар аударыңыз!
           </p>
        </div>
        <div className="pointer-events-auto shrink-0">
          <button 
             onClick={() => window.history.back()}
             className="bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full backdrop-blur transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      {/* Main Overlay */}
      <div className="absolute top-16 sm:top-32 left-0 sm:left-6 z-20 pointer-events-auto w-full sm:w-64 px-4 sm:px-0">
         <h2 className="hidden sm:block text-white font-bold mb-4 uppercase tracking-widest text-xs opacity-50">Қолжетімді Реагенттер</h2>
         <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:h-[50vh] pr-2 pb-2 sm:pb-0 custom-scrollbar hide-scrollbar-on-mobile">
           {AVAILABLE_REACTANTS.map(r => (
             <button 
                key={r}
                onClick={() => addReactant(r)}
                disabled={flask.length >= 2 || reactionResult !== null || isReacting}
                className="shrink-0 whitespace-nowrap bg-white/5 hover:bg-white/10 text-center sm:text-left px-3 sm:px-4 py-2 sm:py-3 border border-white/10 rounded-lg text-xs sm:text-sm text-slate-300 transition-colors disabled:opacity-30"
             >
               {r}
             </button>
           ))}
         </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-2xl px-2 sm:px-4 flex flex-col justify-end">
        <div className="glass-panel p-3 sm:p-6 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-6">
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 w-full">
             <div className="flex-1 bg-black/40 h-12 sm:h-16 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs sm:text-sm text-center px-1 sm:px-2 overflow-hidden text-ellipsis whitespace-nowrap">
               {flask[0] || <span className="opacity-30 text-[10px] sm:text-sm">Реагент 1</span>}
             </div>
             <span className="font-bold text-lg sm:text-xl shrink-0">+</span>
             <div className="flex-1 bg-black/40 h-12 sm:h-16 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs sm:text-sm text-center px-1 sm:px-2 overflow-hidden text-ellipsis whitespace-nowrap">
               {flask[1] || <span className="opacity-30 text-[10px] sm:text-sm">Реагент 2</span>}
             </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2 md:mt-0">
             <button 
               onClick={runReaction} 
               disabled={flask.length !== 2 || isReacting || reactionResult !== null}
               className="flex-1 md:flex-none justify-center bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs sm:text-sm"
             >
               <Play className={`h-4 w-4 sm:h-5 sm:w-5 ${isReacting ? 'animate-pulse' : ''}`} /> {isReacting ? 'Жүруде...' : 'Реакция'}
             </button>
             <button onClick={clearFlask} className="p-3 sm:p-4 shrink-0 text-white hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
               <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
             </button>
          </div>
        </div>
        
        {reactionResult && (
          <div className={`mt-2 sm:mt-4 p-3 sm:p-4 border rounded-xl flex items-start gap-3 sm:gap-4 backdrop-blur-md overflow-y-auto max-h-[30vh] sm:max-h-[40vh] ${reactionResult.type === 'success' ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
            {reactionResult.type === 'success' ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mt-0.5 sm:mt-1 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mt-0.5 sm:mt-1 flex-shrink-0" />}
            <div>
               <h3 className="font-bold text-sm sm:text-lg text-white mb-1">
                 {reactionResult.type === 'success' ? 'Реакция Сәтті!' : 'Реакция Сәтсіз'}
               </h3>
               <p className="text-slate-300 font-mono text-xs sm:text-sm mb-1 sm:mb-2">{reactionResult.type === 'success' ? `Өнім: ${reactionResult.result}` : reactionResult.msg}</p>
               {reactionResult.type === 'success' && <p className="text-xs sm:text-sm text-[var(--color-brand-400)]">{reactionResult.msg}</p>}
            </div>
          </div>
        )}
      </div>

      {/* 3D Scene */}
      <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black">
        <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#00f0ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0055" />
          <Environment preset="night" />
          
          {!reactionResult && !isReacting && flask[0] && (
            <MoleculeNode label={flask[0]} position={[-3, 0, 0]} color="#14b8a6" isProduct={false} />
          )}
          {!reactionResult && !isReacting && flask[1] && (
            <MoleculeNode label={flask[1]} position={[3, 0, 0]} color="#f43f5e" isProduct={false} />
          )}
          
          {isReacting && (
             // Merging animation
             <>
                <MoleculeNode label="" position={[0, 0, 0]} color="#eab308" isProduct={true} />
             </>
          )}

          {reactionResult && (
            <MoleculeNode 
              label={reactionResult.result} 
              position={[0, 0, 0]} 
              color={reactionResult.type === 'success' ? '#22c55e' : '#64748b'} 
              isProduct={true} 
            />
          )}

          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2} // Restrict camera from going underground
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>
    </div>
  );
}
