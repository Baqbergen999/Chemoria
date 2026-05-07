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
  // Көмірсулар (Carbohydrates)
  { r1: 'C6H12O6 (глюкоза)', r2: 'Ag2O (аммиакты)', product: 'C6H12O7 + 2Ag↓', mechanism: 'Күміс айна реакциясы (Тотығу)', type: 'success' },
  { r1: 'C6H12O6 (глюкоза)', r2: 'Cu(OH)2', product: 'Cu2O↓ + H2O + қышқыл', mechanism: 'Глюкозаның тотығуы (мыс(II) гидроксидімен)', type: 'success' },
  { r1: 'C6H12O6 (глюкоза)', r2: '6O2', product: '6CO2 + 6H2O', mechanism: 'Толық тотығу (жану)', type: 'success' },
  { r1: '(C6H10O5)n (крахмал)', r2: 'I2', product: 'Көк түс', mechanism: 'Крахмалға сапалық реакция', type: 'success' },
  { r1: 'C12H22O11 (сахароза)', r2: 'конц. H2SO4', product: 'Көмір (C) + H2O', mechanism: 'Сахарозаның көмірленуі (сусыздану)', type: 'success' },
  { r1: '(C6H10O5)n (крахмал)', r2: 'H2O + H+', product: 'C6H12O6 (Глюкоза)', mechanism: 'Полисахарид гидролизі', type: 'success' },
  
  // Алициклді және Терпендер (Alicyclic & Terpenes)
  { r1: 'C3H6 (циклопропан)', r2: 'Br2', product: 'C3H6Br2', mechanism: 'Циклдің үзілуі (қосылу)', type: 'success' },
  { r1: 'C10H16 (терпен)', r2: 'KMnO4', product: 'MnO2↓ (қоңыр)', mechanism: 'Қанықпаған байланыстардың тотығуы', type: 'success' },
  
  // Арендер (Arenes)
  { r1: 'C6H6 (бензол)', r2: 'O2 (ауада)', product: 'CO2 + H2O + күйе', mechanism: 'Бензолдың жануы', type: 'success' },
  { r1: 'C6H5CH3 (толуол)', r2: 'KMnO4', product: 'C6H5COOK + MnO2↓', mechanism: 'Бүйір тізбектің тотығуы', type: 'success' },
  { r1: 'C6H5Cl (хлорбензол)', r2: 'NaOH (конц.)', product: 'C6H5OH + NaCl', mechanism: 'Нуклеофильді орын басу (жоғары қысымда)', type: 'success' },
  
  // Нитро және Амин (Nitro & Amino)
  { r1: 'C6H5NO2 (нитробензол)', r2: 'Fe + HCl', product: 'C6H5NH2 + FeCl2 + H2O', mechanism: 'Зинин реакциясы (тотықсыздану)', type: 'success' },
  { r1: 'C6H5SO3H', r2: 'NaCl', product: 'C6H5SO3Na + HCl', mechanism: 'Тұз түзілуі', type: 'success' },
  
  // Фенолдар (Phenols)
  { r1: 'C6H5OH (фенол)', r2: 'Br2 (суда)', product: 'C6H2Br3OH↓ (ақ) + HBr', mechanism: 'Фенолды бромдау (сапалық реакция)', type: 'success' },
  { r1: 'C6H5OH (фенол)', r2: 'FeCl3', product: 'Күлгін түс', mechanism: 'Темір(III) хлоридімен кешен түзілуі', type: 'success' },
  { r1: 'C6H5OH (фенол)', r2: 'NaOH', product: 'C6H5ONa + H2O', mechanism: 'Натрий фенолятының түзілуі', type: 'success' },
  
  // Альдегидтер және Қышқылдар (Aldehydes & Acids)
  { r1: 'C6H5CHO (бензальдегид)', r2: 'Ag2O (аммиакты)', product: 'C6H5COOH + 2Ag↓', mechanism: 'Күміс айна реакциясы', type: 'success' },
  { r1: 'C6H5CHO (бензальдегид)', r2: 'Cu(OH)2', product: 'Cu2O↓ (қызыл) + C6H5COOH', mechanism: 'Мыс(II) гидроксидімен тотығу', type: 'success' },
  { r1: 'C6H5COOH', r2: 'NaHCO3', product: 'C6H5COONa + CO2↑ + H2O', mechanism: 'Карбон қышқылының тұз түзілуі', type: 'success' },
  
  // Аминдер (Amines)
  { r1: 'C6H5NH2 (анилин)', r2: 'HCl', product: 'C6H5NH3+Cl-', mechanism: 'Анилиннің тұз түзілуі', type: 'success' },
  { r1: 'C6H5NH2 (анилин)', r2: 'Br2 (суда)', product: 'C6H2Br3NH2↓ (ақ)', mechanism: 'Анилиннің бромдалуы', type: 'success' },
  { r1: 'C6H5NH2 (анилин)', r2: 'CuSO4', product: 'Көк тұнба', mechanism: 'Кешен түзілуі', type: 'success' },
  
  // Диазо және Азоқосылыстар (Diazo & Azocompounds)
  { r1: 'C6H5NH2 (анилин)', r2: 'NaNO2 + HCl (0-5°C)', product: 'C6H5N2+Cl-', mechanism: 'Диазоттау реакциясы', type: 'success' },
  { r1: 'C6H5N2+Cl-', r2: 'C6H5OH (фенол)', product: 'C6H5N=NC6H4OH (қызғылт-сары)', mechanism: 'Азотіркесу реакциясы', type: 'success' },
  { r1: 'C6H5N2+Cl-', r2: 'H2O', product: 'C6H5OH + N2↑ + HCl', mechanism: 'Диазотұзының гидролизі (қыздырғанда)', type: 'success' },
  
  // Көп ядролы (Polynuclear)
  { r1: 'C6H5–CH2–C6H5', r2: 'KMnO4', product: 'C6H5–COOH + C6H5–COOH', mechanism: 'Дифенилметанның тотығуы', type: 'success' },
  { r1: 'C6H5–C6H5', r2: 'конц. H2SO4', product: 'C6H5–C6H4–SO3H + H2O', mechanism: 'Дифенилдің сульфирленуі', type: 'success' },
  { r1: 'C10H8 (нафталин)', r2: 'Br2 (суда)', product: 'C10H7Br + HBr', mechanism: 'Нафталиннің бромдалуы', type: 'success' },
  { r1: 'C10H8 (нафталин)', r2: 'KMnO4', product: 'Қышқылдар қоспасы', mechanism: 'Нафталинның тотығуы', type: 'success' },
  { r1: 'C14H10 (антрацен)', r2: 'малеин ангидриді', product: 'Дилс-Альдер өнімі', mechanism: 'Диендік синтез', type: 'success' },
  
  // Гетероциклдер (Heterocycles)
  { r1: 'C5H5N (пиридин)', r2: 'HCl', product: 'C5H5NH+Cl-', mechanism: 'Пиридиннің тұз түзілуі', type: 'success' },
  { r1: 'C4H4NH (пиррол)', r2: 'FeCl3', product: 'Қара-жасыл түс', mechanism: 'Пирролдың тотығуы', type: 'success' },
  { r1: 'C4H4S (тиофен)', r2: 'Br2', product: 'C4H3BrS + HBr', mechanism: 'Тиофеннің бромдалуы', type: 'success' },
  { r1: 'C3H4N2 (имидазол)', r2: 'HCl', product: 'C3H4N2·HCl', mechanism: 'Имидазолдың тұз түзілуі', type: 'success' },
  { r1: 'C3H3NS (тиазол)', r2: 'AgNO3', product: 'Кешен', mechanism: 'Күміс иондарымен реакция', type: 'success' },
  { r1: 'C3H4N2 (имидазол)', r2: 'CuSO4', product: 'Көк тұнба', mechanism: 'Мыс иондарымен реакция', type: 'success' },
  { r1: 'C4H4N2 (пиримидин)', r2: 'HCl', product: 'C4H5N2+Cl-', mechanism: 'Пиримидиннің тұз түзілуі', type: 'success' },
  { r1: 'C4H4N2O2 (урацил)', r2: 'NaOH', product: 'Тұз + H2O', mechanism: 'Урацилдің негізбен әрекеттесуі', type: 'success' },
  { r1: 'C4H4N2 (пиримидин)', r2: 'KMnO4', product: 'NO2↑ + CO2', mechanism: 'Жоғары температурада тотығу', type: 'success' },
  
  // Витаминдер (Vitamins)
  { r1: 'C6H8O6 (С витамині)', r2: 'I2', product: 'C6H6O6 + 2HI', mechanism: 'Аскорбин қышқылының йодпен тотығуы', type: 'success' },
  { r1: 'C6H8O6 (С витамині)', r2: 'Ag2O', product: 'C6H6O6 + 2Ag↓', mechanism: 'Витамин С-ның аммиакты күміс ерітіндісімен реакциясы', type: 'success' },
  { r1: 'C20H30O (А витамині)', r2: 'SbCl3', product: 'Көк түс', mechanism: 'Карр-Прайс реакциясы', type: 'success' }
];

