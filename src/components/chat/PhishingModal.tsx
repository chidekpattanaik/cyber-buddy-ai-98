import { useState } from "react";
import { ShieldAlert, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SAMPLE_PHISH = [
  {
    title: "Fake Banking Lockout",
    content: "URGENT: Your HDFC Bank account has been temporarily suspended due to suspicious activity. Click here within 24 hours to verify your identity or your account will be permanently closed: http://hdfc-security-verify.xyz/login",
  },
  {
    title: "Bogus Lottery Scam",
    content: "Congratulations! Your email address has been selected as the grand winner of $500,000 in the 2026 Global Tech Lottery. Send your full name, phone number, and bank account details to claims@lottery-payout-secure.net to claim.",
  },
  {
    title: "Fake Git/Dev Alert",
    content: "Security Alert: Unusual sign-in attempt from IP 185.220.101.5 on your GitHub account. If this was not you, immediately reset your SSH keys and password at: https://github-verify-token.top/auth",
  },
];

export function PhishingModal({ onAnalyze }: { onAnalyze: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const handleInspect = (textToUse?: string) => {
    const text = textToUse || content;
    if (!text.trim()) return;
    onAnalyze(`Hey Riya, could you analyze this suspicious message for phishing?\n\n"${text.trim()}"`);
    setOpen(false);
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-mono text-xs border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
        >
          <ShieldAlert className="size-3.5" />
          <span>Phish Inspector</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-5" />
            Phishing & Scam Analyzer
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Paste suspicious emails, SMS messages, or URLs for Riya to analyze red flags, threat level, and safe countermeasures.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Preset samples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">
              Try a Quick Real-World Attack Scenario:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PHISH.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => setContent(sample.content)}
                  className="rounded-lg border border-border/80 bg-surface/40 p-2 text-left transition-colors hover:border-primary/50 hover:bg-surface/80"
                >
                  <p className="font-semibold text-xs text-foreground">{sample.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 font-mono">
                    {sample.content}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">
              Suspicious Content Input:
            </span>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste email text, subject line, sender address, or link here..."
              rows={4}
              className="font-mono text-xs bg-surface/60 border-border"
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!content.trim()}
            onClick={() => handleInspect()}
            className="gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <span>Analyze with Riya</span>
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
