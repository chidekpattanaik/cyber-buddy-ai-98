import { useState, useEffect } from "react";
import { Mic, Volume2, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadVoiceSettings,
  saveVoiceSettings,
  speakText,
  stopSpeaking,
  type VoiceSettings,
} from "@/lib/voice";
import { toast } from "sonner";

export function VoiceSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
      setAvailableVoices(v);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const handleSave = () => {
    saveVoiceSettings(settings);
    toast.success("Voice settings updated");
    setOpen(false);
  };

  const testVoice = () => {
    stopSpeaking();
    speakText("Hey! I'm Riya. Everything looks secure in the network right now!", settings);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs border-border/80 hover:border-primary/50">
          <Volume2 className="size-3.5 text-primary" />
          <span>Voice FX</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="size-5 text-primary" />
            Riya's Voice Engine
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure real-time voice speech synthesis for a realistic human conversation experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Auto speak switch */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/50 p-3.5">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Auto-Speak Replies</Label>
              <p className="text-xs text-muted-foreground">
                Riya automatically narrates her incoming messages aloud
              </p>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSpeak: checked })}
            />
          </div>

          {/* Voice selection */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Synthesizer Voice
            </Label>
            <Select
              value={settings.voiceName || (availableVoices[0]?.name ?? "")}
              onValueChange={(val) => setSettings({ ...settings, voiceName: val })}
            >
              <SelectTrigger className="font-mono text-xs bg-surface/60 border-border">
                <SelectValue placeholder="Choose voice" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {availableVoices.map((v) => (
                  <SelectItem key={v.name} value={v.name} className="font-mono text-xs">
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speech Rate slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Speech Speed</span>
              <span className="text-primary font-semibold">{settings.rate.toFixed(1)}x</span>
            </div>
            <Slider
              value={[settings.rate]}
              min={0.7}
              max={1.4}
              step={0.1}
              onValueChange={([val]) => setSettings({ ...settings, rate: val })}
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Voice Pitch</span>
              <span className="text-primary font-semibold">{settings.pitch.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.pitch]}
              min={0.7}
              max={1.3}
              step={0.1}
              onValueChange={([val]) => setSettings({ ...settings, pitch: val })}
            />
          </div>

          {/* Test sample button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={testVoice}
              className="w-full gap-2 font-mono text-xs"
            >
              <Play className="size-3.5 fill-current" />
              Test Voice Audio Sample
            </Button>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              stopSpeaking();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} className="gap-1.5">
            <Check className="size-4" />
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
