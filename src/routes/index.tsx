import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, FileText, ShieldCheck, Trash2, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble, TypingBubble } from "@/components/chat/MessageBubble";
import { EndpointDialog } from "@/components/chat/EndpointDialog";
import {
  DEFAULT_ENDPOINT,
  getEndpoint,
  humanDelay,
  newId,
  sendToBackend,
  setEndpoint as persistEndpoint,
  type ChatMessage,
} from "@/lib/chat-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberShield AI — Chat with Riya, your security buddy" },
      {
        name: "description",
        content:
          "CyberShield AI: chat with Riya, a cybersecurity student who spots phishing, explains attacks in plain English and sums up your incident.",
      },
      { property: "og:title", content: "CyberShield AI — Chat with Riya" },
      {
        property: "og:description",
        content:
          "Phishing analysis, attack explainers and incident summaries in a human-feeling chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey! I'm **Riya** 👋 final-year cybersec student, currently running on too much coffee.\n\nGot a sketchy email, a weird link, or just a question about how some attack works? Paste it here and we'll pick it apart together.",
  at: Date.now(),
};

const SUGGESTIONS = [
  "I got an email saying my bank account is blocked.",
  "Is this link safe? bank-login-security.xyz",
  "Explain ransomware like I'm 12",
  "How do I make my passwords actually strong?",
];

const SUMMARY_PROMPT =
  "Can you wrap this up with a short incident summary — what happened, the risk level, and the next steps I should take?";

function Index() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [endpoint, setEndpointState] = useState(DEFAULT_ENDPOINT);
  const [online, setOnline] = useState<"unknown" | "ok" | "down">("unknown");
  const sessionId = useRef(newId());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEndpointState(getEndpoint());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content: trimmed,
      at: Date.now(),
    };
    const history = messages.filter((m) => m.id !== "greeting");
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const reply = await sendToBackend({
        endpoint,
        message: trimmed,
        history,
        sessionId: sessionId.current,
      });
      await new Promise((resolve) => setTimeout(resolve, humanDelay(reply)));
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: reply, at: Date.now() },
      ]);
      setOnline("ok");
    } catch (error) {
      setOnline("down");
      toast.error("Couldn't reach the backend", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex h-screen w-full max-w-3xl flex-col px-4 pb-6">
      <Toaster />

      <header className="sticky top-0 z-10 -mx-4 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="glow-ring flex size-11 items-center justify-center rounded-xl bg-hero-glow text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-glow font-mono text-lg font-bold tracking-tight">CyberShield AI</h1>
            <p className="truncate text-xs text-muted-foreground">
              Riya · cybersecurity student, Hyderabad ·{" "}
              <span className={online === "down" ? "text-destructive" : "text-accent"}>
                {online === "down" ? "backend unreachable" : "online"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-mono text-xs"
              onClick={() => {
                setMessages([{ ...GREETING, at: Date.now() }]);
                sessionId.current = newId();
              }}
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <EndpointDialog
              endpoint={endpoint}
              onSave={(value) => {
                persistEndpoint(value);
                setEndpointState(getEndpoint());
                setOnline("unknown");
                toast.success("Endpoint saved");
              }}
            />
          </div>
        </div>
      </header>

      <section className="scrollbar-cyber flex-1 space-y-5 overflow-y-auto py-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {busy && <TypingBubble />}
        <div ref={bottomRef} />
      </section>

      <div className="sticky bottom-0 -mx-4 space-y-3 bg-background/85 px-4 pb-2 pt-3 backdrop-blur-md">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => send(suggestion)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-2 focus-within:border-primary/50 focus-within:shadow-[0_0_28px_-14px_var(--ring)]">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            placeholder="Paste a suspicious email, link or ask anything security…"
            rows={2}
            className="min-h-[52px] resize-none border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy || messages.length <= 1}
              onClick={() => send(SUMMARY_PROMPT)}
              className="gap-2 font-mono text-xs text-muted-foreground"
            >
              <FileText className="size-3.5" />
              Incident summary
            </Button>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
                <Wifi className="size-3" />
                {endpoint}
              </span>
              <Button
                size="icon"
                disabled={busy || !input.trim()}
                onClick={() => send(input)}
                className="size-9 rounded-xl"
                aria-label="Send message"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center font-mono text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </main>
  );
}
