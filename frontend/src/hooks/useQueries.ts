import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useCreatePairingCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pairingCode: string) => {
      if (!actor) throw new Error('Actor not ready');
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
      return actor.getAllPairingCodes();
    },
    enabled: !!actor && !isFetching,
  });
}
