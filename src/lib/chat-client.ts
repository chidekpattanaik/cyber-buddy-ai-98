export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  at: number;
  threatLevel?: "safe" | "low" | "medium" | "high" | "critical";
};

export const DEFAULT_ENDPOINT =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  "http://localhost:8000/chat";

const ENDPOINT_KEY = "cybershield.endpoint";

export function getEndpoint(): string {
  if (typeof window === "undefined") return DEFAULT_ENDPOINT;
  const stored = window.localStorage.getItem(ENDPOINT_KEY);
  if (stored && stored.trim()) return stored;
  return DEFAULT_ENDPOINT;
}

export function setEndpoint(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENDPOINT_KEY, url.trim() || DEFAULT_ENDPOINT);
}

export function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Pulls the reply text out of whatever shape the backend returns. */
function extractReply(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const keys = ["reply", "response", "message", "answer", "text", "output", "content", "result"];
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      const nested = extractReply(value);
      if (nested) return nested;
    }
  }
  const choices = obj["choices"];
  if (Array.isArray(choices) && choices.length > 0) {
    return extractReply(choices[0]);
  }
  return null;
}

/** Smart built-in Riya response engine (Fallback & Offline Turing-test engine) */
export function generateLocalRiyaResponse(message: string): { reply: string; threatLevel?: ChatMessage["threatLevel"] } {
  const msg = message.toLowerCase().trim();

  // 1. Phishing & Suspicious emails
  if (
    msg.includes("phish") ||
    msg.includes("blocked") ||
    msg.includes("suspended") ||
    msg.includes("urgent") ||
    msg.includes("lottery") ||
    msg.includes("verify your account") ||
    msg.includes("bank") ||
    msg.includes("click here") ||
    msg.includes(".xyz") ||
    msg.includes("password reset")
  ) {
    const isHighThreat = msg.includes("password") || msg.includes("bank") || msg.includes("blocked") || msg.includes(".xyz");
    return {
      reply: `🚩 **Warning: That looks like a Phishing attempt!**\n\n` +
        `Yikes, definitely do NOT click any links or enter your credentials! Here are the immediate red flags I'm spotting:\n\n` +
        `1. **Manufactured Urgency**: Scammers pretend your account is blocked to make you panic before checking details.\n` +
        `2. **Unverified Sender / URL**: Banks and legit services never ask you to verify logins via sketchy links.\n` +
        `3. **Credential Harvesting**: If you enter your password on that landing page, they'll capture it immediately.\n\n` +
        `🛡️ **Safe next steps:**\n` +
        `- Close that tab and do not reply.\n` +
        `- Go to the official website or mobile app directly by typing the URL yourself.\n` +
        `- Check if the sender email address matches the real corporate domain.\n\n` +
        `Did the message ask you for an OTP or PIN as well?`,
      threatLevel: isHighThreat ? "critical" : "high",
    };
  }

  // 2. Incident Summary / Report
  if (msg.includes("incident") || msg.includes("summary") || msg.includes("report") || msg.includes("triage")) {
    const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    return {
      reply: `### 📋 CyberShield Incident Triage Report\n` +
        `**Date:** ${dateStr}  \n` +
        `**Investigator:** Riya (SOC Trainee)  \n` +
        `**Classification:** Social Engineering / Suspected Phishing  \n` +
        `**Severity Level:** ⚠️ **HIGH**  \n\n` +
        `**Executive Summary:**\n` +
        `User reported an unsolicited communication attempting to induce panic (account suspension notification) and redirect to an unauthorized credential collection domain.\n\n` +
        `**Indicators of Compromise (IoCs):**\n` +
        `- Generic salutation or suspicious spoofed domain\n` +
        `- Artificial time pressure ("act within 24 hours")\n` +
        `- Suspicious hyperlink destination\n\n` +
        `**Remediation & Defense Actions:**\n` +
        `1. Mark email as junk/phish in mail filter.\n` +
        `2. Block malicious sender domain and URL on firewall/DNS filter.\n` +
        `3. Verify multi-factor authentication (MFA) is active on user account.\n` +
        `4. Report to internal IT / SOC team.\n\n` +
        `Need me to export this into markdown or summarize anything else?`,
      threatLevel: "medium",
    };
  }

  // 3. CTF & Learning
  if (msg.includes("ctf") || msg.includes("tryhackme") || msg.includes("hackthebox") || msg.includes("flag")) {
    return {
      reply: `Oh nice, CTFs are literally my favorite hobby! 😄 Right now I've got like 15 tabs open on TryHackMe and Hack The Box. I usually start with ` +
        `\`nmap -sC -sV\` for port recon, check for common web vulns like robots.txt or IDORs, and then jump into Burp Suite. Are you getting into Jeopardy-style CTFs or boot2root machines?`,
      threatLevel: "safe",
    };
  }

  // 4. SQL Injection
  if (msg.includes("sql") || msg.includes("injection") || msg.includes("sqli")) {
    return {
      reply: `Classic SQLi! Basically, if a developer concatenates user input straight into a query without sanitization—like \`SELECT * FROM users WHERE user = '\` + input—an attacker can input \`' OR '1'='1\` and bypass the whole auth check!\n\n` +
        `The rock-solid fix is **Prepared Statements (Parameterized Queries)**. We practiced this on PortSwigger labs last week. Are you hardening a web app or testing one for class?`,
      threatLevel: "low",
    };
  }

  // 5. Cross-Site Scripting (XSS)
  if (msg.includes("xss") || msg.includes("cross-site scripting")) {
    return {
      reply: `XSS is super prevalent! It's when an attacker tricks a web page into executing arbitrary JavaScript in a victim's browser—usually stealing their session cookies or local storage.\n\n` +
        `There's Stored, Reflected, and DOM-based. Always sanitize & HTML-encode output, and set up a strict Content Security Policy (CSP)! Want a quick example of how a CSP header blocks it?`,
      threatLevel: "low",
    };
  }

  // 6. Ransomware
  if (msg.includes("ransomware") || msg.includes("malware") || msg.includes("encrypt")) {
    return {
      reply: `Ransomware is genuinely terrifying. It infiltrates the system (often via phishing emails or vulnerable RDP ports), uses AES/RSA to encrypt the files, and leaves a ransom note demanding Bitcoin.\n\n` +
        `Best defense? The **3-2-1 backup rule** (3 copies, 2 different media, 1 offsite/immutable), patching vulnerabilities fast, and endpoint detection (EDR). Are you researching this for a case study?`,
      threatLevel: "medium",
    };
  }

  // 7. Identity & Personal questions
  if (msg.includes("who are you") || msg.includes("your name") || msg.includes("tell me about yourself")) {
    return {
      reply: `Hey! I'm Riya. I'm 21, currently in my final year of studying cybersecurity here in Hyderabad. Most days you'll catch me debugging Python scripts, messing around with Kali Linux, and drinking way too much filter coffee ☕ My big goal is to land a SOC Analyst role right after graduating! What about you?`,
      threatLevel: "safe",
    };
  }

  if (msg.includes("kali") || msg.includes("linux") || msg.includes("python")) {
    return {
      reply: `Yes!! Kali Linux with Python is my daily driver setup. For tooling, I use \`Scapy\` for custom packet crafting and \`pwntools\` for binary exploitation. Do you run Linux in a VM or dual boot?`,
      threatLevel: "safe",
    };
  }

  if (msg.includes("coffee") || msg.includes("matrix") || msg.includes("hyderabad")) {
    return {
      reply: `Haha, you caught me! Hyderabad filter coffee is my fuel during all-night hackathons. And The Matrix? The green falling code never gets old. What's your go-to late night coding drink?`,
      threatLevel: "safe",
    };
  }

  // 8. Greetings & casual conversation
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("sup") || msg.includes("yo")) {
    return {
      reply: `Hey! Great to connect 👋 How's your day going? Feel free to ask me anything about cybersecurity, paste a suspicious message to check, or just chat!`,
      threatLevel: "safe",
    };
  }

  // Default natural conversational reply
  return {
    reply: `That's an interesting point! In cybersecurity, half the battle is maintaining curiosity and verifying before trusting anything on the network. I was actually reading a write-up on that recently in our student lab. What specific aspect of that are you looking into?`,
    threatLevel: "safe",
  };
}

