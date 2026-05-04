import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Play } from 'lucide-react';
import { useState } from 'react';

const data = [
  { progress: 0, energy: 20 },
  { progress: 10, energy: 25 },
  { progress: 20, energy: 35 },
  { progress: 30, energy: 60 }, // Transition state 1
  { progress: 40, energy: 40 }, // Intermediate
  { progress: 50, energy: 85 }, // Transition state 2
  { progress: 60, energy: 65 },
  { progress: 70, energy: 40 },
  { progress: 80, energy: 20 },
  { progress: 90, energy: 5 },
  { progress: 100, energy: 0 },
];

export default function ReactionSimulation({ color }: { color: string }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulate = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setRunning(false);
          return 100;
        }
        return p + 2;
      });
    }, 50);
  };

  const currentData = data.filter((d) => d.progress <= progress);
  const isEnd = progress >= 100;

  return (
    <div className="glass-panel p-6 mt-8 flex flex-col items-center w-full">
      <div className="w-full flex justify-between items-center mb-6">
         <h3 className="text-2xl font-bold flex items-center gap-2">
           Reaction Energy Profile
         </h3>
         <button 
           onClick={simulate}
           disabled={running}
           className={`glass-button px-4 py-2 flex items-center gap-2 ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
           style={{ color }}
         >
           <Play className="h-4 w-4" /> {running ? 'Simulating...' : isEnd ? 'Restart Simulation' : 'Run Simulation'}
         </button>
      </div>

      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={progress === 0 ? data : currentData}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="progress" hide />
            <YAxis hide domain={[0, 100]} />
            <Area 
              type="monotone" 
              dataKey="energy" 
              stroke={color} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorEnergy)" 
              isAnimationActive={false}
            />
            {isEnd && (
               <ReferenceLine y={data[data.length - 1].energy} stroke="white" strokeDasharray="3 3" label={{ position: 'right', value: 'Products', fill: 'white' }} />
            )}
            {isEnd && (
               <ReferenceLine y={data[0].energy} stroke="white" strokeDasharray="3 3" label={{ position: 'left', value: 'Reactants', fill: 'white' }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Animated timeline indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800 rounded">
           <div 
             className="h-full rounded transition-all" 
             style={{ width: `${progress}%`, backgroundColor: color, transitionDuration: '50ms' }}
           />
        </div>
      </div>
    </div>
  );
}
