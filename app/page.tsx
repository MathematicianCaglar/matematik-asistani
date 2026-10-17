"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Msg = { role: "user" | "assistant"; content: string };

// GÖREVLER: Metinleri kendi ispat görevlerinle değiştirebilirsin.
const TASKS = [
  { id: "G1", title: "Görev 1", text: "İki tek sayının toplamı her zaman çift midir? Cevabını gerekçesiyle açıkla." },
  { id: "G2", title: "Görev 2", text: "Ardışık üç doğal sayının toplamı her zaman 3'ün katı mıdır? Gerekçeni yaz." },
  { id: "G3", title: "Görev 3", text: "Bir çift sayı ile bir tek sayının toplamı tek midir, çift midir? Her zaman böyle mi olur? Açıkla." },
];

export default function Home() {
  const [codeInput, setCodeInput] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const task = TASKS.find((t) => t.id === taskId) ?? TASKS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function login() {
    const c = codeInput.trim().toUpperCase();
    if (c.length < 2 || c.length > 10) return;
    setStudentCode(c);
  }

  function changeTask(id: string) {
    setTaskId(id);
    setMessages([]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode, taskId, messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || data.error || "Bir hata oluştu." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Bağlantı hatası, tekrar dene." }]);
    }
    setLoading(false);
  }

  // GİRİŞ EKRANI
  if (!studentCode) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">İspat Asistanı</h1>
          <p className="text-gray-600 text-center">Öğretmeninin sana verdiği kodu yaz.</p>
          <input
            className="w-full border rounded p-3 text-center text-lg"
            placeholder="Örnek: Ö01"
            maxLength={10}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button onClick={login} className="w-full bg-black text-white py-3 rounded font-semibold">
            Başla
          </button>
          <p className="text-xs text-gray-500 text-center">
            Adını, soyadını veya okulunu yazma. Sadece kodunu yaz.
          </p>
        </div>
      </div>
    );
  }

  // GÖREV VE SOHBET EKRANI
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-bold">İspat Asistanı</h1>
          <span className="text-sm text-gray-600">Kod: {studentCode}</span>
        </header>

        <div className="flex gap-2">
          {TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTask(t.id)}
              className={`flex-1 py-2 rounded border font-semibold ${taskId === t.id ? "bg-black text-white" : "bg-white"}`}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-yellow-50 border">
          <p className="font-semibold mb-1">{task.title}</p>
          <p>{task.text}</p>
        </div>

        <div className="space-y-3 min-h-[200px]">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-blue-50 ml-10" : "bg-gray-100 mr-10"}`}>
              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          ))}
          {loading && <p className="text-gray-500">Düşünüyor...</p>}
          <div ref={bottomRef} />
        </div>

        <div className="space-y-2">
          <textarea
            className="w-full border rounded p-3"
            rows={3}
            maxLength={1000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Düşünceni ve gerekçeni buraya yaz..."
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-full bg-black text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            Gönder
          </button>
          <p className="text-xs text-gray-500 text-center">
            Adını, okulunu veya kişisel bilgilerini yazma.
          </p>
        </div>
      </main>
    </div>
  );
}
