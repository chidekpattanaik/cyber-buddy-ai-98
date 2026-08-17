import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coffee, Hexagon, MapPin, SendHorizonal, Target, Terminal } from "lucide-react";
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
    "Hey! I'm Riya. I'm currently surviving final-year cybersec life with coffee, Python, and a slightly unhealthy number of CTF tabs 😅 What are you working on?",
  at: Date.now(),
};

const SUGGESTIONS = ["Explain phishing", "Suspicious email", "Start CTFs"];

const FACTS = [
  { icon: MapPin, label: "Hyderabad, India" },
  { icon: Terminal, label: "Python + Kali Linux" },
  { icon: Target, label: "Future SOC analyst" },
];

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-stretch p-4 md:p-8">
      <Toaster />

      <div className="grid w-full overflow-hidden rounded-3xl border border-border/70 bg-surface/40 shadow-[0_30px_80px_-40px_oklch(0_0_0/0.9)] md:grid-cols-[300px_1fr]">
        {/* Profile panel */}
        <aside className="flex flex-col gap-8 border-b border-border/70 bg-background/60 p-8 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 text-primary">
            <Hexagon className="size-4" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em]">
              CyberShield
            </span>
          </div>

          <div className="space-y-4">
            <div className="glow-ring flex size-24 items-center justify-center rounded-full bg-hero-glow text-4xl font-semibold text-primary-foreground">
              R
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${online === "down" ? "bg-destructive" : "bg-primary"}`}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {online === "down" ? "offline" : "online"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Riya</h1>
              <p className="mt-1 text-sm font-medium text-primary">
                Fourth-year cybersecurity student
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mostly found decoding logs, learning CTF stuff, or looking for coffee.
            </p>
          </div>

          <ul className="space-y-3 border-t border-border/70 pt-6">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary/80" />
                <span className="font-mono text-xs">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3 border-t border-border/70 pt-6">
            <EndpointDialog
              endpoint={endpoint}
              onSave={(value) => {
                persistEndpoint(value);
                setEndpointState(getEndpoint());
                setOnline("unknown");
                toast.success("Endpoint saved");
              }}
            />
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
              Masquerade &apos;26
              <br />
              The Turing Test
            </p>
          </div>
        </aside>

        {/* Chat panel */}
        <section className="flex min-h-[70vh] flex-col p-6 md:p-8">
          <header className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Secure chat
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Talk to Riya</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setMessages([{ ...GREETING, at: Date.now() }]);
                sessionId.current = newId();
              }}
            >
              Clear chat
            </Button>
          </header>

          <div className="scrollbar-cyber flex-1 space-y-5 overflow-y-auto py-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {busy && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-border bg-surface p-2 pl-4 focus-within:border-primary/50">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Message Riya…"
                rows={1}
                className="min-h-[44px] resize-none border-0 bg-transparent p-0 py-3 text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                disabled={busy || !input.trim()}
                onClick={() => send(input)}
                className="h-10 gap-2 rounded-xl px-5"
              >
                Send
                <SendHorizonal className="size-4" />
              </Button>
            </div>
            <p className="text-center font-mono text-[10px] text-muted-foreground">
              Press Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
