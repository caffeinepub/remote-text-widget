import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Smartphone, Send, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreatePairingCode } from '@/hooks/useQueries';
import { toast } from 'sonner';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'sender' | 'recipient'>('choose');
  const [senderCode, setSenderCode] = useState('');
  const [recipientCode, setRecipientCode] = useState('');
  const [recipientCodeCreated, setRecipientCodeCreated] = useState(false);

  const createPairingCode = useCreatePairingCode();

  const handleSenderContinue = async () => {
    const code = senderCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      toast.error('Enter a valid pairing code');
      return;
    }
    navigate({ to: '/sender', search: { code } });
  };

  const handleGenerateRecipientCode = async () => {
    const code = generateCode();
    try {
      await createPairingCode.mutateAsync(code);
      setRecipientCode(code);
      setRecipientCodeCreated(true);
    } catch (err: unknown) {
      // If code already exists (unlikely), try again
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        toast.error('Code collision, please try again');
      } else {
        toast.error('Failed to create pairing code');
      }
    }
  };

  const handleRecipientContinue = () => {
    if (!recipientCode || !recipientCodeCreated) {
      toast.error('Generate a pairing code first');
      return;
    }
    navigate({ to: '/recipient', search: { code: recipientCode } });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-surface">
      {/* Hero */}
      <div className="w-full max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-semibold tracking-widest uppercase mb-6">
          <Zap className="w-3 h-3" />
          Real-time text widget
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-foreground mb-4 leading-none">
          Write on<br />
          <span className="text-neon">any screen</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Send text to another device instantly. Open the widget on their phone, pair with a code, and start typing.
        </p>
      </div>

      {/* Hero image */}
      <div className="mb-10 w-full max-w-sm mx-auto">
        <img
          src="/assets/generated/phone-widget-hero.dim_600x400.png"
          alt="Phone widget preview"
          className="w-full rounded-2xl border border-border/30 shadow-glow object-cover"
        />
      </div>

      {/* Mode selection */}
      {mode === 'choose' && (
        <div className="w-full max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('sender')}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/40 bg-card hover:border-neon/60 hover:bg-neon/5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-neon/10 flex items-center justify-center group-hover:bg-neon/20 transition-colors">
              <Send className="w-6 h-6 text-neon" />
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground text-lg">Send a Message</div>
              <div className="text-sm text-muted-foreground mt-1">Type text to display on another device</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neon opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => setMode('recipient')}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/40 bg-card hover:border-electric/60 hover:bg-electric/5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center group-hover:bg-electric/20 transition-colors">
              <Smartphone className="w-6 h-6 text-electric" />
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground text-lg">Display Widget</div>
              <div className="text-sm text-muted-foreground mt-1">Show incoming messages on this screen</div>
            </div>
            <ArrowRight className="w-4 h-4 text-electric opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}

      {/* Sender flow */}
      {mode === 'sender' && (
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-neon/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-neon" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">Send a Message</h2>
                <p className="text-xs text-muted-foreground">Enter the pairing code from the recipient's device</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Pairing Code</label>
              <Input
                value={senderCode}
                onChange={(e) => setSenderCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={8}
                className="bg-surface border-border/50 text-foreground placeholder:text-muted-foreground/50 font-mono text-lg tracking-widest text-center uppercase focus:border-neon focus:ring-neon/20"
                onKeyDown={(e) => e.key === 'Enter' && handleSenderContinue()}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => setMode('choose')}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Back
              </Button>
              <Button
                onClick={handleSenderContinue}
                className="flex-1 bg-neon text-surface hover:bg-neon/90 font-bold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recipient flow */}
      {mode === 'recipient' && (
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-electric/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-electric" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">Display Widget</h2>
                <p className="text-xs text-muted-foreground">Generate a code and share it with the sender</p>
              </div>
            </div>

            {!recipientCodeCreated ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a unique pairing code. Share it with whoever will be sending you messages.
                </p>
                <Button
                  onClick={handleGenerateRecipientCode}
                  disabled={createPairingCode.isPending}
                  className="w-full bg-electric text-surface hover:bg-electric/90 font-bold"
                >
                  {createPairingCode.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Generate Pairing Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Pairing Code</p>
                  <div className="inline-block px-6 py-4 rounded-xl bg-electric/10 border-2 border-electric/40">
                    <span className="font-mono text-4xl font-black tracking-[0.3em] text-electric">
                      {recipientCode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Share this code with the sender. Keep this page open.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecipientCodeCreated(false);
                    setRecipientCode('');
                  }}
                  className="w-full text-muted-foreground hover:text-foreground text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Generate new code
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => { setMode('choose'); setRecipientCodeCreated(false); setRecipientCode(''); }}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Back
              </Button>
              <Button
                onClick={handleRecipientContinue}
                disabled={!recipientCodeCreated}
                className="flex-1 bg-electric text-surface hover:bg-electric/90 font-bold disabled:opacity-40"
              >
                Open Widget
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
