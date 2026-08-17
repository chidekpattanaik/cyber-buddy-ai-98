import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/chat-client";
import { cn } from "@/lib/utils";

function time(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Avatar() {
  return (
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-semibold text-primary">
      R
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full gap-3", isUser && "justify-end")}>
      {!isUser && <Avatar />}
      <div className={cn("flex max-w-[78%] flex-col gap-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "animate-msg-in rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border/70 bg-surface text-surface-foreground",
          )}
        >
          <div className="space-y-3 [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        <span className="px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {isUser ? `${time(message.at)} · seen` : time(message.at)}
        </span>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex w-full gap-3">
      <Avatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/70 bg-surface px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-primary"
            style={{ animation: `dot-bounce 1.2s ${i * 0.15}s infinite ease-in-out` }}
          />
        ))}
      </div>
    </div>
  );
}
