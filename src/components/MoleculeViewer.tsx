import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

const atomColors: Record<string, string> = {
  C: '#666666', // Carbon (grey)
  H: '#ffffff', // Hydrogen (white)
  O: '#ff0000', // Oxygen (red)
  N: '#0000ff', // Nitrogen (blue)
  Cl: '#00ff00', // Chlorine (green)
  S: '#ffff00', // Sulfur (yellow)
  P: '#ffa500', // Phosphorus (orange)
};

const atomSizes: Record<string, number> = {
  C: 0.77,
  H: 0.37,
  O: 0.73,
  N: 0.75,
  Cl: 0.99,
  S: 1.02,
  P: 1.06,
};

export interface AtomData {
  id: string;
  element: string;
  position: [number, number, number];
}

export interface BondData {
  id: string;
  from: string;
  to: string;
  order: number;
}

export interface MoleculeModel {
  atoms: AtomData[];
  bonds: BondData[];
}

export const MOCK_MOLECULES: Record<string, MoleculeModel> = {
  'Methane': {
    atoms: [
      { id: 'a1', element: 'C', position: [0, 0, 0] },
      { id: 'a2', element: 'H', position: [1.09, 1.09, 1.09] },
      { id: 'a3', element: 'H', position: [-1.09, -1.09, 1.09] },
      { id: 'a4', element: 'H', position: [1.09, -1.09, -1.09] },
      { id: 'a5', element: 'H', position: [-1.09, 1.09, -1.09] },
    ],
    bonds: [
      { id: 'b1', from: 'a1', to: 'a2', order: 1 },
      { id: 'b2', from: 'a1', to: 'a3', order: 1 },
      { id: 'b3', from: 'a1', to: 'a4', order: 1 },
      { id: 'b4', from: 'a1', to: 'a5', order: 1 },
    ]
  }
};

function parseSdf(sdfText: string): MoleculeModel {
  const lines = sdfText.split('\n');
  if (lines.length < 4) return { atoms: [], bonds: [] };
  
  const countsLine = lines[3];
  const numAtoms = parseInt(countsLine.substring(0, 3).trim(), 10) || 0;
  const numBonds = parseInt(countsLine.substring(3, 6).trim(), 10) || 0;
  
  const atoms: AtomData[] = [];
  const bonds: BondData[] = [];
  
  let currentLine = 4;
  for (let i = 0; i < numAtoms; i++) {
    const line = lines[currentLine++];
    if (!line) continue;
    const x = parseFloat(line.substring(0, 10).trim() || "0");
    const y = parseFloat(line.substring(10, 20).trim() || "0");
    const z = parseFloat(line.substring(20, 30).trim() || "0");
    const element = line.substring(31, 34).trim() || "C";
    atoms.push({ id: `a${i + 1}`, element, position: [x, y, z] });
  }
  
  for (let i = 0; i < numBonds; i++) {
    const line = lines[currentLine++];
    if (!line) continue;
    const fromIdx = parseInt(line.substring(0, 3).trim(), 10);
    const toIdx = parseInt(line.substring(3, 6).trim(), 10);
    const order = parseInt(line.substring(6, 9).trim(), 10);
    bonds.push({
      id: `b${i + 1}`,
      from: `a${fromIdx}`,
      to: `a${toIdx}`,
      order: order || 1
    });
  }
  
  return { atoms, bonds };
}

function Bond({ start, end, order, mode }: { start: THREE.Vector3, end: THREE.Vector3, order: number, mode: 'ball-stick' | 'space-fill' | 'skeletal' }) {
  if (mode === 'space-fill') return null; // No bonds in space fill
  
  const distance = start.distanceTo(end);
  const position = start.clone().lerp(end, 0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());

  const radius = mode === 'skeletal' ? 0.1 : 0.15;
  const separation = 0.2;

  return (
    <group position={position} quaternion={quaternion}>
      {Array.from({ length: order }).map((_, i) => {
        const offset = order === 1 ? 0 : (i - (order - 1) / 2) * separation;
        return (
          <Cylinder key={i} args={[radius, radius, distance, 16]} position={[offset, 0, 0]}>
            <meshStandardMaterial color="#999999" roughness={0.3} metalness={0.5} />
          </Cylinder>
        );
      })}
    </group>
  );
}

