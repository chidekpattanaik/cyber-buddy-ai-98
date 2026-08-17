export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  at: number;
};

export const DEFAULT_ENDPOINT = "/api/chat";
const ENDPOINT_KEY = "cybershield.endpoint";

export function getEndpoint(): string {
  if (typeof window === "undefined") return DEFAULT_ENDPOINT;
  return window.localStorage.getItem(ENDPOINT_KEY) || DEFAULT_ENDPOINT;
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

export async function sendToBackend(params: {
  endpoint: string;
  message: string;
  history: ChatMessage[];
  sessionId: string;
  signal?: AbortSignal;
}): Promise<string> {
  const { endpoint, message, history, sessionId, signal } = params;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: signal ?? null,
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

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status} ${response.statusText}`);
  }

  const raw = await response.text();
  let parsed: unknown = raw;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* plain text reply */
  }

  const reply = extractReply(parsed);
  if (!reply) throw new Error("Could not find a reply field in the backend response.");
  return reply.trim();
}

/** Human-like pause: longer answers take a bit longer to "type". */
export function humanDelay(reply: string) {
  return Math.min(2200, 450 + reply.length * 9);
}
