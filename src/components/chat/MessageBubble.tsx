import ReactMarkdown from "react-markdown";
import { Shield, User } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-client";
import { cn } from "@/lib/utils";

function time(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full gap-3 animate-msg-in", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border",
          isUser ? "border-border bg-secondary" : "border-primary/40 bg-primary/10 text-primary",
        )}
      >
        {isUser ? <User className="size-4" /> : <Shield className="size-4" />}
      </div>

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <span className="px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {isUser ? "you" : "riya"} · {time(message.at)}
        </span>
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm border-border bg-secondary text-secondary-foreground"
              : "rounded-tl-sm border-primary/25 bg-surface text-surface-foreground shadow-[0_0_24px_-12px_var(--ring)]",
          )}
        >
          <div className="space-y-3 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_strong]:text-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex w-full gap-3 animate-msg-in">
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
        <Shield className="size-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          riya is typing
        </span>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-primary/25 bg-surface px-4 py-4">
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
  );
}
