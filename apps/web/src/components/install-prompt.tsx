"use client";

import { Button, GhostButton, Panel } from "@/components/ui";
import { Download, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => setOfflineReady(true)).catch(() => setOfflineReady(false));
    }

    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <Panel className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-emerald-300 text-zinc-950">
          <WifiOff size={18} />
        </span>
        <div>
          <div className="font-bold">Installable PWA</div>
          <div className="text-sm text-zinc-400">{offlineReady ? "Offline shell, cached catalog, and background sync ready." : "Preparing offline support."}</div>
        </div>
      </div>
      {event ? (
        <Button
          onClick={async () => {
            await event.prompt();
            setEvent(null);
          }}
        >
          <Download size={18} /> Install
        </Button>
      ) : (
        <GhostButton disabled>
          <Download size={18} /> Install enabled
        </GhostButton>
      )}
    </Panel>
  );
}
