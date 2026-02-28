import { useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSendVoiceMessage, usePollVoiceMessages } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { AudioMessage } from '@/backend';

interface VoiceMessagePanelProps {
  roomCode: string;
  username: string;
}

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function VoiceMessageItem({ message }: { message: AudioMessage }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        toast.error('Could not play audio');
      });
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-pastel-lavender/10 border border-pastel-lavender/20 hover:bg-pastel-lavender/15 transition-colors">
      <button
        onClick={handlePlay}
        className="w-9 h-9 rounded-full bg-pastel-lavender/30 hover:bg-pastel-lavender/50 flex items-center justify-center transition-colors flex-shrink-0"
        title="Play voice message"
      >
        <Play className="w-4 h-4 text-accent-foreground ml-0.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground truncate">{message.sender}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-pastel-lavender/60"
              style={{ height: `${6 + Math.sin(i * 1.3) * 5}px` }}
            />
          ))}
        </div>
      </div>
      <audio ref={audioRef} src={message.audioData} preload="none" className="hidden" />
    </div>
  );
}

export default function VoiceMessagePanel({ roomCode, username }: VoiceMessagePanelProps) {
  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder();
  const sendVoiceMessage = useSendVoiceMessage();
  const { data: voiceMessages = [] } = usePollVoiceMessages(roomCode, !!roomCode);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [voiceMessages.length]);

  const handleRecordStart = async () => {
    await startRecording();
    if (error) {
      toast.error(error);
    }
  };

  const handleRecordStop = async () => {
    const audioData = await stopRecording();
    if (!audioData) {
      toast.error('No audio recorded');
      return;
    }
    try {
      await sendVoiceMessage.mutateAsync({ roomCode, audioData, sender: username });
      toast.success('Voice message sent!');
    } catch {
      toast.error('Failed to send voice message');
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-pastel-lavender/20 flex items-center justify-center">
          <Mic className="w-3.5 h-3.5 text-accent-foreground" />
        </div>
        <h3 className="font-bold text-sm text-foreground font-display">Voice Messages</h3>
        {voiceMessages.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{voiceMessages.length} msg{voiceMessages.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Messages list */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="space-y-2 pr-1">
          {voiceMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-pastel-lavender/15 flex items-center justify-center mb-3">
                <MicOff className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground/60">No voice messages yet</p>
              <p className="text-xs text-muted-foreground/40 mt-1">Hold the button below to record</p>
            </div>
          ) : (
            voiceMessages.map((msg, idx) => (
              <VoiceMessageItem key={idx} message={msg} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Record button */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/40">
        {sendVoiceMessage.isPending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Sending…
          </div>
        ) : null}
        <Button
          onMouseDown={handleRecordStart}
          onMouseUp={handleRecordStop}
          onTouchStart={(e) => { e.preventDefault(); handleRecordStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); handleRecordStop(); }}
          disabled={sendVoiceMessage.isPending}
          className={`w-full rounded-2xl font-bold transition-all duration-150 ${
            isRecording
              ? 'bg-destructive text-destructive-foreground shadow-lg scale-95 animate-pulse'
              : 'bg-pastel-lavender/30 text-accent-foreground hover:bg-pastel-lavender/50 border border-pastel-lavender/40'
          }`}
          variant="ghost"
        >
          <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-destructive-foreground' : ''}`} />
          {isRecording ? 'Recording… Release to send' : 'Hold to Record'}
        </Button>
        <p className="text-xs text-muted-foreground/50 text-center">
          Press and hold to record a voice message
        </p>
      </div>
    </div>
  );
}
