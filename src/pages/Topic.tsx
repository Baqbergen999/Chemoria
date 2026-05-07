import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle,
  Eye,
  HelpCircle,
  Layers,
  TestTube,
  Play,
  X as CloseIcon,
  BookOpen,
  Image as ImageIcon,
  Beaker,
  Sigma,
  Lightbulb,
  PenTool,
  BookText,
} from "lucide-react";
import { TOPICS, TOPIC_CONTENT } from "../data/topics";
import { useStore } from "../store/useStore";
import MoleculeViewer, { MOCK_MOLECULES } from "../components/MoleculeViewer";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = TOPICS.find((t) => t.id === id);
  const content = TOPIC_CONTENT[id || ""] || TOPIC_CONTENT["t1"];
  const imageTasks =
    content.imageTasks?.filter(
      (task: any) => task.url && task.url.toString().trim().length > 0,
    ) || [];

  const { progress, updateTopicTime } = useStore();
  const isCompleted = progress[id || ""]?.completed;

  const [viewerMode, setViewerMode] = useState<
    "ball-stick" | "space-fill" | "skeletal"
  >("ball-stick");
  const [showLabels, setShowLabels] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isLectureOpen, setIsLectureOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Time tracking
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      updateTopicTime(id, 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [id, updateTopicTime]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!topic)
    return (
      <div className="p-8 text-center text-red-400">Тақырып табылмады</div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-32">
      <AnimatedBackground />

      {/* Header */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Басты бетке оралу
      </button>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full"
              style={{
                backgroundImage: `linear-gradient(to bottom left, ${topic.color}, transparent)`,
              }}
            />
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: topic.color }}
            >
              {topic.title}
            </h1>
            <p className="text-xl text-neutral-300 mb-6 leading-relaxed">
              {topic.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                {topic.difficulty}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[var(--color-brand-500)] text-sm font-bold bg-[var(--color-brand-500)]/20 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" /> Аяқталды (Нәтиже:{" "}
                  {progress[topic.id]?.bestScore}%)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsLectureOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/10 font-bold transition-colors flex items-center gap-2"
              >
                <BookOpen className="h-5 w-5 text-blue-400" /> Толық Дәрісті Оқу
              </button>

              {topic.documentName && (
                <a
                  href={`/${topic.documentName}`}
                  download={topic.documentName}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 px-6 py-3 rounded-xl border border-blue-500/30 font-bold transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-5 w-5 text-blue-400" /> Дәріс файлы (.docx)
                </a>
              )}
            </div>
          </motion.div>

          {/* Detailed Content Sections */}
          <div className="space-y-6 mt-8">
            {/* Негізгі тақырып (Main Topic) */}
            {(content.mainTopic || content.explanations) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 border-l-2" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookText className="text-[var(--color-brand-500)] h-5 w-5" /> Негізгі тақырып
                </h3>
                {typeof content.mainTopic === "string" && (
                  <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap mb-4 font-medium italic">
                    {content.mainTopic}
                  </p>
                )}
                {(Array.isArray(content.mainTopic)
                  ? content.mainTopic
                  : Array.isArray(content.explanations)
                    ? content.explanations
                    : []
                ).map((item: any, i: number) => (
                  <div key={i} className="mb-4 last:mb-0">
                    {item.title && (
                      <h4 className="text-lg font-semibold mb-2 text-[var(--color-brand-400)]">
                        {item.title}
                      </h4>
                    )}
                    <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Формула жаттау (Formulas) */}
            {content.formulas && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-l-2" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sigma className="text-pink-500 h-5 w-5" /> Формула жаттау
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.formulas.map((item: any, i: number) => (
                    <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                      <h4 className="font-semibold text-white mb-2">{item.name}</h4>
                      <div className="font-mono text-lg text-pink-400 bg-black/50 p-3 rounded-lg text-center mb-3 border border-pink-500/20">{item.formula}</div>
                      <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Реакциялар қалай жүреді (Reactions) */}
            {content.reactions && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 border-l-2" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Beaker className="text-green-500 h-5 w-5" /> Реакциялар қалай жүреді
                </h3>
                <div className="space-y-4">
                  {content.reactions.map((item: any, i: number) => (
                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-green-500/10">
                      <div className="font-mono text-base md:text-lg text-green-400 bg-black/40 p-3 rounded-lg text-center mb-3 overflow-x-auto whitespace-nowrap">{item.equation}</div>
                      <p className="text-neutral-300 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Маңызды білу керек зат (Important Notes) */}
            {content.importantNotes && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 border-l-2 bg-yellow-500/5" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500 h-5 w-5" /> Маңызды білу керек зат
                </h3>
                <ul className="space-y-3">
                  {content.importantNotes.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-300 leading-relaxed">
                      <div className="min-w-[6px] h-[6px] rounded-full bg-yellow-500 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Есептер шығарып үйрену (Practice Problems) */}
            {content.practiceProblems && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 border-l-2" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PenTool className="text-blue-500 h-5 w-5" /> Есептер шығарып үйрену
                </h3>
                <div className="space-y-6">
                  {content.practiceProblems.map((item: any, i: number) => (
                    <div key={i} className="bg-blue-500/5 p-5 rounded-xl border border-blue-500/10">
                      <h4 className="font-bold text-white mb-3">Есеп {i + 1}: {item.question}</h4>
                      <div className="bg-black/40 p-4 rounded-lg space-y-2 relative mt-4">
                        <div className="text-xs font-mono text-blue-400 absolute top-2 right-3">Шешуі</div>
                        <div className="pt-2">
                          {item.steps.map((step: string, j: number) => (
                            <p key={j} className="text-neutral-400 text-sm mb-2 leading-relaxed">{j + 1}. {step}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Links and Tasks */}
            {content.links && content.links.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6 border-l-2 bg-[var(--color-brand-500)]/5" style={{ borderLeftColor: topic.color }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-[var(--color-brand-500)]" /> Қосымша сабақтар мен Тапсырмалар
                </h3>
                <div className="flex flex-col gap-3">
                  {content.links.map((link: any, i: number) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                      <div className="h-8 w-8 rounded-full bg-[var(--color-brand-500)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 text-[var(--color-brand-500)] ml-0.5" />
                      </div>
                      <span className="text-blue-300 group-hover:text-blue-200 transition-colors font-medium whitespace-pre-wrap">{link.title}</span>
                    </a>
                  ))}
                </div>
                {imageTasks.length > 0 && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-white"><ImageIcon className="h-5 w-5 text-[var(--color-brand-500)]" /> Тапсырмалар</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {imageTasks.map((task: any, i: number) => (
                        <div key={i} className="group overflow-hidden rounded-lg border border-white/10 bg-black/20 cursor-pointer" onClick={() => setSelectedImage(task.url)}>
                          <img src={task.url.startsWith('http') ? task.url : (task.url.startsWith('/') ? task.url : `/${task.url}`)} alt={task.title || "Тапсырма"} className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                          {task.title && <div className="bg-black/60 backdrop-blur-sm p-3 text-sm text-center text-white/90">{task.title}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 3D Viewer Area */}
        <div className="lg:flex-1 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-1 min-h-[280px] sm:min-h-[340px] lg:h-full relative"
          >
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-neutral-800 flex flex-col gap-2">
              <button
                onClick={() => setViewerMode("ball-stick")}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === "ball-stick" ? "bg-[var(--color-brand-500)] text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
              >
                Шар-стерженьді
              </button>
              <button
                onClick={() => setViewerMode("space-fill")}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === "space-fill" ? "bg-[var(--color-brand-500)] text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
              >
                Кеңістікті толтыру
              </button>
              <button
                onClick={() => setViewerMode("skeletal")}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === "skeletal" ? "bg-[var(--color-brand-500)] text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
              >
                Қаңқалы
              </button>
              <div className="h-px bg-neutral-700 w-full my-1" />
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`text-xs px-3 py-1 rounded flex items-center justify-between gap-2 transition-colors ${showLabels ? "text-white" : "text-neutral-500"}`}
              >
                <Eye className="h-3 w-3" /> Белгілер
              </button>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-black/50 backdrop-blur text-white text-xs font-mono px-3 py-1 rounded border border-neutral-800 flex items-center gap-2">
                <TestTube className="h-3 w-3" style={{ color: topic.color }} />{" "}
                {topic.moleculeFormula}
              </div>
            </div>

            <div className="w-full h-full rounded-xl overflow-hidden cursor-move">
              <MoleculeViewer
                formula={topic.moleculeFormula}
                model={
                  MOCK_MOLECULES[topic.moleculeFormula] ||
                  MOCK_MOLECULES["Methane"]
                }
                mode={viewerMode}
                showLabels={showLabels}
              />
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/50 backdrop-blur text-neutral-400 text-xs px-3 py-1 rounded-full border border-neutral-800">
                Бұру үшін сүйреңіз • Масштабтау үшін айналдырыңыз
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Curiosity Questions */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="text-[var(--color-accent-500)] h-6 w-6" />{" "}
          Тереңірек Зерттеу
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.curiosity?.map((q: any, i: number) => (
            <motion.div
              key={i}
              className="glass-panel p-6 cursor-pointer hover:border-neutral-600 transition-colors"
              onClick={() => setActiveQuestion(activeQuestion === i ? null : i)}
            >
              <h3 className="font-bold text-lg mb-2 flex items-start justify-between">
                {q.q}
                <span className="text-[var(--color-brand-500)] text-sm ml-4 font-mono">
                  {activeQuestion === i ? "- Жасыру" : "+ Ашу"}
                </span>
              </h3>
              <AnimatePresence>
                {activeQuestion === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[var(--color-brand-600)] mt-4 pt-4 border-t border-neutral-800 leading-relaxed font-medium">
                      {q.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Reading Link Section - Main Page */}
      {content.fullReadingLink && (
        <div className="mt-16 mb-8">
          <div className="glass-panel p-8 bg-gradient-to-r from-[var(--color-brand-500)]/10 to-transparent border-2 border-[var(--color-brand-500)]/30">
            <a
              href={content.fullReadingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-6 rounded-xl bg-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]/30 hover:bg-[var(--color-brand-500)]/30 hover:border-[var(--color-brand-500)]/50 transition-all hover:scale-105"
            >
              <BookOpen className="h-16 w-16 text-[var(--color-brand-500)] mb-4 group-hover:scale-110 transition-transform" />
              <div className="mb-2">
                <p className="text-xs text-neutral-400 uppercase tracking-wide">
                  Толық оқу материалы
                </p>
                <p className="text-white font-bold text-xl group-hover:text-[var(--color-brand-400)] transition-colors">
                  {topic.title} - Терең зерттеу
                </p>
              </div>
              <div className="text-neutral-300 text-sm mb-4 flex gap-1">
                <span className="font-bold">"{content.fullReadingLink.pages}"</span> бет • Толық теориялық материал
                • Практикалық мысалдар
              </div>
              <div className="flex items-center gap-2 text-[var(--color-brand-500)] font-semibold">
                <span>Оқуға кіру</span>
                <Play className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      )}

      <div className="mt-16 flex justify-center">
        <button
          onClick={() => navigate(`/test/${topic.id}`)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]`}
        >
          <Play className="h-6 w-6" /> Тестті Бастау
        </button>
      </div>

      {/* Lecture Modal */}
      <AnimatePresence>
        {isLectureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button
                onClick={() => setIsLectureOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md"
              >
                <CloseIcon className="h-6 w-6" />
              </button>

              <div className="p-8 pb-4 border-b border-neutral-800">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                  <BookOpen className="text-blue-400" />
                  {topic.title} - Толық Дәріс
                </h2>
              </div>

              <div className="overflow-y-auto p-4 sm:p-8 space-y-12 custom-scrollbar">
                {content.explanations?.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row gap-8 items-start"
                  >
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-bold text-[var(--color-brand-400)]">
                        {exp.title}
                      </h3>
                      <p className="text-neutral-300 text-lg leading-relaxed">
                        {exp.content}
                      </p>
                    </div>
                    {exp.image && (
                      <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-neutral-700">
                        <img
                          src={exp.image}
                          alt={exp.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {content.links && content.links.length > 0 && (
                  <div className="pt-8 mt-8 border-t border-neutral-800">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                      <Play className="h-6 w-6 text-[var(--color-brand-500)]" />{" "}
                      Видео Сабақтар
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {content.links.map((link: any, i: number) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-black/40 hover:bg-black/60 border border-neutral-800 hover:border-neutral-600 p-4 rounded-xl flex items-center gap-4 transition-all"
                        >
                          <div className="h-12 w-12 rounded-full bg-[var(--color-brand-500)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Play className="h-5 w-5 text-[var(--color-brand-500)] ml-1" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 mb-1">
                              Сілтеме ашу
                            </p>
                            <span className="text-blue-300 group-hover:text-blue-200 transition-colors font-medium whitespace-pre-wrap">
                              {link.title}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {imageTasks.length > 0 && (
                  <div className="pt-8 mt-8 border-t border-neutral-800">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                      <ImageIcon className="h-6 w-6 text-[var(--color-brand-500)]" />{" "}
                      Тапсырмалар (Фото)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imageTasks.map((task: any, i: number) => (
                        <div
                          key={i}
                          className="group rounded-xl overflow-hidden border border-neutral-800 bg-black/40 relative cursor-pointer"
                          onClick={() => setSelectedImage(task.url)}
                        >
                          <img
                            src={task.url.startsWith('http') ? task.url : (task.url.startsWith('/') ? task.url : `/${task.url}`)}
                            alt={task.title || "Тапсырма"}
                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                          {task.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-3 text-sm text-neutral-200">
                              {task.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
              <img
                src={
                  selectedImage.startsWith("http")
                    ? selectedImage
                    : (selectedImage.startsWith("/") ? selectedImage : `/${selectedImage}`)
                }
                alt="Үлкейтілген сурет"
                className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
