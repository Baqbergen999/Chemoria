import { useStore } from '../store/useStore';
import AnimatedBackground from '../components/AnimatedBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Activity, Zap, Clock } from 'lucide-react';
import { TOPICS } from '../data/topics';
import { useMemo } from 'react';

export default function Analytics() {
  const { progress, testHistory } = useStore();

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const percentage = Math.round((completedCount / TOPICS.length) * 100) || 0;

  // Calculate real accuracy
  const totalQuestionsAnswered = testHistory.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const totalCorrectAnswers = testHistory.reduce((acc, curr) => acc + curr.score, 0);
  const accuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;

  // Chart Data: group test history by day
  const chartData = useMemo(() => {
    if (testHistory.length === 0) return [{ day: 'Тест жоқ', score: 0 }];
    
    // Get last 7 days of tests
    const recentTests = testHistory.slice(-15);
    return recentTests.map((t, i) => {
      const d = new Date(t.date);
      return {
        day: `${d.getMonth()+1}/${d.getDate()} (Тест ${i+1})`,
        score: Math.round((t.score / t.totalQuestions) * 100)
      };
    });
  }, [testHistory]);

  // Find weak topics (completed but low score)
  const weakTopics = Object.values(progress)
    .filter(p => p.bestScore <= 75 && p.bestScore > 0)
    .sort((a, b) => a.bestScore - b.bestScore);
    
  // Time spent
  const totalTimeSeconds = Object.values(progress).reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <AnimatedBackground />

      <h1 className="text-3xl font-bold mb-8">Прогресс және <span className="text-[var(--color-brand-500)]">Аналитика</span></h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
               <Target className="h-6 w-6" />
             </div>
             <span className="text-xs text-neutral-400 font-mono">АЯҚТАЛУЫ</span>
          </div>
          <h2 className="text-4xl font-bold">{percentage}%</h2>
          <p className="text-neutral-400 mt-2">{TOPICS.length} тақырыптың {completedCount}</p>
        </div>

        <div className="glass-panel p-6">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-[var(--color-accent-500)]/20 p-3 rounded-lg text-[var(--color-accent-400)]">
               <Clock className="h-6 w-6" />
             </div>
             <span className="text-xs text-neutral-400 font-mono">ОҚУ УАҚЫТЫ</span>
          </div>
          <h2 className="text-4xl font-bold">{Math.floor(totalTimeSeconds / 60)}м</h2>
          <p className="text-neutral-400 mt-2">Белсенді оқу</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-green-500/20 p-3 rounded-lg text-green-400">
               <Activity className="h-6 w-6" />
             </div>
             <span className="text-xs text-neutral-400 font-mono">ДӘЛДІК</span>
          </div>
          <h2 className="text-4xl font-bold">{accuracy}%</h2>
          <p className="text-neutral-400 mt-2">{totalQuestionsAnswered} сұрақтан {totalCorrectAnswers} дұрыс</p>
        </div>

        <div className="glass-panel p-6">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-orange-500/20 p-3 rounded-lg text-orange-400">
               <Zap className="h-6 w-6" />
             </div>
             <span className="text-xs text-neutral-400 font-mono">ТЕСТТЕР</span>
          </div>
          <h2 className="text-4xl font-bold">{testHistory.length}</h2>
          <p className="text-neutral-400 mt-2">Тапсырылған</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-6">Оқу Қисығы (Тест ұпайлары)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f0ff' }}
                  formatter={(val) => val !== undefined ? [`${val}%`, 'Ұпай'] : ['', 'Ұпай']}
                />
                <Line type="monotone" dataKey="score" stroke="var(--color-brand-500)" strokeWidth={3} dot={{ fill: "var(--color-brand-500)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-6">Жасанды Интеллект Ұсыныстары</h3>
          <div className="space-y-4">
            {weakTopics.length > 0 ? (
              weakTopics.map(p => {
                const topic = TOPICS.find(t => t.id === p.topicId);
                return (
                  <div key={p.topicId} className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 border-l-4 border-l-yellow-500">
                    <h4 className="font-bold text-white mb-1">Қайталаңыз: {topic?.title}</h4>
                    <p className="text-sm text-neutral-400">Ең жоғары ұпайыңыз небәрі {p.bestScore}%. Біліміңізді жақсарту үшін тестті қайта тапсырыңыз.</p>
                  </div>
                )
              })
            ) : (
                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 border-l-4 border-l-[var(--color-brand-500)]">
                  <h4 className="font-bold text-white mb-1">Керемет Прогресс!</h4>
                  <p className="text-sm text-neutral-400">Әзірге әлсіз тақырыптар табылған жоқ. Профиліңізді дамыту үшін тесттер тапсырып, оқуды жалғастырыңыз.</p>
                </div>
            )}
            
            {accuracy > 85 && (
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 border-l-4 border-l-green-500">
                <h4 className="font-bold text-white mb-1">Жоғары Дәлдік</h4>
                <p className="text-sm text-neutral-400">Сіздің жаһандық дәлдігіңіз {accuracy}%. Өзіңізді сынау үшін жаһандық аралас тестті көріңіз!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
