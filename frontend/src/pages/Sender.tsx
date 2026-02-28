import { useState, useRef } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Send, CheckCircle2, ArrowLeft, Zap, RotateCcw, Type, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSendMessage } from '@/hooks/useQueries';
import { toast } from 'sonner';
import DrawingCanvas, { DrawingCanvasHandle } from '@/components/DrawingCanvas';

type Mode = 'text' | 'draw';

export default function Sender() {
  const search = useSearch({ from: '/sender' }) as { code?: string };
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState(search.code || '');
  const [message, setMessage] = useState('');
  const [lastSent, setLastSent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mode, setMode] = useState<Mode>('text');

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const sendMessage = useSendMessage();

  const handleSend = async () => {
    const code = pairingCode.trim().toUpperCase();

    if (!code) {
      toast.error('Enter a pairing code');
      return;
    }

    let payload: string;

    if (mode === 'text') {
      const text = message.trim();
      if (!text) {
        toast.error('Type a message to send');
        return;
      }
      payload = text;
    } else {
      if (!canvasRef.current || canvasRef.current.isEmpty()) {
        toast.error('Draw something first');
        return;
      }
      payload = canvasRef.current.getDataURL();
    }

    try {
      await sendMessage.mutateAsync({ pairingCode: code, message: payload });
      setLastSent(mode === 'text' ? payload : '[drawing]');
      if (mode === 'text') setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist')) {
        toast.error('Pairing code not found. Ask the recipient to generate one first.');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  const charCount = message.length;
  const maxChars = 500;

  const isSendDisabled =
    sendMessage.isPending ||
    !pairingCode.trim() ||
    (mode === 'text' && !message.trim());

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border/30 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/' })}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-neon" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base leading-tight">Send Message</h1>
              <p className="text-xs text-muted-foreground">Remote Text Widget</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg mx-auto space-y-6">

          {/* Pairing code input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              Pairing Code
            </label>
            <Input
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. ABC123)"
              maxLength={8}
              className="bg-card border-border/50 text-foreground placeholder:text-muted-foreground/40 font-mono text-xl tracking-[0.25em] text-center uppercase focus:border-neon focus:ring-neon/20 h-14"
            />
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border/40">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'text'
                  ? 'bg-neon text-surface shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Type className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setMode('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'draw'
                  ? 'bg-neon text-surface shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Draw
            </button>
          </div>

          {/* Content area */}
          {mode === 'text' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
                  Message
                </label>
                <span className={`text-xs font-mono ${charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground/50'}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                placeholder="Type your message here..."
                rows={6}
                className="bg-card border-border/50 text-foreground placeholder:text-muted-foreground/40 text-lg leading-relaxed resize-none focus:border-neon focus:ring-neon/20"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
                Drawing
              </label>
              <DrawingCanvas ref={canvasRef} />
            </div>
          )}

          {/* Success banner */}
          {showSuccess && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-neon/10 border border-neon/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-5 h-5 text-neon shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-neon">
                  {mode === 'draw' ? 'Drawing sent!' : 'Message sent!'}
                </p>
                {mode === 'text' && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">"{lastSent}"</p>
                )}
              </div>
            </div>
          )}

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={isSendDisabled}
            className="w-full h-14 bg-neon text-surface hover:bg-neon/90 font-black text-lg tracking-wide disabled:opacity-40 transition-all"
          >
            {sendMessage.isPending ? (
              <>
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                {mode === 'draw' ? (
                  <Pencil className="w-5 h-5 mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {mode === 'draw' ? 'Send Drawing' : 'Send to Widget'}
              </>
            )}
          </Button>

          {/* Quick resend (text only) */}
          {lastSent && lastSent !== '[drawing]' && !showSuccess && (
            <button
              onClick={() => { setMode('text'); setMessage(lastSent); }}
              className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <RotateCcw className="w-3 h-3" />
              Resend last message
            </button>
          )}

          {/* Tip */}
          <p className="text-center text-xs text-muted-foreground/50 leading-relaxed">
            The recipient's widget will update automatically within a few seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