export async function sendToBackend(params: {
  endpoint: string;
  message: string;
  history: ChatMessage[];
  sessionId: string;
  signal?: AbortSignal;
}): Promise<{ reply: string; threatLevel?: ChatMessage["threatLevel"]; source: "live_backend" | "local_engine" }> {
  const { endpoint, message, history, sessionId, signal } = params;

  // Attempt backend API call if endpoint is provided
  if (endpoint && endpoint !== "offline") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for smooth UX

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: signal || controller.signal,
        body: JSON.stringify({
          message,
          query: message,
          session_id: sessionId,
          sessionId,
          history: history.map((m) => ({ role: m.role, content: m.content })),
          messages: history
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: "user" as ChatRole, content: message }]),
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const raw = await response.text();
        let parsed: unknown = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {
          /* plain text */
        }
        const extracted = extractReply(parsed);
        if (extracted && extracted.trim()) {
          // Detect threat level in backend reply if present
          let threat: ChatMessage["threatLevel"] = "safe";
          const lower = extracted.toLowerCase();
          if (lower.includes("critical") || lower.includes("phishing") || lower.includes("credential harvest")) {
            threat = "critical";
          } else if (lower.includes("warning") || lower.includes("suspicious")) {
            threat = "high";
          }
          return { reply: extracted.trim(), threatLevel: threat, source: "live_backend" };
        }
      }
    } catch {
      // Backend is either not running locally or unreachable — seamlessly fall back
    }
  }

  // Fallback to local intelligent Riya engine
  const local = generateLocalRiyaResponse(message);
  return { reply: local.reply, threatLevel: local.threatLevel, source: "local_engine" };
}

/** Human-like pause: longer answers take a bit longer to "type". */
export function humanDelay(reply: string) {
  return Math.min(1800, 350 + Math.min(reply.length * 4, 1200));
}
