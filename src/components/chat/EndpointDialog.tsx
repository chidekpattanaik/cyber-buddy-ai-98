import { useState } from "react";
import { Settings2, Activity, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function EndpointDialog({
  endpoint,
  onSave,
}: {
  endpoint: string;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(endpoint);
  const [testing, setTesting] = useState(false);
  const [pingResult, setPingResult] = useState<"ok" | "err" | null>(null);

  const testEndpoint = async () => {
    setTesting(true);
    setPingResult(null);

    if (value === "offline" || !value.trim()) {
      setTimeout(() => {
        setTesting(false);
        setPingResult("ok");
        toast.success("Offline Engine is active & ready!");
      }, 400);
      return;
    }

    try {
      // Try health check GET or POST
      const origin = value.replace(/\/chat|\/api\/chat/, "");
      const res = await fetch(origin || value, { method: "GET" }).catch(() => null);
      if (res && res.ok) {
        setPingResult("ok");
        toast.success("Backend is online and reachable!");
      } else {
        // Try posting test payload
        const postRes = await fetch(value, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "ping", session_id: "test" }),
        });
        if (postRes.ok) {
          setPingResult("ok");
          toast.success("Endpoint responded successfully!");
        } else {
          setPingResult("err");
          toast.warning(`Backend responded with status ${postRes.status}`);
        }
      }
    } catch {
      setPingResult("err");
      toast.error("Could not connect to backend server. Make sure uvicorn is running or use local engine.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValue(endpoint);
          setPingResult(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs border-border/80 hover:border-primary/50">
          <Settings2 className="size-3.5" />
          <span>Endpoint</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-primary" />
            Backend API Configuration
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure the endpoint for MASQUERADE '26 evaluation or local FastAPI server.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Quick Presets
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs font-mono"
                onClick={() => setValue("http://localhost:8000/chat")}
              >
                Local FastAPI (:8000)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs font-mono"
                onClick={() => setValue("offline")}
              >
                <Sparkles className="size-3.5 text-primary mr-1" />
                Local Engine (100% Up)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint-url" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Target Endpoint URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="endpoint-url"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setPingResult(null);
                }}
                placeholder="http://localhost:8000/chat or https://api.../chat"
                className="font-mono text-xs bg-surface/60 border-border"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={testEndpoint}
                disabled={testing}
                className="shrink-0 font-mono text-xs gap-1"
              >
                <Activity className="size-3.5" />
                {testing ? "Testing..." : "Ping"}
              </Button>
            </div>

            {pingResult === "ok" && (
              <p className="flex items-center gap-1.5 text-xs text-success font-mono">
                <CheckCircle2 className="size-3.5" /> Endpoint is live and responding
              </p>
            )}
            {pingResult === "err" && (
              <p className="flex items-center gap-1.5 text-xs text-destructive font-mono">
                <XCircle className="size-3.5" /> Offline or unreachable (fallback will be used)
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border/70 bg-surface/40 p-3 text-xs space-y-1 font-mono text-muted-foreground">
            <p className="text-foreground font-semibold">MASQUERADE '26 Spec Compatibility:</p>
            <p>• Method: POST</p>
            <p>• Request JSON: {"{ session_id, message, history }"}</p>
            <p>• Response JSON: {"{ session_id, reply / response }"}</p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onSave(value);
              setOpen(false);
            }}
          >
            Save Endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
