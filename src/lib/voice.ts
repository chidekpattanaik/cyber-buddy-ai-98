// Web Speech API wrapper for Riya's voice and mic input

export interface VoiceSettings {
  autoSpeak: boolean;
  voiceName: string;
  rate: number;
  pitch: number;
}

const STORAGE_KEY = "cybershield.voice_settings";

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") {
    return { autoSpeak: false, voiceName: "", rate: 1.0, pitch: 1.0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { autoSpeak: false, voiceName: "", rate: 1.0, pitch: 1.0 };
}

export function saveVoiceSettings(settings: VoiceSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "Code snippet omitted.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_#~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[•-]/g, "")
    .trim();
}

export function speakText(text: string, settings: VoiceSettings, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = settings.rate || 1.0;
  utterance.pitch = settings.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (settings.voiceName) {
    const matched = voices.find((v) => v.name === settings.voiceName);
    if (matched) utterance.voice = matched;
  } else {
    // Look for friendly English female voices
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Zira") ||
          v.name.includes("Google UK English Female") ||
          v.name.includes("Natural") ||
          v.name.includes("Female"))
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError?: (err: unknown) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined") return null;
  const SpeechRec =
    (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

  if (!SpeechRec) return null;

  const recognizer = new SpeechRec();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = "en-US";

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) onResult(transcript);
  };

  if (onError) recognizer.onerror = onError;
  if (onEnd) recognizer.onend = onEnd;

  return recognizer;
}
