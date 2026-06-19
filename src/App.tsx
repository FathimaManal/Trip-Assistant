import { forwardRef, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Compass,
  Send,
  Sparkles,
  MapPin,
  Plane,
  RefreshCw,
} from "lucide-react";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

const SUGGESTIONS = [
  { icon: Plane, text: "Plan a 5-day trip to Tokyo on a mid-range budget" },
  { icon: MapPin, text: "Hidden gems in Lisbon for a long weekend" },
  { icon: Sparkles, text: "Romantic honeymoon ideas in the Maldives" },
  { icon: Compass, text: "Backpacking route through Vietnam in 2 weeks" },
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hey, I'm **Wander** — your travel companion. Tell me where you're dreaming of going (or just a vibe), and I'll help you shape it into a real plan. What's the trip?",
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(content: string) {
    if (!content.trim() || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: content.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { reply: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function reset() {
    setMessages([GREETING]);
    setError(null);
    setInput("");
    inputRef.current?.focus();
  }

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="relative min-h-full flex flex-col">
      <div className="aurora" />
      <div className="aurora-extra" />
      <div className="grain" />

      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 blur-md opacity-70" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 grid place-items-center shadow-lg">
              <Compass className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight text-white">
              Wander
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-violet-300/70">
              AI Trip Companion
            </div>
          </div>
        </div>
        <button
          onClick={reset}
          className="hidden sm:flex items-center gap-2 text-sm text-violet-200/80 hover:text-white px-3 py-1.5 rounded-full glass transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New trip
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pb-6 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="text-sm text-rose-300/90 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-4">
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                onClick={() => send(text)}
                className="group text-left text-sm text-violet-100/90 glass rounded-2xl px-4 py-3 hover:bg-white/10 hover:border-white/20 transition flex items-start gap-3"
              >
                <Icon className="w-4 h-4 mt-0.5 text-fuchsia-300 group-hover:text-fuchsia-200" />
                <span>{text}</span>
              </button>
            ))}
          </div>
        )}

        <Composer
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          disabled={loading}
        />
      </main>
    </div>
  );
}

function Message({ role, content }: ChatMessage) {
  const isUser = role === "user";
  return (
    <div className={`msg-in flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-lg shadow-fuchsia-900/30"
            : "max-w-[85%] glass rounded-2xl rounded-bl-md px-4 py-3 text-violet-50/95"
        }
      >
        <div className="markdown text-[15px] leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-in flex justify-start">
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 text-violet-200 flex items-center gap-1.5">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

type ComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
};

const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  ({ value, onChange, onSend, disabled }, ref) => (
    <div className="glass rounded-2xl p-2 flex items-end gap-2 shadow-xl shadow-black/30">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Where to next? (e.g., 4 days in Kyoto, foodie, $1500)"
        className="flex-1 bg-transparent outline-none resize-none px-3 py-2 text-[15px] text-white placeholder:text-violet-300/40 max-h-40"
        style={{ minHeight: 40 }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-900/30 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  ),
);
Composer.displayName = "Composer";
