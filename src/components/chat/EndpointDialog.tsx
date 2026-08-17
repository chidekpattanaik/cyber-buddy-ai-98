import { useState } from "react";
import { Settings2 } from "lucide-react";
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

export function EndpointDialog({
  endpoint,
  onSave,
}: {
  endpoint: string;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(endpoint);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(endpoint);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
          <Settings2 className="size-3.5" />
          Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backend endpoint</DialogTitle>
          <DialogDescription>
            The chat UI POSTs JSON to this URL and reads the reply from common fields (reply,
            response, message, text, choices…).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="endpoint-url" className="font-mono text-xs uppercase tracking-widest">
            URL
          </Label>
          <Input
            id="endpoint-url"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://your-backend.onrender.com/chat"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Request body includes: message, history, messages, session_id.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave(value);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
