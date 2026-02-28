import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Copy, Check, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CollaborativeCanvas from '@/components/CollaborativeCanvas';
import VoiceMessagePanel from '@/components/VoiceMessagePanel';
import { useJoinRoom } from '@/hooks/useQueries';

export default function Room() {
  const { code: roomCode } = useParams({ from: '/room/$code' });
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [copied, setCopied] = useState(false);

  const joinRoom = useJoinRoom();

  // If we already have a username stored for this room, auto-join
  useEffect(() => {
    const stored = sessionStorage.getItem(`room-${roomCode}-username`);
    if (stored) {
      setUsername(stored);
      setHasJoined(true);
    }
  }, [roomCode]);

  const handleJoin = async () => {
    const name = nameInput.trim();
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await joinRoom.mutateAsync({ roomCode, user: name });
      sessionStorage.setItem(`room-${roomCode}-username`, name);
      setUsername(name);
      setHasJoined(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist')) {
        toast.error('Room not found. Check the code and try again.');
      } else {
        toast.error('Failed to join room');
      }
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  // ── Join screen ──────────────────────────────────────────────────────────
  if (!hasJoined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-background relative overflow-hidden">
        {/* Doodle background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/assets/generated/chat-doodles.dim_800x600.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '480px auto',
            opacity: 0.07,
          }}
        />
        <div className="pointer-events-none absolute top-0 left-0 w-72 h-72 rounded-full bg-pastel-mint/20 blur-3xl -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-pastel-lavender/20 blur-3xl translate-x-1/3 translate-y-1/3 z-0" />

        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="rounded-3xl border-2 border-pastel-mint/30 bg-card p-7 space-y-5 shadow-card">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pastel-mint/20 mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-black text-2xl text-foreground font-display">Join Room</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Room code:{' '}
                <span className="font-mono font-bold text-primary">{roomCode}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                Your Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. Alex"
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-pastel-mint/40 bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-sm font-semibold"
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={joinRoom.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/85 font-bold rounded-2xl shadow-pastel"
            >
              {joinRoom.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Enter Room
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/' })}
              className="w-full text-muted-foreground hover:text-foreground rounded-2xl text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Room UI ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          className="w-8 h-8 text-muted-foreground hover:text-foreground rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-pastel-mint animate-pulse flex-shrink-0" />
          <span className="text-sm font-bold text-foreground truncate font-display">
            Drawing Room
          </span>
        </div>

        {/* Room code badge */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pastel-mint/15 border border-pastel-mint/30 hover:bg-pastel-mint/25 transition-colors"
          title="Copy room code"
        >
          <span className="font-mono text-xs font-bold text-primary tracking-widest">
            {roomCode}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-primary" />
          ) : (
            <Copy className="w-3 h-3 text-primary/60" />
          )}
        </button>

        {/* Username badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pastel-lavender/15 border border-pastel-lavender/30">
          <Users className="w-3 h-3 text-accent-foreground/70" />
          <span className="text-xs font-semibold text-accent-foreground truncate max-w-[80px]">
            {username}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          <CollaborativeCanvas
            roomCode={roomCode}
            className="flex-1 flex flex-col"
          />
        </div>

        {/* Voice panel */}
        <div className="lg:w-72 xl:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-border/40 bg-card/40">
          <div className="flex-1 p-4 flex flex-col min-h-0" style={{ maxHeight: '420px' }}>
            <VoiceMessagePanel roomCode={roomCode} username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}
