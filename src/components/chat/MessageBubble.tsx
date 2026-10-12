import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Volume2, VolumeX, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/chat-client";
import { cn } from "@/lib/utils";
import { speakText, stopSpeaking, isSpeaking, loadVoiceSettings } from "@/lib/voice";

function time(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Avatar() {
  return (
    <div className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 font-mono text-sm font-bold text-primary shadow-[0_0_15px_-3px_oklch(0.85_0.14_165/0.3)]">
      R
      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-background" />
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const toggleSpeak = () => {
    if (speaking || isSpeaking()) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      const settings = loadVoiceSettings();
      setSpeaking(true);
      speakText(message.content, settings, () => setSpeaking(false));
    }
  };

  return (
    <div className={cn("group flex w-full gap-3", isUser && "justify-end")}>
      {!isUser && <Avatar />}

      <div className={cn("flex max-w-[85%] md:max-w-[78%] flex-col gap-1.5", isUser && "items-end")}>
        {/* Threat Level Badge if present */}
        {message.threatLevel && message.threatLevel !== "safe" && (
          <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium border bg-destructive/15 text-destructive border-destructive/30 animate-pulse">
            <ShieldAlert className="size-3.5" />
            <span>
              {message.threatLevel === "critical"
                ? "CRITICAL THREAT DETECTED"
                : "SUSPICIOUS CONTENT FLAGGED"}
            </span>
          </div>
        )}

        <div
          className={cn(
            "relative animate-msg-in rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-md",
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground font-medium selection:bg-background selection:text-foreground"
              : "rounded-bl-sm border border-border/80 bg-surface/90 text-surface-foreground backdrop-blur-md hover:border-primary/40",
          )}
        >
          <div className="space-y-3 font-sans [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-primary [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-background/80 [&_pre]:p-3.5 [&_strong]:font-semibold [&_strong]:text-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Action Bar for Assistant Messages */}
          {!isUser && (
            <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-border/40 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                onClick={toggleSpeak}
                title={speaking ? "Stop reading" : "Read aloud (Afreen/Riya voice)"}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                {speaking ? (
                  <>
                    <VolumeX className="size-3 text-destructive animate-pulse" />
                    <span className="text-[10px]">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3" />
                    <span className="text-[10px]">Listen</span>
                  </>
                )}
              </button>

              <button
                onClick={copyContent}
                title="Copy message"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
                <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer timestamp & status */}
        <div className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{time(message.at)}</span>
          {isUser && <span>· seen ✓✓</span>}
        </div>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex w-full gap-3 animate-msg-in">
      <Avatar />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border/80 bg-surface/90 px-4 py-3.5 backdrop-blur-md">
          <span className="text-xs font-mono text-muted-foreground mr-1">Riya is typing</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-primary"
                style={{ animation: `dot-bounce 1.2s ${i * 0.15}s infinite ease-in-out` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
