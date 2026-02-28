import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Stroke, AudioMessage } from '@/backend';

// ─── Legacy hooks (kept for backward compat) ───────────────────────────────

export function useCreatePairingCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pairingCode: string) => {
      if (!actor) throw new Error('Actor not ready');
      // @ts-expect-error legacy method
      await actor.createPairingCode(pairingCode);
      return pairingCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairingCodes'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ pairingCode, message }: { pairingCode: string; message: string }) => {
      if (!actor) throw new Error('Actor not ready');
      // @ts-expect-error legacy method
      await actor.sendMessage(pairingCode, message);
    },
  });
}

export function usePollMessage(pairingCode: string, enabled: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['message', pairingCode],
    queryFn: async () => {
      if (!actor) return '';
      try {
        // @ts-expect-error legacy method
        return await actor.pollMessage(pairingCode);
      } catch {
        return '';
      }
    },
    enabled: !!actor && !isFetching && enabled && pairingCode.length > 0,
    refetchInterval: 3000,
    staleTime: 0,
  });
}

export function useRegisterRecipient() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ pairingCode, recipient }: { pairingCode: string; recipient: string }) => {
      if (!actor) throw new Error('Actor not ready');
      // @ts-expect-error legacy method
      await actor.registerRecipient(pairingCode, recipient);
    },
  });
}

export function useGetAllPairingCodes() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['pairingCodes'],
    queryFn: async () => {
      if (!actor) return [];
      // @ts-expect-error legacy method
      return actor.getAllPairingCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Room hooks ─────────────────────────────────────────────────────────────

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomName: string) => {
      if (!actor) throw new Error('Actor not ready');
      const roomCode = await actor.createRoom(roomName);
      return roomCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomCodes'] });
    },
  });
}

export function useJoinRoom() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ roomCode, user }: { roomCode: string; user: string }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.joinRoom(roomCode, user);
    },
  });
}

// ─── Strokes ────────────────────────────────────────────────────────────────

export function useAddStroke() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ roomCode, stroke }: { roomCode: string; stroke: Stroke }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.addStroke(roomCode, stroke);
    },
  });
}

export function usePollStrokes(roomCode: string, enabled: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['strokes', roomCode],
    queryFn: async (): Promise<Stroke[]> => {
      if (!actor || !roomCode) return [];
      try {
        return await actor.getStrokes(roomCode);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled && roomCode.length > 0,
    refetchInterval: 2000,
    staleTime: 0,
  });
}

// ─── Voice messages ─────────────────────────────────────────────────────────

export function useSendVoiceMessage() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      roomCode,
      audioData,
      sender,
    }: {
      roomCode: string;
      audioData: string;
      sender: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const message: AudioMessage = {
        sender,
        audioData,
        timestamp: BigInt(Date.now()),
      };
      await actor.addAudioMessage(roomCode, message);
    },
  });
}

export function usePollVoiceMessages(roomCode: string, enabled: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['voiceMessages', roomCode],
    queryFn: async (): Promise<AudioMessage[]> => {
      if (!actor || !roomCode) return [];
      try {
        return await actor.getAudioMessages(roomCode);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled && roomCode.length > 0,
    refetchInterval: 3000,
    staleTime: 0,
  });
}
