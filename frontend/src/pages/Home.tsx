import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PenLine, Users, ArrowRight, Loader2, Sparkles, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRoom } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const createRoom = useCreateRoom();

  const handleCreateRoom = async () => {
    const name = roomName.trim() || 'My Room';
    try {
      const code = await createRoom.mutateAsync(name);
      toast.success(`Room created! Code: ${code}`);
      navigate({ to: '/room/$code', params: { code } });
    } catch {
      toast.error('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a room code');
      return;
    }
    navigate({ to: '/room/$code', params: { code } });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-background relative overflow-hidden">

      {/* Doodle background layer */}
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

      {/* Decorative pastel blobs */}
      <div className="pointer-events-none absolute top-0 left-0 w-72 h-72 rounded-full bg-pastel-mint/20 blur-3xl -translate-x-1/2 -translate-y-1/2 z-0" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-pastel-pink/20 blur-3xl translate-x-1/3 translate-y-1/3 z-0" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-56 h-56 rounded-full bg-pastel-lavender/20 blur-3xl translate-x-1/2 -translate-y-1/2 z-0" aria-hidden="true" />

      {/* Doodle one — decorative accent, bottom-left */}
      <img
        src="/assets/generated/doodle-one.dim_400x400.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-6 w-40 h-40 object-contain opacity-20 rotate-[-12deg] z-0 select-none"
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Hero */}
        <div className="w-full max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-mint/20 border border-pastel-mint/40 text-primary text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Collaborative Drawing Rooms
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-foreground mb-4 leading-none font-display">
            Draw together,<br />
            <span className="text-primary">in real time</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Create a room, share the code, and draw with friends. Send voice messages while you collaborate.
          </p>
        </div>

        {/* Mode selection */}
        {mode === 'choose' && (
          <div className="w-full max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('create')}
              className="group flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-pastel-mint/30 bg-card hover:border-pastel-mint/70 hover:bg-pastel-mint/10 transition-all duration-200 cursor-pointer shadow-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-pastel-mint/20 flex items-center justify-center group-hover:bg-pastel-mint/35 transition-colors animate-float">
                <PenLine className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground text-lg font-display">Create Room</div>
                <div className="text-sm text-muted-foreground mt-1">Start a new drawing session</div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => setMode('join')}
              className="group flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-pastel-lavender/30 bg-card hover:border-pastel-lavender/70 hover:bg-pastel-lavender/10 transition-all duration-200 cursor-pointer shadow-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-pastel-lavender/20 flex items-center justify-center group-hover:bg-pastel-lavender/35 transition-colors animate-float" style={{ animationDelay: '0.5s' }}>
                <Users className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground text-lg font-display">Join Room</div>
                <div className="text-sm text-muted-foreground mt-1">Enter with a room code</div>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Create Room flow */}
        {mode === 'create' && (
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-3xl border-2 border-pastel-mint/30 bg-card p-6 space-y-5 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-pastel-mint/20 flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg font-display">Create a Room</h2>
                  <p className="text-xs text-muted-foreground">Give your room a name to get started</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Room Name</label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Friday Doodles"
                  maxLength={40}
                  className="bg-background border-2 border-pastel-mint/40 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 rounded-2xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setMode('choose')}
                  className="flex-1 text-muted-foreground hover:text-foreground rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={createRoom.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/85 font-bold rounded-2xl shadow-pastel"
                >
                  {createRoom.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <PenLine className="w-4 h-4 mr-2" />
                  )}
                  Create Room
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room flow */}
        {mode === 'join' && (
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-3xl border-2 border-pastel-lavender/30 bg-card p-6 space-y-5 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-pastel-lavender/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg font-display">Join a Room</h2>
                  <p className="text-xs text-muted-foreground">Enter the room code shared with you</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Room Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Paste room code here"
                  className="bg-background border-2 border-pastel-lavender/40 text-foreground placeholder:text-muted-foreground/50 font-mono text-base tracking-widest text-center focus:border-accent focus:ring-accent/20 rounded-2xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setMode('choose')}
                  className="flex-1 text-muted-foreground hover:text-foreground rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/80 font-bold rounded-2xl shadow-pastel"
                >
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hint */}
        {mode === 'choose' && (
          <div className="mt-10 flex items-center gap-2 text-muted-foreground/50 text-xs">
            <Hash className="w-3.5 h-3.5" />
            <span>Share a room code to draw together</span>
            <Hash className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
