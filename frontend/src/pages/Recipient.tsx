import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Smartphone, ArrowLeft, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePollMessage, useRegisterRecipient } from '@/hooks/useQueries';

function isDrawingPayload(msg: string): boolean {
  return msg.startsWith('data:image/');
}

export default function Recipient() {
  const search = useSearch({ from: '/recipient' }) as { code?: string };
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState(search.code || '');
  const [activeCode, setActiveCode] = useState(search.code || '');
  const [registered, setRegistered] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const registerRecipient = useRegisterRecipient();
  const { data: message, isError, isFetching, dataUpdatedAt } = usePollMessage(activeCode, registered);

  // Auto-register if code came from URL
  useEffect(() => {
    if (search.code && !registered) {
      handleActivate(search.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const handleActivate = async (code?: string) => {
    const c = (code || pairingCode).trim().toUpperCase();
    if (!c) return;
    try {
      await registerRecipient.mutateAsync({ pairingCode: c, recipient: 'widget' });
      setActiveCode(c);
      setRegistered(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist')) {
        // Code might not exist yet, still try to poll
        setActiveCode(c);
        setRegistered(true);
      }
    }
  };

  const displayMessage = message && message.trim() !== '' ? message : null;
  const isDrawing = displayMessage ? isDrawingPayload(displayMessage) : false;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!registered) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-surface">
        <header className="border-b border-border/30 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/' })}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-electric" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-base leading-tight">Display Widget</h1>
                <p className="text-xs text-muted-foreground">Remote Text Widget</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-electric" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">Enter Pairing Code</h2>
              <p className="text-sm text-muted-foreground">Enter the code to start receiving messages on this screen</p>
            </div>
            <Input
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={8}
              className="bg-card border-border/50 text-foreground placeholder:text-muted-foreground/40 font-mono text-2xl tracking-[0.3em] text-center uppercase focus:border-electric focus:ring-electric/20 h-16"
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
            />
            <Button
              onClick={() => handleActivate()}
              disabled={registerRecipient.isPending || !pairingCode.trim()}
              className="w-full h-14 bg-electric text-surface hover:bg-electric/90 font-black text-lg disabled:opacity-40"
            >
              {registerRecipient.isPending ? 'Connecting...' : 'Start Widget'}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Full-screen widget display
  return (
    <div className="fixed inset-0 bg-widget flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-widget-surface/80 backdrop-blur-sm border-b border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setRegistered(false); navigate({ to: '/' }); }}
          className="text-white/40 hover:text-white/80 text-xs gap-1.5 h-8 px-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/40 tracking-widest">{activeCode}</span>
          <div className={`flex items-center gap-1.5 text-xs ${isError ? 'text-red-400' : 'text-electric'}`}>
            {isError ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className={`w-3.5 h-3.5 ${isFetching ? 'animate-pulse' : ''}`} />
            )}
            <span className="hidden sm:inline">{isError ? 'Disconnected' : 'Live'}</span>
          </div>
        </div>
      </div>

      {/* Message / Drawing display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-hidden">
        {displayMessage ? (
          isDrawing ? (
            <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
              <img
                src={displayMessage}
                alt="Drawing"
                className="max-w-full max-h-full object-contain rounded-xl"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          ) : (
            <div className="w-full max-w-2xl text-center animate-in fade-in zoom-in-95 duration-500">
              <p className="text-widget font-black leading-tight break-words">
                {displayMessage}
              </p>
            </div>
          )
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <Smartphone className="w-10 h-10 text-white/20" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white/30">Waiting for message...</p>
              <p className="text-sm text-white/20 mt-2">Share code <span className="font-mono text-electric/60">{activeCode}</span> with the sender</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-widget-surface/80 backdrop-blur-sm border-t border-white/5">
        <Clock className="w-3 h-3 text-white/20" />
        <span className="text-xs text-white/20">
          {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Polling every 3s...'}
        </span>
      </div>
    </div>
  );
}
