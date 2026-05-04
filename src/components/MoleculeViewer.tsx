import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

const atomColors: Record<string, string> = {
  C: '#666666', // Carbon (grey)
  H: '#ffffff', // Hydrogen (white)
  O: '#ff0000', // Oxygen (red)
  N: '#0000ff', // Nitrogen (blue)
  Cl: '#00ff00', // Chlorine (green)
};

const atomSizes: Record<string, number> = {
  C: 0.77,
  H: 0.37,
  O: 0.73,
  N: 0.75,
  Cl: 0.99,
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

// Some mock models
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
  },
  'Ethene': {
    atoms: [
      { id: 'c1', element: 'C', position: [0, 0, 0.67] },
      { id: 'c2', element: 'C', position: [0, 0, -0.67] },
      { id: 'h1', element: 'H', position: [0, 0.92, 1.23] },
      { id: 'h2', element: 'H', position: [0, -0.92, 1.23] },
      { id: 'h3', element: 'H', position: [0, 0.92, -1.23] },
      { id: 'h4', element: 'H', position: [0, -0.92, -1.23] },
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'c2', order: 2 },
      { id: 'b2', from: 'c1', to: 'h1', order: 1 },
      { id: 'b3', from: 'c1', to: 'h2', order: 1 },
      { id: 'b4', from: 'c2', to: 'h3', order: 1 },
      { id: 'b5', from: 'c2', to: 'h4', order: 1 },
    ]
  }
};

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

export default function MoleculeViewer({ model = MOCK_MOLECULES['Methane'], mode = 'ball-stick', showLabels = false }: MoleculeViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Environment preset="city" />
      
      <MoleculeContent model={model} mode={mode} showLabels={showLabels} />
      
      <OrbitControls makeDefault autoRotate autoRotateSpeed={1} enablePan={false} minDistance={3} maxDistance={20} />
    </Canvas>
  );
}