function Atom({ atom, mode, showLabels }: { atom: AtomData, mode: 'ball-stick' | 'space-fill' | 'skeletal', showLabels: boolean }) {
  if (mode === 'skeletal' && atom.element !== 'C') {
     // Usually skeletal shows heteroatoms, we will just show them with different color but maybe small
  }

  const baseScale = atomSizes[atom.element] || 0.7;
  const scale = mode === 'space-fill' ? baseScale * 1.5 : (mode === 'skeletal' ? (atom.element === 'C' ? 0.1 : 0.3) : baseScale * 0.5);

  return (
    <Sphere args={[scale, 32, 32]} position={atom.position}>
      <meshStandardMaterial color={atomColors[atom.element] || '#ffffff'} roughness={0.4} metalness={0.3} />
      {showLabels && mode !== 'space-fill' && (
        <Html distanceFactor={10} center>
          <div className="text-white text-xs font-bold font-mono px-1 bg-black/50 rounded pointer-events-none">
            {atom.element}
          </div>
        </Html>
      )}
    </Sphere>
  );
}

interface MoleculeViewerProps {
  model?: MoleculeModel;
  formula?: string;
  mode?: 'ball-stick' | 'space-fill' | 'skeletal';
  showLabels?: boolean;
}

function MoleculeContent({ model, mode, showLabels }: { model: MoleculeModel, mode: 'ball-stick' | 'space-fill' | 'skeletal', showLabels: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const getAtomPosition = (id: string) => {
    const atom = model.atoms.find(a => a.id === id);
    return atom ? new THREE.Vector3(...atom.position) : new THREE.Vector3();
  };

  return (
    <group ref={groupRef}>
      {model.atoms.map(atom => (
        <Atom key={atom.id} atom={atom} mode={mode} showLabels={showLabels} />
      ))}
      {model.bonds.map(bond => (
        <Bond 
          key={bond.id} 
          start={getAtomPosition(bond.from)} 
          end={getAtomPosition(bond.to)} 
          order={bond.order} 
          mode={mode} 
        />
      ))}
    </group>
  );
}

export default function MoleculeViewer({ model, formula, mode = 'ball-stick', showLabels = false }: MoleculeViewerProps) {
  const [fetchedModel, setFetchedModel] = useState<MoleculeModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formula) return;
    
    let active = true;
    setLoading(true);
    
    const query = formula.toLowerCase() === 'sucrose' ? 'sucrose' : formula;
    
    fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/record/SDF/?record_type=3d`)
      .then(res => res.text())
      .then(text => {
        if (!active) return;
        if (text.includes('PUGREST.ServerBusy') || text.includes('PUGREST.NotFound') || text.startsWith('{')) {
          console.warn("Pubchem could not return SDF for", formula);
          setFetchedModel(null);
        } else {
          try {
            const m = parseSdf(text);
            setFetchedModel(m);
          } catch(e) {
            console.error("error parsing sdf", e);
            setFetchedModel(null);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("fetch error", err);
        setFetchedModel(null);
        setLoading(false);
      });
      
    return () => { active = false; };
  }, [formula]);
  
  const activeModel = fetchedModel || model || MOCK_MOLECULES['Methane'];

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white font-mono text-sm">
          Молекула жүктелуде...
        </div>
      )}
      <Canvas camera={{ position: [0, 0, Math.max(8, (activeModel.atoms.length * 0.4))] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <MoleculeContent model={activeModel} mode={mode} showLabels={showLabels} />
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1} enablePan={false} minDistance={3} maxDistance={40} />
      </Canvas>
    </div>
  );
}