const AVAILABLE_REACTANTS = [
  'C6H12O6 (глюкоза)', 'Ag2O (аммиакты)', 'Cu(OH)2', '6O2', '(C6H10O5)n (крахмал)', 'I2', 'C12H22O11 (сахароза)', 'конц. H2SO4', 'H2O + H+', 
  'C3H6 (циклопропан)', 'Br2', 'C10H16 (терпен)', 'KMnO4', 'C6H6 (бензол)', 'O2 (ауада)', 'C6H5CH3 (толуол)', 'C6H5Cl (хлорбензол)', 'NaOH (конц.)', 
  'C6H5NO2 (нитробензол)', 'Fe + HCl', 'C6H5SO3H', 'NaCl', 'C6H5OH (фенол)', 'Br2 (суда)', 'FeCl3', 'NaOH', 'C6H5CHO (бензальдегид)', 'C6H5COOH', 'NaHCO3', 
  'C6H5NH2 (анилин)', 'HCl', 'CuSO4', 'NaNO2 + HCl (0-5°C)', 'C6H5N2+Cl-', 'H2O', 'C6H5–CH2–C6H5', 'C6H5–C6H5', 'C10H8 (нафталин)', 'C14H10 (антрацен)', 
  'малеин ангидриді', 'C5H5N (пиридин)', 'C4H4NH (пиррол)', 'C4H4S (тиофен)', 'C3H4N2 (имидазол)', 'C3H3NS (тиазол)', 'AgNO3', 'C4H4N2 (пиримидин)', 
  'C4H4N2O2 (урацил)', 'C6H8O6 (С витамині)', 'Ag2O', 'C20H30O (А витамині)', 'SbCl3'
];

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReactants = AVAILABLE_REACTANTS.filter(r => 
    r.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
             Екі затты араластырыңыз. Органикалық химия ережелеріне сүйеніп нәтижені болжаңыз.
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
      <div className="absolute top-16 sm:top-28 left-0 sm:left-6 z-20 pointer-events-auto w-full sm:w-72 px-4 sm:px-0">
         <div className="mb-4">
           <h2 className="hidden sm:block text-white font-bold mb-3 uppercase tracking-widest text-[10px] opacity-50">Іздеу</h2>
           <input 
             type="text" 
             placeholder="Реагент іздеу..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--color-brand-500)] transition-colors"
           />
         </div>
         <h2 className="hidden sm:block text-white font-bold mb-3 uppercase tracking-widest text-[10px] opacity-50">Қолжетімді Реагенттер</h2>
         <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:h-[50vh] pr-2 pb-2 sm:pb-0 custom-scrollbar hide-scrollbar-on-mobile transition-all">
           {filteredReactants.map(r => (
             <button 
                key={r}
                onClick={() => addReactant(r)}
                disabled={flask.length >= 2 || reactionResult !== null || isReacting}
                className="shrink-0 whitespace-nowrap bg-white/5 hover:bg-white/10 text-center sm:text-left px-3 sm:px-4 py-2 sm:py-2.5 border border-white/10 rounded-lg text-xs sm:text-xs text-slate-300 transition-colors disabled:opacity-30"
             >
               {r}
             </button>
           ))}
           {filteredReactants.length === 0 && (
             <p className="text-white/30 text-xs mt-2 italic px-2">Ештеңе табылмады</p>
           )}
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
