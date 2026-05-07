import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Type,
  Image as ImageIcon,
  Trash2,
  Plus,
  Save,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { db, auth } from "../firebase";
import { TOPICS } from "../data/topics";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function LectureEditor() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = TOPICS.find((t) => t.id === topicId);

  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingType, setAddingType] = useState<"text" | "image" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  useEffect(() => {
    if (!topicId || !db) return;

    const q = query(
      collection(db, "lectures"),
      where("topicId", "==", topicId),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContent(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "lectures");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [topicId]);

  const handleAddText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!db) {
        alert("Деректер базасымен байланыс жоқ");
        return;
      }
      await addDoc(collection(db, "lectures"), {
        topicId,
        type: "text",
        content: inputValue.trim(),
        createdAt: serverTimestamp(),
        authorId: user?.uid,
      });
      setInputValue("");
      setAddingType(null);
    } catch (err: any) {
      alert("Сақтау кезінде қате кетті: " + (err?.message || "Белгісіз қате"));
      handleFirestoreError(err, OperationType.CREATE, "lectures");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("Сурет көлемі тым үлкен (максимум 800KB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsSubmitting(true);
      try {
        if (!db) {
          alert("Деректер базасымен байланыс жоқ");
          return;
        }
        await addDoc(collection(db, "lectures"), {
          topicId,
          type: "image",
          content: base64,
          createdAt: serverTimestamp(),
          authorId: user?.uid,
        });
        setAddingType(null);
      } catch (err: any) {
        alert(
          "Суретті жүктеу кезінде қате кетті: " +
            (err?.message || "Белгісіз қате"),
        );
        handleFirestoreError(err, OperationType.CREATE, "lectures");
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Бұл блокты жоюды растайсыз ба?")) return;
    try {
      if (!db) {
        alert("Деректер базасымен байланыс жоқ");
        return;
      }
      await deleteDoc(doc(db, "lectures", id));
    } catch (err: any) {
      alert("Өшіру кезінде қате кетті: " + (err?.message || "Белгісіз қате"));
      handleFirestoreError(err, OperationType.DELETE, `lectures/${id}`);
    }
  };

  if (!topic) return <div className="p-8 text-center">Тақырып табылмады</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-md border-b border-white/5 py-4 px-6 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{topic.title}</h1>
              <p className="text-xs text-neutral-400">Интерактивті Дәріс 2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
              Онлайн жинақтау
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Auth Notice */}
        {!user && (
          <div className="mb-8 p-6 glass-panel bg-yellow-500/5 border-yellow-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-yellow-500">Жүйеге кіріңіз</h4>
              <p className="text-sm text-neutral-400">
                Дәріс материалдарын қосу немесе жою үшін авторлану қажет.
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors"
            >
              Google арқылы кіру
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-8 mb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm">Жүктелуде...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-panel p-12 border-dashed">
              <FileText className="h-12 w-12 text-neutral-700 mb-4" />
              <h3 className="text-xl font-bold mb-2">Дәріс бос</h3>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                Төмендегі батырмалар арқылы бірінші мәтінді немесе суретті
                қосыңыз. Сіздің өзгерістеріңіз барлық пайдаланушыларға көрінеді.
              </p>
            </div>
          ) : (
            content.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="glass-panel p-6 overflow-hidden">
                  {item.type === "text" ? (
                    <p className="text-lg leading-relaxed text-neutral-200 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-white/5">
                      <img
                        src={item.content}
                        alt="Lecture"
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-xl transition-all shadow-lg backdrop-blur-sm z-10"
                      title="Өшіру"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Inline Add Buttons (after each block) */}
                {user && index === content.length - 1 && !addingType && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center gap-4 mt-8"
                  >
                    <button
                      onClick={() => setAddingType("text")}
                      className="flex items-center gap-2 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition-all border border-white/5"
                    >
                      <Plus className="h-4 w-4" /> Келесі мәтін
                    </button>
                    <button
                      onClick={() => setAddingType("image")}
                      className="flex items-center gap-2 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition-all border border-white/5"
                    >
                      <ImageIcon className="h-4 w-4" /> Келесі сурет
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Add Section */}
        {user && (
          <div className="flex flex-col items-center gap-6 pb-12">
            <AnimatePresence mode="wait">
              {!addingType ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={() => setAddingType("text")}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors shadow-xl"
                  >
                    <Type className="h-5 w-5" /> Мәтін қосу
                  </button>
                  <button
                    onClick={() => setAddingType("image")}
                    className="flex items-center gap-2 bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-700 transition-colors border border-white/10"
                  >
                    <ImageIcon className="h-5 w-5" /> Сурет қосу
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full max-w-2xl bg-neutral-900 p-6 rounded-2xl border border-blue-500/30 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-blue-400">
                      {addingType === "text" ? (
                        <Type className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                      {addingType === "text" ? "Жаңа мәтін" : "Сурет таңдау"}
                    </h3>
                    <button
                      onClick={() => setAddingType(null)}
                      className="p-1 hover:bg-white/10 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {addingType === "text" ? (
                    <form onSubmit={handleAddText} className="space-y-4">
                      <textarea
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Дәріс мәтінін осында енгізіңіз..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 min-h-[150px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddText();
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setAddingType(null)}
                          className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                        >
                          Болдырмау
                        </button>
                        <button
                          disabled={!inputValue.trim() || isSubmitting}
                          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Сақтау (Enter)
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center gap-6 py-8">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-blue-500/50 cursor-pointer transition-all"
                      >
                        <ImageIcon className="h-12 w-12 text-neutral-700" />
                        <div className="text-center">
                          <p className="text-neutral-400">
                            Суретті таңдау үшін басыңыз
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            PNG, JPG немесе WEBP (Макс: 800KB)
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() => setAddingType(null)}
                        className="text-neutral-400 hover:text-white"
                      >
                        Болдырмау
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
