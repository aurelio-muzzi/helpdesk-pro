import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { TICKET_KEYS } from './useTickets';
import type { CreateCommentPayload } from '../types';

export const COMMENT_KEYS = {
  list: (ticketId: number) => ['tickets', ticketId, 'comments'] as const,
};

export const useTicketComments = (ticketId: number | undefined) => {
  return useQuery({
    queryKey: ticketId ? COMMENT_KEYS.list(ticketId) : ['tickets', 0, 'comments'],
    queryFn: () => (ticketId ? commentService.getComments(ticketId) : Promise.resolve([])),
    enabled: Boolean(ticketId),
  });
};

export const useAddComment = (ticketId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => {
      if (!ticketId) throw new Error('Ticket ID não informado');
      return commentService.addComment(ticketId, payload);
    },
    onSuccess: () => {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(ticketId) });
        queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      }
    },
  });
};
