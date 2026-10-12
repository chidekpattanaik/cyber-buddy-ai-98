import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Hexagon,
  MapPin,
  SendHorizonal,
  Target,
  Terminal,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Coffee,
  Code2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble, TypingBubble } from "@/components/chat/MessageBubble";
import { EndpointDialog } from "@/components/chat/EndpointDialog";
import { VoiceSettingsDialog } from "@/components/chat/VoiceSettingsDialog";
import { PhishingModal } from "@/components/chat/PhishingModal";
import { IncidentReportModal } from "@/components/chat/IncidentReportModal";
import {
  DEFAULT_ENDPOINT,
  getEndpoint,
  humanDelay,
  newId,
  sendToBackend,
  setEndpoint as persistEndpoint,
  type ChatMessage,
} from "@/lib/chat-client";
import { soundEffects } from "@/lib/audio-effects";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  loadVoiceSettings,
  speakText,
} from "@/lib/voice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberShield AI — Chat with Riya, your cybersecurity buddy" },
      {
        name: "description",
        content:
          "CyberShield AI: chat with Riya, a cybersecurity student from Hyderabad who spots phishing, explains attacks, and triage incidents.",
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
    "Hey! I'm Riya. I'm currently surviving final-year cybersec life in Hyderabad with coffee, Python, and a slightly unhealthy number of CTF tabs 😅 What are you working on?",
  at: Date.now(),
  threatLevel: "safe",
};

const SUGGESTIONS = [
  "Explain phishing",
  "Check suspicious email",
  "What is SQL Injection?",
  "Explain XSS attacks",
  "CTF recon tips",
  "Generate incident report",
];

const FACTS = [
  { icon: MapPin, label: "Hyderabad, India" },
  { icon: Terminal, label: "Python & Kali Linux" },
  { icon: Target, label: "SOC Analyst Aspirant" },
  { icon: Coffee, label: "Filter Coffee + CTFs" },
];

function Index() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [endpoint, setEndpointState] = useState(DEFAULT_ENDPOINT);
  const [online, setOnline] = useState<"unknown" | "ok" | "offline_engine">("unknown");
  const [listening, setListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sessionId = useRef(newId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    setEndpointState(getEndpoint());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Voice speech recognition setup
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    recognizerRef.current = createSpeechRecognizer(
      (transcript) => {
        setInput(transcript);
        setListening(false);
        toast.info(`Voice captured: "${transcript.slice(0, 40)}..."`);
      },
      (err) => {
        setListening(false);
        console.warn("Speech recognition error:", err);
      },
      () => {
        setListening(false);
      }
    );

    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleMic = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.warning("Speech recognition is not supported in this browser.");
      return;
    }
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
    } else {
      try {
        recognizerRef.current?.start();
        setListening(true);
        toast.info("Listening... speak your cybersecurity question");
      } catch (e) {
        console.warn(e);
        setListening(false);
      }
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
    toast.info(next ? "Sound effects enabled" : "Sound effects muted");
  };

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

    if (soundEnabled) soundEffects.playSend();

    try {
      const result = await sendToBackend({
        endpoint,
        message: trimmed,
        history,
        sessionId: sessionId.current,
      });

      await new Promise((resolve) => setTimeout(resolve, humanDelay(result.reply)));

      const assistantMessage: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: result.reply,
        at: Date.now(),
        threatLevel: result.threatLevel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setOnline(result.source === "live_backend" ? "ok" : "offline_engine");

      // Play audio feedback
      if (soundEnabled) {
        if (result.threatLevel === "critical" || result.threatLevel === "high") {
          soundEffects.playAlert();
        } else {
          soundEffects.playReceive();
        }
      }

      // Auto-speak if enabled
      const voiceSettings = loadVoiceSettings();
      if (voiceSettings.autoSpeak) {
        speakText(result.reply, voiceSettings);
      }
    } catch (error) {
      toast.error("Error communicating with Riya", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-stretch p-3 md:p-6 lg:p-8">
      <Toaster />

      <div className="grid w-full overflow-hidden rounded-3xl border border-border/80 bg-surface/30 shadow-[0_30px_90px_-40px_oklch(0_0_0/0.95)] backdrop-blur-xl md:grid-cols-[310px_1fr]">
        {/* Profile panel */}
        <aside className="flex flex-col gap-6 border-b border-border/70 bg-background/80 p-6 md:border-b-0 md:border-r md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Hexagon className="size-4" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em]">
                CyberShield AI
              </span>
            </div>

            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
            >
              {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative inline-block">
              <div className="glow-ring flex size-22 items-center justify-center rounded-2xl bg-hero-glow text-3xl font-bold text-primary-foreground shadow-lg border border-primary/40">
                R
              </div>
              <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background bg-primary animate-pulse" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  online === "ok"
                    ? "bg-primary"
                    : online === "offline_engine"
                    ? "bg-primary/80"
                    : "bg-warning"
                }`}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {online === "ok"
                  ? "FastAPI · Gemini Online"
                  : online === "offline_engine"
                  ? "Local AI Engine · Ready"
                  : "Riya Active"}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">Riya</h1>
              <p className="mt-1 text-sm font-medium text-primary">
                Final-Year Cybersecurity Student
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Surviving final semester on filter coffee, Wireshark packet captures, Kali Linux tools, and CTFs.
            </p>
          </div>

          {/* Quick tool buttons */}
          <div className="space-y-2 border-t border-border/70 pt-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Security Toolbox
            </span>
            <div className="grid grid-cols-2 gap-2">
              <PhishingModal onAnalyze={send} />
              <IncidentReportModal
                messages={messages}
                onRequestSummary={() => send("Please generate a full incident triage report for our conversation.")}
              />
            </div>
          </div>

          <ul className="space-y-2.5 border-t border-border/70 pt-5">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Icon className="size-3.5 text-primary/80 shrink-0" />
                <span className="font-mono">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3 border-t border-border/70 pt-5">
            <div className="flex items-center gap-2">
              <VoiceSettingsDialog />
              <EndpointDialog
                endpoint={endpoint}
                onSave={(value) => {
                  persistEndpoint(value);
                  setEndpointState(getEndpoint());
                  setOnline("unknown");
                  toast.success("Endpoint updated");
                }}
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-surface/30 p-2.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                MASQUERADE &apos;26 · The Turing Test
              </p>
              <p className="font-mono text-[10px] text-primary/80 mt-0.5">
                Team CODE NEXUS
              </p>
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        <section className="flex min-h-[75vh] flex-col p-4 md:p-6 lg:p-8">
          <header className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Secure Conversation
                  </span>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
                    End-to-End Triage
                  </span>
                </div>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight">Talk to Riya</h2>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full font-mono text-xs border-border/80 hover:border-primary/50"
              onClick={() => {
                setMessages([{ ...GREETING, at: Date.now() }]);
                sessionId.current = newId();
                toast.success("Chat history cleared");
              }}
            >
              Clear chat
            </Button>
          </header>

          <div className="scrollbar-cyber flex-1 space-y-4 overflow-y-auto py-5 px-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {busy && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          <div className="space-y-3 pt-2">
            {/* Quick Action Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  disabled={busy}
                  className="rounded-full border border-border/80 bg-surface/60 px-3 py-1 text-xs font-mono text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground hover:bg-surface active:scale-95 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/80 bg-surface/80 p-2 pl-3 shadow-inner focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask Riya anything, paste a suspicious link/email, or press the mic…"
                rows={1}
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent p-0 py-3 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />

              <div className="flex items-center gap-1.5 pb-0.5">
                {/* Microphone Voice Input */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleMic}
                  className={`size-10 rounded-xl transition-all ${
                    listening
                      ? "bg-destructive text-destructive-foreground animate-pulse shadow-[0_0_15px_-3px_oklch(0.64_0.19_25)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                  title={listening ? "Listening... click to stop" : "Voice input (Microphone)"}
                >
                  {listening ? <Mic className="size-4" /> : <Mic className="size-4" />}
                </Button>

                {/* Send Button */}
                <Button
                  disabled={busy || !input.trim()}
                  onClick={() => send(input)}
                  className="h-10 gap-2 rounded-xl px-4 font-mono text-xs shadow-md"
                >
                  <span>Send</span>
                  <SendHorizonal className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-muted-foreground">
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-primary" /> Powered by CyberShield AI & Gemini
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
